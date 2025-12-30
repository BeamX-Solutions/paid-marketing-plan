import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentSuperAdmin, logAdminAction } from '@/lib/admin-logger';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current super admin user
    let admin;
    try {
      admin = await getCurrentSuperAdmin();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
          );
        }
        if (error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
          return NextResponse.json(
            { error: 'Forbidden - Only super admin can change user roles' },
            { status: 403 }
          );
        }
      }
      throw error;
    }

    // Get request body
    const body = await request.json();
    const { role } = body;

    if (!role || (role !== 'USER' && role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER or ADMIN' },
        { status: 400 }
      );
    }

    // Prevent promotion to SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot promote users to super admin' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent changing own role
    if (targetUser.id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    // Prevent changing super admin role
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin role cannot be changed' },
        { status: 403 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      action: role === 'ADMIN' ? 'GRANT_ADMIN_ACCESS' : 'REVOKE_ADMIN_ACCESS',
      targetUserId: userId,
      details: `Changed role from ${targetUser.role} to ${role} for ${targetUser.email}`,
      request,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
