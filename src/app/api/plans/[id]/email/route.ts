import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email/emailService';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, recipientEmail, message } = body;
    const { id: planId } = await params;

    // Find the plan
    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        user: { email: session.user.email }
      },
      include: {
        user: true
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (!plan.generatedContent || plan.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Plan not ready for email. Please ensure the plan generation is completed.' 
      }, { status: 400 });
    }

    // Create download URL (this should be your actual domain in production)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/plan/${plan.id}`;

    // Prepare email data - parse JSON fields
    const emailData = {
      businessName: plan.user.businessName || undefined,
      userEmail: plan.user.email,
      planId: plan.id,
      generatedContent: JSON.parse(plan.generatedContent as string),
      businessContext: JSON.parse(plan.businessContext as string),
      createdAt: plan.createdAt.toISOString(),
      downloadUrl: downloadUrl
    };

    let success = false;
    let emailType = '';

    switch (action) {
      case 'send_completion':
        // Send completion email to the plan owner
        success = await emailService.sendPlanCompletionEmail(emailData);
        emailType = 'completion';
        break;

      case 'share':
        // Share plan with another email address
        if (!recipientEmail) {
          return NextResponse.json({ 
            error: 'Recipient email is required for sharing' 
          }, { status: 400 });
        }

        const senderName = plan.user.businessName || plan.user.email.split('@')[0];
        success = await emailService.sendPlanShareEmail(
          emailData,
          recipientEmail,
          senderName,
          message
        );
        emailType = 'share';
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use "send_completion" or "share"' 
        }, { status: 400 });
    }

    // Log the email action
    await prisma.claudeInteraction.create({
      data: {
        planId: plan.id,
        interactionType: `email_${emailType}`,
        promptData: JSON.stringify({
          action,
          recipientEmail: action === 'share' ? recipientEmail : plan.user.email,
          success,
          message: message || null
        }),
        claudeResponse: JSON.stringify({
          success,
          sentAt: new Date().toISOString(),
          emailType
        })
      }
    });

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Email ${emailType === 'completion' ? 'sent' : 'shared'} successfully` 
      });
    } else {
      return NextResponse.json({ 
        error: `Failed to send ${emailType} email` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending email:', error);

    // Log the error
    try {
      const { id: planId } = await params;
      await prisma.claudeInteraction.create({
        data: {
          planId: planId,
          interactionType: 'email_error',
          promptData: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          claudeResponse: JSON.stringify({
            success: false,
            errorAt: new Date().toISOString()
          })
        }
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}