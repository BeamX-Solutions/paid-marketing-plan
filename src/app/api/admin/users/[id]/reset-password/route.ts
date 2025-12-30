import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentAdmin, logAdminAction } from '@/lib/admin-logger';
import { hash } from 'bcryptjs';
import { logSecurityEvent } from '@/lib/security/event-logger';

const prisma = new PrismaClient();

/**
 * Generate a random secure password
 */
function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char

  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current admin user
    const admin = await getCurrentAdmin();
    const { id: userId } = await params;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        businessName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    const hashedPassword = await hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Optionally force password change on next login
        // passwordChangeRequired: true, // if you have this field
      },
    });

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      action: 'PASSWORD_RESET',
      targetUserId: userId,
      details: `Reset password for ${targetUser.email}`,
      request,
    });

    // Log security event
    await logSecurityEvent({
      eventType: 'password_reset',
      severity: 'medium',
      userId: targetUser.id,
      ipAddress: 'admin_action',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        resetBy: admin.email,
        adminId: admin.id,
        reason: 'admin_initiated_reset',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: newPassword, // Return to admin to share with user
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.businessName || `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim(),
      },
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
