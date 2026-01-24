import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import authOptions from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { password, confirmEmail } = body;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify email confirmation
    if (confirmEmail !== user.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match your account email' },
        { status: 400 }
      );
    }

    // Verify password for accounts with password
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required to delete your account' },
          { status: 400 }
        );
      }

      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 401 }
        );
      }
    }

    // Prevent admin/super admin from deleting their accounts via this endpoint
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted through this endpoint. Please contact support.' },
        { status: 403 }
      );
    }

    // Check for active subscriptions or credits
    const activePurchases = await prisma.creditPurchase.count({
      where: {
        userId: userId,
        status: 'active',
        creditsRemaining: {
          gt: 0,
        },
      },
    });

    if (activePurchases > 0) {
      return NextResponse.json(
        {
          error: 'You have active credits. Please use them or contact support to request a refund before deleting your account.',
          activeCredits: true,
        },
        { status: 400 }
      );
    }

    // Log deletion for audit purposes (before deleting)
    await prisma.securityEvent.create({
      data: {
        eventType: 'account_deletion',
        severity: 'medium',
        userId: userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: JSON.stringify({
          email: user.email,
          deletedAt: new Date().toISOString(),
          reason: 'user_requested',
        }),
      },
    });

    // Delete user account (cascades will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Your account has been successfully deleted. We\'re sorry to see you go!',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
