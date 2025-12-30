import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { AnalyticsEvent } from '@/lib/analytics/analyticsService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: AnalyticsEvent = await request.json();

    // Validate event data
    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json({ error: 'Invalid event name' }, { status: 400 });
    }

    // Get user ID from session or event properties
    const userId = session?.user?.email || body.userId;

    // Store analytics event in Claude interactions table for now
    // In production, you might want a dedicated analytics table
    const analyticsData = {
      event: body.event,
      properties: body.properties || {},
      userId: userId,
      sessionId: body.sessionId,
      timestamp: body.timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer')
    };

    // Store in database - using Claude interactions table for simplicity
    // You could create a dedicated analytics table for production
    if (userId && body.properties?.plan_id) {
      try {
        // Try to find user first
        const user = await prisma.user.findUnique({
          where: { email: userId }
        });

        if (user) {
          // Only store analytics in claude_interactions if we have a valid plan_id
          await prisma.claudeInteraction.create({
            data: {
              planId: body.properties.plan_id,
              interactionType: `analytics_${body.event}`,
              promptData: JSON.stringify(analyticsData),
              claudeResponse: JSON.stringify({
                tracked: true,
                timestamp: new Date().toISOString()
              })
            }
          });
        }
      } catch (dbError) {
        console.warn('Failed to store analytics in database:', dbError);
        // Continue without failing the request
      }
    }

    // Log important events
    if (['questionnaire_completed', 'plan_generation_completed', 'plan_downloaded'].includes(body.event)) {
      console.log(`📊 Important Analytics Event: ${body.event}`, {
        userId,
        planId: body.properties?.plan_id,
        timestamp: analyticsData.timestamp
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Return success even if tracking fails (don't break user experience)
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analytics summary for the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        plans: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            completedAt: true,
            planMetadata: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate basic analytics
    const totalPlans = user.plans.length;
    const completedPlans = user.plans.filter(plan => plan.status === 'completed').length;
    const inProgressPlans = user.plans.filter(plan => plan.status === 'in_progress').length;
    const failedPlans = user.plans.filter(plan => plan.status === 'failed').length;

    // Calculate average generation time for completed plans
    const completedPlansWithTime = user.plans
      .filter(plan => plan.status === 'completed' && plan.planMetadata?.totalProcessingTime)
      .map(plan => plan.planMetadata?.totalProcessingTime as number);

    const avgGenerationTime = completedPlansWithTime.length > 0
      ? completedPlansWithTime.reduce((sum, time) => sum + time, 0) / completedPlansWithTime.length
      : null;

    const analytics = {
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        memberSince: user.createdAt,
        lastActive: user.lastLoginAt
      },
      plans: {
        total: totalPlans,
        completed: completedPlans,
        inProgress: inProgressPlans,
        failed: failedPlans,
        completionRate: totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0
      },
      performance: {
        averageGenerationTime: avgGenerationTime ? Math.round(avgGenerationTime) : null,
        averageGenerationTimeFormatted: avgGenerationTime 
          ? `${Math.round(avgGenerationTime / 1000)}s` 
          : null
      },
      recentPlans: user.plans.slice(0, 5).map(plan => ({
        id: plan.id,
        status: plan.status,
        createdAt: plan.createdAt,
        completedAt: plan.completedAt,
        processingTime: plan.planMetadata?.totalProcessingTime
      }))
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}