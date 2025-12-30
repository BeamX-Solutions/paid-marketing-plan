import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';
import { getCurrentAdmin, logAdminAction } from '@/lib/admin-logger';
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rate-limit';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        plans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        creditPurchases: {
          orderBy: { purchaseDate: 'desc' },
          take: 10,
        },
        creditTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            plans: true,
            creditPurchases: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, RATE_LIMIT_CONFIGS.userDeletion);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Get current admin user
    const admin = await getCurrentAdmin();
    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting self
    if (user.id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deleting SUPER_ADMIN users
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete Super Admin users' },
        { status: 403 }
      );
    }

    // Delete the user (Prisma cascade will delete related records)
    await prisma.user.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction({
      adminId: admin.id,
      action: 'DELETE_USER',
      targetUserId: id,
      details: `Deleted user: ${user.email}`,
      request,
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
