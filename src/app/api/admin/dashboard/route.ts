import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('dateFilter') || 'month';
    const country = searchParams.get('country') || '';
    const industry = searchParams.get('industry') || '';
    const customStartDate = searchParams.get('startDate') || '';
    const customEndDate = searchParams.get('endDate') || '';

    // Calculate date range based on filter
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    const now = new Date();

    switch (dateFilter) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate);
        if (customEndDate) {
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'all-time':
      default:
        // No date filtering for all-time
        break;
    }

    // Build filter conditions for filtered view
    const filteredWhere: any = {};

    if (startDate && endDate) {
      filteredWhere.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (country) {
      filteredWhere.country = country;
    }

    if (industry) {
      filteredWhere.industry = industry;
    }

    // Fetch all-time metrics
    const allTimeUsers = await prisma.user.count();
    const allTimeActiveUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    });

    const allTimePlans = await prisma.plan.count();
    const allTimeCompletedPlans = await prisma.plan.count({
      where: { status: 'completed' },
    });

    const allTimeCreditPurchases = await prisma.creditPurchase.findMany({
      select: {
        amountPaid: true,
        creditsGranted: true,
        creditsRemaining: true,
      },
    });

    const allTimeTotalRevenue = allTimeCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + purchase.amountPaid,
      0
    ) / 100; // Convert from kobo to Naira

    const allTimeTotalCreditsGranted = allTimeCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + purchase.creditsGranted,
      0
    );

    const allTimeTotalCreditsUsed = allTimeCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + (purchase.creditsGranted - purchase.creditsRemaining),
      0
    );

    // Fetch filtered metrics
    const filteredUsers = await prisma.user.count({ where: filteredWhere });

    const filteredActiveUsers = await prisma.user.count({
      where: {
        ...filteredWhere,
        status: 'ACTIVE',
      },
    });

    // For plans, we need to filter by plan createdAt
    const planFilteredWhere: any = {};
    if (startDate && endDate) {
      planFilteredWhere.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    if (country || industry) {
      // Join with user to filter by country/industry
      planFilteredWhere.user = {};
      if (country) planFilteredWhere.user.country = country;
      if (industry) planFilteredWhere.user.industry = industry;
    }

    const filteredPlans = await prisma.plan.count({ where: planFilteredWhere });
    const filteredCompletedPlans = await prisma.plan.count({
      where: {
        ...planFilteredWhere,
        status: 'completed',
      },
    });

    // For credit purchases, filter by purchase date
    const creditPurchaseFilteredWhere: any = {};
    if (startDate && endDate) {
      creditPurchaseFilteredWhere.purchaseDate = {
        gte: startDate,
        lte: endDate,
      };
    }
    if (country || industry) {
      creditPurchaseFilteredWhere.user = {};
      if (country) creditPurchaseFilteredWhere.user.country = country;
      if (industry) creditPurchaseFilteredWhere.user.industry = industry;
    }

    const filteredCreditPurchases = await prisma.creditPurchase.findMany({
      where: creditPurchaseFilteredWhere,
      select: {
        amountPaid: true,
        creditsGranted: true,
        creditsRemaining: true,
      },
    });

    const filteredTotalRevenue = filteredCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + purchase.amountPaid,
      0
    ) / 100; // Convert from kobo to Naira

    const filteredTotalCreditsGranted = filteredCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + purchase.creditsGranted,
      0
    );

    const filteredTotalCreditsUsed = filteredCreditPurchases.reduce(
      (sum: any, purchase: any) => sum + (purchase.creditsGranted - purchase.creditsRemaining),
      0
    );

    // Return structured data
    return NextResponse.json({
      allTime: {
        totalUsers: allTimeUsers,
        activeUsers: allTimeActiveUsers,
        totalPlans: allTimePlans,
        completedPlans: allTimeCompletedPlans,
        totalRevenue: allTimeTotalRevenue,
        totalCreditsUsed: allTimeTotalCreditsUsed,
        totalCreditsGranted: allTimeTotalCreditsGranted,
      },
      filtered: {
        totalUsers: filteredUsers,
        activeUsers: filteredActiveUsers,
        totalPlans: filteredPlans,
        completedPlans: filteredCompletedPlans,
        totalRevenue: filteredTotalRevenue,
        totalCreditsUsed: filteredTotalCreditsUsed,
        totalCreditsGranted: filteredTotalCreditsGranted,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
