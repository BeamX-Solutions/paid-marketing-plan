import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessContext, questionnaireResponses } = body;

    // Extract businessName and website from responses
    const businessName = questionnaireResponses?.['business-name'] || businessContext?.businessName || session.user.name;
    const website = questionnaireResponses?.['business-website'] || undefined;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          businessName: businessName,
          website: website
        }
      });
    } else {
      // Update existing user with businessName and website from current session
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          businessName: businessName || user.businessName,
          website: website || user.website
        }
      });
    }

    // Create the plan
    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        businessContext: JSON.stringify(businessContext || {}),
        questionnaireResponses: JSON.stringify(questionnaireResponses || {}),
        status: 'in_progress',
        completionPercentage: 0
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}