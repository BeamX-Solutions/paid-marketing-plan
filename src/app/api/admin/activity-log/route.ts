import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Fetch admin actions and total count in parallel
    const [adminActions, totalCount] = await Promise.all([
      prisma.adminAction.findMany({
        take: limit,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          admin: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          targetUser: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.adminAction.count(),
    ]);

    // Transform data for frontend
    const logs = adminActions.map((action: any) => ({
      id: action.id,
      action: action.action,
      adminEmail: action.admin.email,
      adminName: `${action.admin.firstName || ''} ${action.admin.lastName || ''}`.trim(),
      targetUserEmail: action.targetUser?.email || null,
      targetUserName: action.targetUser
        ? `${action.targetUser.firstName || ''} ${action.targetUser.lastName || ''}`.trim()
        : null,
      details: action.details,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      createdAt: action.createdAt.toISOString(),
    }));

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
