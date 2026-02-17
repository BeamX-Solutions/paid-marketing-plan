import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { claudeService } from '@/lib/claude';
import { emailService } from '@/lib/email/emailService';
import { creditService } from '@/lib/credits/creditService';

const prisma = new PrismaClient();

const CREDITS_PER_PLAN = parseInt(process.env.CREDITS_PER_PLAN || '50');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (plan.status === 'completed') {
      return NextResponse.json({ message: 'Plan already generated', plan });
    }

    // ========== CREDIT CHECK & DEDUCTION ==========
    // Check if user has sufficient credits
    const hasSufficient = await creditService.hasSufficientCredits(
      plan.user.id,
      CREDITS_PER_PLAN
    );

    if (!hasSufficient) {
      const balance = await creditService.getUserCreditBalance(plan.user.id);
      return NextResponse.json({
        error: 'Insufficient credits',
        message: `You need ${CREDITS_PER_PLAN} credits to generate a plan. You have ${balance.totalCredits} credits.`,
        creditsRequired: CREDITS_PER_PLAN,
        creditsAvailable: balance.totalCredits,
        purchaseUrl: '/dashboard'
      }, { status: 402 }); // 402 Payment Required
    }

    // Deduct credits BEFORE generation starts
    try {
      await creditService.deductCredits(
        plan.user.id,
        CREDITS_PER_PLAN,
        planId,
        'Marketing plan generation'
      );

      // Send credit deduction notification (non-blocking)
      const balanceAfterDeduction = await creditService.getUserCreditBalance(plan.user.id);
      emailService.sendCreditNotificationEmail({
        userEmail: plan.user.email,
        businessName: plan.user.businessName || undefined,
        type: 'deduction',
        amount: CREDITS_PER_PLAN,
        balanceAfter: balanceAfterDeduction.totalCredits,
        description: 'Marketing plan generation',
      }).catch(err => console.error('Failed to send credit notification email:', err));
    } catch (error) {
      return NextResponse.json({
        error: 'Credit deduction failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Update plan status to analyzing
    await prisma.plan.update({
      where: { id: planId },
      data: { 
        status: 'analyzing',
        completionPercentage: 20
      }
    });

    const startTime = Date.now();

    // ========== WRAP GENERATION IN TRY-CATCH FOR REFUNDS ==========
    try {
      // Step 1: Analyze business responses with Claude
      console.log('Starting Claude analysis...');
      const businessContext = JSON.parse(plan.businessContext);
      const questionnaireResponses = JSON.parse(plan.questionnaireResponses);
      const analysis = await claudeService.analyzeBusinessResponses(
        businessContext,
        questionnaireResponses
      );

    // Log Claude interaction
    await prisma.claudeInteraction.create({
      data: {
        planId: plan.id,
        interactionType: 'analysis',
        promptData: JSON.stringify({
          businessContext: businessContext,
          responses: questionnaireResponses
        }),
        claudeResponse: JSON.stringify(analysis),
        processingTimeMs: Date.now() - startTime
      }
    });

    // Update plan with analysis
    await prisma.plan.update({
      where: { id: planId },
      data: {
        claudeAnalysis: JSON.stringify(analysis),
        status: 'generating',
        completionPercentage: 50
      }
    });

    // Step 2: Generate marketing plan content
    console.log('Generating marketing plan...');
    const generationStartTime = Date.now();
    const generatedContent = await claudeService.generateMarketingPlan(
      businessContext,
      questionnaireResponses,
      analysis
    );

    // Log Claude interaction
    await prisma.claudeInteraction.create({
      data: {
        planId: plan.id,
        interactionType: 'generation',
        promptData: JSON.stringify({
          businessContext: businessContext,
          responses: questionnaireResponses,
          analysis: analysis
        }),
        claudeResponse: JSON.stringify(generatedContent),
        processingTimeMs: Date.now() - generationStartTime
      }
    });

      // Update plan with generated content
      const updatedPlan = await prisma.plan.update({
        where: { id: planId },
        data: {
          generatedContent: JSON.stringify(generatedContent),
          claudeAnalysis: JSON.stringify(analysis),
          status: 'completed',
          completionPercentage: 100,
          completedAt: new Date(),
          creditsCharged: CREDITS_PER_PLAN,
          planMetadata: JSON.stringify({
            totalProcessingTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
            version: '1.0',
            creditsCharged: CREDITS_PER_PLAN
          })
        }
      });

      console.log('Plan generation completed successfully');

    // Step 3: Send completion email to user
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const downloadUrl = `${baseUrl}/plan/${plan.id}`;

      const emailData = {
        businessName: plan.user.businessName || undefined,
        website: plan.user.website || undefined,
        userEmail: plan.user.email,
        planId: plan.id,
        generatedContent: generatedContent as any,
        businessContext: businessContext,
        createdAt: updatedPlan.createdAt.toISOString(),
        downloadUrl: downloadUrl
      };

      const emailSent = await emailService.sendPlanCompletionEmail(emailData);
      
      // Log email attempt
      await prisma.claudeInteraction.create({
        data: {
          planId: plan.id,
          interactionType: 'email_completion_auto',
          promptData: JSON.stringify({
            emailSent,
            recipientEmail: plan.user.email
          }),
          claudeResponse: JSON.stringify({
            success: emailSent,
            sentAt: new Date().toISOString(),
            emailType: 'completion'
          })
        }
      });

      if (emailSent) {
        console.log('Completion email sent successfully to:', plan.user.email);
      } else {
        console.warn('Failed to send completion email to:', plan.user.email);
      }
      } catch (emailError) {
        console.error('Error sending completion email:', emailError);
        // Don't fail the entire process if email fails
      }

      return NextResponse.json({
        success: true,
        plan: updatedPlan,
        processingTime: Date.now() - startTime,
        creditsCharged: CREDITS_PER_PLAN
      });

    } catch (generationError) {
      // ========== REFUND CREDITS ON FAILURE ==========
      console.error('Plan generation failed, refunding credits:', generationError);

      try {
        await creditService.refundCredits(planId);
        console.log('Credits refunded successfully');
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError);
        // Log for manual resolution but don't fail the error response
      }

      throw generationError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error('Error generating plan:', error);

    // Update plan status to failed
    try {
      const { id: planId } = await params;
      await prisma.plan.update({
        where: { id: planId },
        data: {
          status: 'failed',
          planMetadata: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString()
          })
        }
      });
    } catch (updateError) {
      console.error('Error updating plan status:', updateError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}