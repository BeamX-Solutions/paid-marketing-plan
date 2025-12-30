/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code during login (TOTP token or backup code)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyTOTPTokenWithEncrypted } from '@/lib/2fa/totp-service';
import { verifyBackupCode } from '@/lib/2fa/backup-codes';
import { logAdminAction } from '@/lib/admin-logger';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Request body validation schema
const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  useBackupCode: z.boolean().optional().default(false),
});

// Rate limiting map (in-memory, resets on server restart)
// In production, use Redis or database
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Check if user has exceeded rate limit
 */
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record || now > record.resetAt) {
    // No record or expired - reset
    rateLimitMap.set(userId, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return true;
  }

  // Increment attempts
  record.attempts++;
  return false;
}

/**
 * Reset rate limit for user (on successful verification)
 */
function resetRateLimit(userId: string): void {
  rateLimitMap.delete(userId);
}

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, useBackupCode } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        {
          error: '2FA is not enabled for this account',
          message: 'Please set up 2FA first',
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (isRateLimited(user.id)) {
      await logAdminAction({
        adminId: user.id,
        action: '2FA_RATE_LIMITED',
        targetUserId: user.id,
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          reason: 'Too many failed 2FA attempts',
        }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        {
          error: 'Too many failed attempts',
          message: 'Please try again in 15 minutes',
        },
        { status: 429 }
      );
    }

    let isValid = false;
    let updatedBackupCodes: string | null = null;
    let remainingBackupCodes = 0;
    let usedBackupCode = false;

    if (useBackupCode) {
      // Verify backup code
      if (!user.twoFactorBackupCodes) {
        return NextResponse.json(
          {
            error: 'No backup codes available',
            message: 'Backup codes have not been generated',
          },
          { status: 400 }
        );
      }

      const result = await verifyBackupCode(token, user.twoFactorBackupCodes);
      isValid = result.isValid;
      updatedBackupCodes = result.updatedCodesJson;
      remainingBackupCodes = result.remainingCodes;
      usedBackupCode = true;
    } else {
      // Verify TOTP token
      if (!user.twoFactorSecret) {
        return NextResponse.json(
          {
            error: '2FA secret not found',
            message: 'Please set up 2FA again',
          },
          { status: 400 }
        );
      }

      isValid = verifyTOTPTokenWithEncrypted(token, user.twoFactorSecret);
    }

    if (!isValid) {
      // Log failed attempt
      await logAdminAction({
        adminId: user.id,
        action: '2FA_VERIFICATION_FAILED',
        targetUserId: user.id,
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          useBackupCode,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        {
          error: 'Invalid verification code',
          message: useBackupCode
            ? 'Invalid backup code or code already used'
            : 'The code you entered is incorrect',
        },
        { status: 400 }
      );
    }

    // Verification successful!

    // Update backup codes if a backup code was used
    if (usedBackupCode && updatedBackupCodes) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorBackupCodes: updatedBackupCodes,
        },
      });
    }

    // Reset rate limit
    resetRateLimit(user.id);

    // Log successful verification
    await logAdminAction({
      adminId: user.id,
      action: '2FA_VERIFICATION_SUCCESS',
      targetUserId: user.id,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        useBackupCode,
        remainingBackupCodes: usedBackupCode ? remainingBackupCodes : undefined,
      }),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
      usedBackupCode,
      remainingBackupCodes: usedBackupCode ? remainingBackupCodes : undefined,
      warning:
        usedBackupCode && remainingBackupCodes < 3
          ? 'You have fewer than 3 backup codes remaining. Please regenerate new codes.'
          : undefined,
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify 2FA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
