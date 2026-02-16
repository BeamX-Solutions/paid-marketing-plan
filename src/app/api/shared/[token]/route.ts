import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 32) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const plan = await prisma.plan.findFirst({
      where: {
        shareToken: token,
        status: 'completed',
      },
      include: {
        user: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Return only safe, public-facing data
    const publicPlan = {
      id: plan.id,
      generatedContent: plan.generatedContent
        ? JSON.parse(plan.generatedContent as string)
        : null,
      businessContext: plan.businessContext
        ? (() => {
            const ctx = JSON.parse(plan.businessContext as string);
            return { industry: ctx.industry, businessName: ctx.businessName };
          })()
        : null,
      createdAt: plan.createdAt.toISOString(),
      businessName: plan.user?.businessName || null,
    };

    return NextResponse.json(publicPlan);
  } catch (error) {
    console.error('Error fetching shared plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}
