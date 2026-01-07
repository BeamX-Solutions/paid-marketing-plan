import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentAdmin } from '@/lib/admin-logger';
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rate-limit';
import {
  CreditAdjustmentSchema,
  validateBalanceAfterOperation,
  getCreditAdjustmentType,
} from '@/lib/credit-validation';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, RATE_LIMIT_CONFIGS.creditOperation);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Get current admin user
    let admin;
    try {
      admin = await getCurrentAdmin();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
          );
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
          );
        }
      }
      throw error;
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body with Zod schema
    let validatedData;
    try {
      validatedData = CreditAdjustmentSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: error.issues.map(e => e.message),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { amount, reason } = validatedData;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current balance
    const balance = await prisma.creditPurchase.aggregate({
      where: {
        userId: id,
        status: 'active',
        expiresAt: { gte: new Date() }
      },
      _sum: { creditsRemaining: true }
    });

    const currentBalance = balance._sum.creditsRemaining || 0;

    // Validate balance after operation
    const balanceValidation = validateBalanceAfterOperation(currentBalance, amount);
    if (!balanceValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid credit operation',
          details: balanceValidation.errors,
        },
        { status: 400 }
      );
    }

    const operationType = getCreditAdjustmentType(amount);
    const newBalance = currentBalance + amount;

    // Perform credit operation in a transaction
    if (operationType === 'addition') {
      // Adding credits - create a purchase record and transaction
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 12);

      // Use UUID instead of timestamp for better uniqueness
      const stripeSessionId = `admin_manual_${randomUUID()}`;

      await prisma.$transaction(async (tx: any) => {
        // Create the purchase record
        const purchase = await tx.creditPurchase.create({
          data: {
            userId: id,
            creditsGranted: amount,
            creditsRemaining: amount,
            amountPaid: 0,
            currency: 'usd',
            expiresAt,
            status: 'active',
            stripeSessionId,
          },
        });

        // Create the transaction record
        await tx.creditTransaction.create({
          data: {
            userId: id,
            purchaseId: purchase.id,
            creditAmount: amount,
            transactionType: 'manual_adjustment',
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: reason || `Manual credit addition by admin`,
            metadata: JSON.stringify({ adminId: admin.id }),
          },
        });

        // Log admin action
        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: 'ADD_CREDITS',
            targetUserId: id,
            details: JSON.stringify({ amount, reason, previousBalance: currentBalance }),
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
          },
        });
      });
    } else {
      // Deducting credits - perform deduction within transaction
      const deductAmount = Math.abs(amount);
      const deductionReference = `admin_deduction_${randomUUID()}`;

      await prisma.$transaction(async (tx: any) => {
        // Get active purchases (oldest expiring first - FIFO)
        const purchases = await tx.creditPurchase.findMany({
          where: {
            userId: id,
            status: 'active',
            expiresAt: { gte: new Date() },
            creditsRemaining: { gt: 0 }
          },
          orderBy: { expiresAt: 'asc' }
        });

        let remainingToDeduct = deductAmount;
        const balanceBefore = currentBalance;

        // Deduct from oldest expiring purchases first (FIFO)
        for (const purchase of purchases) {
          if (remainingToDeduct <= 0) break;

          const deductFromThisPurchase = Math.min(purchase.creditsRemaining, remainingToDeduct);

          // Update purchase remaining credits
          await tx.creditPurchase.update({
            where: { id: purchase.id },
            data: {
              creditsRemaining: purchase.creditsRemaining - deductFromThisPurchase
            }
          });

          // Create transaction record
          await tx.creditTransaction.create({
            data: {
              userId: id,
              purchaseId: purchase.id,
              creditAmount: -deductFromThisPurchase,
              transactionType: 'manual_adjustment',
              balanceBefore: balanceBefore - (deductAmount - remainingToDeduct),
              balanceAfter: balanceBefore - (deductAmount - remainingToDeduct) - deductFromThisPurchase,
              description: reason || 'Manual credit deduction by admin',
              metadata: JSON.stringify({
                adminId: admin.id,
                deductionReference
              })
            }
          });

          remainingToDeduct -= deductFromThisPurchase;
        }

        // Log admin action
        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: 'DEDUCT_CREDITS',
            targetUserId: id,
            details: JSON.stringify({ amount, reason, previousBalance: currentBalance }),
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      newBalance,
      operation: operationType,
    });
  } catch (error) {
    console.error('Error updating credits:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      // Check for insufficient credits error
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json(
          { error: 'Insufficient credits to deduct' },
          { status: 400 }
        );
      }

      // Check for transaction errors
      if (error.message.includes('Transaction')) {
        return NextResponse.json(
          { error: 'Credit operation failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update credits' },
      { status: 500 }
    );
  }
}