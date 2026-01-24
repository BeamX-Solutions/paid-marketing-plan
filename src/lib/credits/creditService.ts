import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREDITS_PER_PLAN = parseInt(process.env.CREDITS_PER_PLAN || '50');

export interface CreditBalance {
  totalCredits: number;
  expiringCredits: {
    amount: number;
    expiresAt: string;
  }[];
  purchases: Array<{
    id: string;
    userId: string;
    creditsGranted: number;
    creditsRemaining: number;
    amountPaid: number;
    currency: string;
    purchaseDate: string;
    expiresAt: string;
    stripeSessionId?: string;
    stripePaymentId?: string;
    status: string;
  }>;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  planId?: string;
  purchaseId: string;
  creditAmount: number;
  transactionType: string;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export class CreditService {
  /**
   * Get user's current credit balance
   * Calculates total credits from all non-expired purchases minus used credits
   */
  async getUserCreditBalance(userId: string): Promise<CreditBalance> {
    const now = new Date();

    // Get all active, non-expired purchases
    const purchases = await prisma.creditPurchase.findMany({
      where: {
        userId,
        status: 'active',
        expiresAt: {
          gte: now
        }
      },
      orderBy: {
        expiresAt: 'asc' // Oldest expiration first (FIFO)
      }
    });

    const totalCredits = purchases.reduce((sum: any, p: any) => sum + p.creditsRemaining, 0);

    const expiringCredits = purchases
      .filter((p: any) => p.creditsRemaining > 0)
      .map((p: any) => ({
        amount: p.creditsRemaining,
        expiresAt: p.expiresAt.toISOString()
      }));

    return {
      totalCredits,
      expiringCredits,
      purchases: purchases.map((p: any) => ({
        id: p.id,
        userId: p.userId,
        creditsGranted: p.creditsGranted,
        creditsRemaining: p.creditsRemaining,
        amountPaid: p.amountPaid,
        currency: p.currency,
        purchaseDate: p.purchaseDate.toISOString(),
        expiresAt: p.expiresAt.toISOString(),
        stripeSessionId: p.stripeSessionId || undefined,
        stripePaymentId: p.stripePaymentId || undefined,
        status: p.status
      }))
    };
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, requiredCredits: number = CREDITS_PER_PLAN): Promise<boolean> {
    const balance = await this.getUserCreditBalance(userId);
    return balance.totalCredits >= requiredCredits;
  }

  /**
   * Deduct credits from user's balance using FIFO (oldest expiration first)
   * Returns array of transactions created
   * Uses Prisma transaction to ensure atomicity - all operations succeed or all fail
   */
  async deductCredits(
    userId: string,
    amount: number,
    planId: string,
    description?: string
  ): Promise<CreditTransaction[]> {
    const balance = await this.getUserCreditBalance(userId);

    if (balance.totalCredits < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${balance.totalCredits}`);
    }

    // Use Prisma transaction to ensure all operations succeed or fail together
    const transactions = await prisma.$transaction(async (tx) => {
      let remainingToDeduct = amount;
      const txnResults: CreditTransaction[] = [];
      const balanceBefore = balance.totalCredits;

      // Deduct from oldest expiring purchases first (FIFO)
      for (const purchase of balance.purchases) {
        if (remainingToDeduct <= 0) break;
        if (purchase.creditsRemaining <= 0) continue;

        const deductFromThisPurchase = Math.min(purchase.creditsRemaining, remainingToDeduct);

        // Update purchase remaining credits within transaction
        await tx.creditPurchase.update({
          where: { id: purchase.id },
          data: {
            creditsRemaining: purchase.creditsRemaining - deductFromThisPurchase
          }
        });

        // Create transaction record within transaction
        const transaction = await tx.creditTransaction.create({
          data: {
            userId,
            planId,
            purchaseId: purchase.id,
            creditAmount: -deductFromThisPurchase,
            transactionType: 'plan_generation',
            balanceBefore: balanceBefore - (amount - remainingToDeduct),
            balanceAfter: balanceBefore - (amount - remainingToDeduct) - deductFromThisPurchase,
            description: description || `Plan generation (Plan ID: ${planId})`
          }
        });

        txnResults.push({
          id: transaction.id,
          userId: transaction.userId,
          planId: transaction.planId || undefined,
          purchaseId: transaction.purchaseId,
          creditAmount: transaction.creditAmount,
          transactionType: transaction.transactionType,
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description || undefined,
          createdAt: transaction.createdAt.toISOString(),
          metadata: transaction.metadata ? JSON.parse(transaction.metadata) : undefined
        });

        remainingToDeduct -= deductFromThisPurchase;
      }

      return txnResults;
    });

    return transactions;
  }

  /**
   * Refund credits (e.g., if plan generation fails)
   * Credits are returned to the original purchases they were deducted from
   * Uses Prisma transaction to ensure atomicity
   */
  async refundCredits(planId: string): Promise<void> {
    // Get all transactions for this plan
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        planId,
        transactionType: 'plan_generation'
      },
      include: {
        purchase: true
      }
    });

    // Use Prisma transaction to ensure all refunds succeed or fail together
    await prisma.$transaction(async (tx) => {
      for (const transaction of transactions) {
        // Return credits to original purchase within transaction
        await tx.creditPurchase.update({
          where: { id: transaction.purchaseId },
          data: {
            creditsRemaining: {
              increment: Math.abs(transaction.creditAmount)
            }
          }
        });

        // Create refund transaction within transaction
        await tx.creditTransaction.create({
          data: {
            userId: transaction.userId,
            planId: transaction.planId,
            purchaseId: transaction.purchaseId,
            creditAmount: Math.abs(transaction.creditAmount),
            transactionType: 'refund',
            balanceBefore: transaction.balanceAfter,
            balanceAfter: transaction.balanceBefore,
            description: `Refund for failed plan generation (Plan ID: ${planId})`
          }
        });
      }
    });
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        plan: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    return transactions.map((t: any) => ({
      id: t.id,
      userId: t.userId,
      planId: t.planId || undefined,
      purchaseId: t.purchaseId,
      creditAmount: t.creditAmount,
      transactionType: t.transactionType,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      description: t.description || undefined,
      createdAt: t.createdAt.toISOString(),
      metadata: t.metadata ? JSON.parse(t.metadata) : undefined
    }));
  }

  /**
   * Mark expired purchases as expired (should be run via cron job)
   */
  async markExpiredPurchases(): Promise<number> {
    const now = new Date();

    const result = await prisma.creditPurchase.updateMany({
      where: {
        status: 'active',
        expiresAt: {
          lt: now
        }
      },
      data: {
        status: 'expired'
      }
    });

    return result.count;
  }
}

export const creditService = new CreditService();
