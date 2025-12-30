import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30';
    const rangeDate = new Date();
    rangeDate.setDate(rangeDate.getDate() - parseInt(timeRange));

    // User metrics
    const [totalUsers, activeUsers, suspendedUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { createdAt: { gte: rangeDate } } }),
    ]);

    // Plan metrics
    const [totalPlans, completedPlans, plansInRange] = await Promise.all([
      prisma.plan.count(),
      prisma.plan.count({ where: { status: 'completed' } }),
      prisma.plan.count({ where: { createdAt: { gte: rangeDate } } }),
    ]);

    // Revenue metrics
    const [totalRevenue, revenueInRange] = await Promise.all([
      prisma.creditPurchase.aggregate({
        _sum: { amountPaid: true },
        where: { status: 'active' },
      }),
      prisma.creditPurchase.aggregate({
        _sum: { amountPaid: true },
        where: {
          status: 'active',
          createdAt: { gte: rangeDate },
        },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        new: newUsers,
      },
      plans: {
        total: totalPlans,
        completed: completedPlans,
        newInRange: plansInRange,
      },
      revenue: {
        total: (totalRevenue._sum.amountPaid || 0) / 100,
        inRange: (revenueInRange._sum.amountPaid || 0) / 100,
        mrr: 0, // Calculate based on active subscriptions
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
