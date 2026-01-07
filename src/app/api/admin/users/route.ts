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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { businessName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          industry: true,
          role: true,
          status: true,
          permissions: true,
          createdAt: true,
          lastLoginAt: true,
          creditPurchases: {
            where: {
              status: 'active',
              expiresAt: { gte: new Date() },
            },
            select: {
              creditsRemaining: true,
            },
          },
          _count: {
            select: {
              plans: true,
              creditPurchases: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate credit balance for each user and parse permissions
    const usersWithBalance = users.map((user: any) => ({
      ...user,
      creditBalance: user.creditPurchases.reduce((sum: any, p: any) => sum + p.creditsRemaining, 0),
      permissions: user.permissions ? JSON.parse(user.permissions) : {},
      creditPurchases: undefined, // Remove the raw data
    }));

    return NextResponse.json({
      users: usersWithBalance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
