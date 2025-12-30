import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: planId } = await params;

    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        user: { email: session.user.email }
      },
      include: {
        user: true,
        claudeInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedPlan = {
      ...plan,
      generatedContent: plan.generatedContent ? JSON.parse(plan.generatedContent as string) : null,
      businessContext: plan.businessContext ? JSON.parse(plan.businessContext as string) : null,
      questionnaireResponses: plan.questionnaireResponses ? JSON.parse(plan.questionnaireResponses as string) : null,
      claudeAnalysis: plan.claudeAnalysis ? JSON.parse(plan.claudeAnalysis as string) : null,
      planMetadata: plan.planMetadata ? JSON.parse(plan.planMetadata as string) : null,
    };

    return NextResponse.json(parsedPlan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id: planId } = await params;

    // Verify plan ownership
    const existingPlan = await prisma.plan.findFirst({
      where: {
        id: planId,
        user: { email: session.user.email }
      }
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        businessContext: body.businessContext || existingPlan.businessContext,
        questionnaireResponses: body.questionnaireResponses || existingPlan.questionnaireResponses,
        claudeAnalysis: body.claudeAnalysis || existingPlan.claudeAnalysis,
        generatedContent: body.generatedContent || existingPlan.generatedContent,
        planMetadata: body.planMetadata || existingPlan.planMetadata,
        status: body.status || existingPlan.status,
        completionPercentage: body.completionPercentage || existingPlan.completionPercentage
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: planId } = await params;

    // Verify plan ownership
    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        user: { email: session.user.email }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    await prisma.plan.delete({
      where: { id: planId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}