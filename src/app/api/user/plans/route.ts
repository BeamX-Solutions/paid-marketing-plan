import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's plans
    const plans = await prisma.plan.findMany({
      where: {
        user: { email: session.user.email }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        completionPercentage: true,
        creditsCharged: true,
        createdAt: true,
        completedAt: true,
        businessContext: true
      }
    });

    // Parse business context to get business name
    const plansWithDetails = plans.map(plan => {
      let businessName = 'Unnamed Business';
      try {
        const context = JSON.parse(plan.businessContext);
        businessName = context.businessName || context.industry || 'Unnamed Business';
      } catch (e) {
        // Keep default name
      }

      return {
        id: plan.id,
        businessName,
        status: plan.status,
        completionPercentage: plan.completionPercentage,
        creditsCharged: plan.creditsCharged || 0,
        createdAt: plan.createdAt.toISOString(),
        completedAt: plan.completedAt?.toISOString()
      };
    });

    return NextResponse.json({ plans: plansWithDetails });

  } catch (error) {
    console.error('Error fetching user plans:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
