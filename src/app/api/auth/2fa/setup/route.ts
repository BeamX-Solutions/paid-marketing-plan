/**
 * POST /api/auth/2fa/setup
 * Generate 2FA secret and QR code for user to scan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generate2FASecret } from '@/lib/2fa/totp-service';
import prisma from '@/lib/prisma';

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

    // Prevent re-setup if already enabled (user must disable first)
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        {
          error: '2FA is already enabled. Please disable it first to re-setup.',
          alreadyEnabled: true,
        },
        { status: 400 }
      );
    }

    // Generate 2FA secret and QR code
    const { secret, otpauthUrl, qrCodeDataUrl } = await generate2FASecret(user.email);

    // Return secret and QR code (secret is temporarily stored in client session)
    // Will be saved to database only after successful verification
    return NextResponse.json({
      secret,
      otpauthUrl,
      qrCodeDataUrl,
      message: 'Scan the QR code with your authenticator app and enter the code to verify',
    });
  } catch (error) {
    console.error('Error generating 2FA setup:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate 2FA setup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
