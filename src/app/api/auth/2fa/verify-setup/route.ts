/**
 * POST /api/auth/2fa/verify-setup
 * Verify first 2FA code and enable 2FA for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyTOTPToken, encryptSecretForStorage } from '@/lib/2fa/totp-service';
import { generateBackupCodes, prepareBackupCodesForStorage } from '@/lib/2fa/backup-codes';
import { logAdminAction } from '@/lib/admin-logger';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Request body validation schema
const verifySetupSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z.string()
    .regex(/^\d{6}$/, 'Token must be 6 digits')
    .length(6, 'Token must be exactly 6 digits'),
});

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

    // Only allow admin users to enable 2FA
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - 2FA is only available for admin users' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verifySetupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { secret, token } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the token against the provided secret
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid verification code',
          message: 'The code you entered is incorrect. Please try again.',
        },
        { status: 400 }
      );
    }

    // Token is valid - enable 2FA

    // 1. Encrypt secret for storage
    const encryptedSecret = encryptSecretForStorage(secret);

    // 2. Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const backupCodesJson = await prepareBackupCodesForStorage(backupCodes);

    // 3. Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: backupCodesJson,
        twoFactorSetupAt: new Date(),
      },
    });

    // 4. Log admin action
    await logAdminAction({
      adminId: user.id,
      action: '2FA_ENABLED',
      targetUserId: user.id,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // 5. Return success with backup codes (shown only once!)
    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled',
      backupCodes,
      warning: 'Save these backup codes in a safe place. They will only be shown once.',
    });
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    return NextResponse.json(
      {
        error: 'Failed to enable 2FA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
