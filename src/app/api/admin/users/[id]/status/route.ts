import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const { status, reason } = await request.json();

    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admins from suspending themselves
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own status' },
        { status: 403 }
      );
    }

    // Prevent changing super admin status
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change super admin status' },
        { status: 403 }
      );
    }

    // Update user status and log action
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { status },
      }),
      prisma.adminAction.create({
        data: {
          adminId: session.user.id,
          action: 'UPDATE_USER_STATUS',
          targetUserId: id,
          details: JSON.stringify({
            oldStatus: user.status,
            newStatus: status,
            reason,
          }),
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      }),
    ]);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
