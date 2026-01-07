import { z } from 'zod';

export const CREDIT_LIMITS = {
  MIN_ADJUSTMENT: -10000,
  MAX_ADJUSTMENT: 10000,
  MIN_BALANCE: 0,
  MAX_BALANCE: 1000000,
} as const;

export const CreditAdjustmentSchema = z.object({
  amount: z.number()
    .refine((val) => val !== undefined && val !== null, {
      message: 'Amount is required',
    })
    .refine((val) => Number.isInteger(val), {
      message: 'Amount must be an integer',
    })
    .refine((val) => val !== 0, { message: 'Amount cannot be zero' })
    .refine((val) => val >= CREDIT_LIMITS.MIN_ADJUSTMENT, {
      message: `Amount cannot be less than ${CREDIT_LIMITS.MIN_ADJUSTMENT} credits`,
    })
    .refine((val) => val <= CREDIT_LIMITS.MAX_ADJUSTMENT, {
      message: `Amount cannot be more than ${CREDIT_LIMITS.MAX_ADJUSTMENT} credits`,
    }),
  reason: z.string().optional(),
});

export type CreditAdjustment = z.infer<typeof CreditAdjustmentSchema>;

export interface CreditValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCreditAdjustment(
  amount: number,
  reason?: string
): CreditValidationResult {
  const errors: string[] = [];

  try {
    CreditAdjustmentSchema.parse({ amount, reason });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Use error.issues instead of error.errors
      errors.push(...error.issues.map((issue) => issue.message));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateBalanceAfterOperation(
  currentBalance: number,
  adjustment: number
): CreditValidationResult {
  const errors: string[] = [];
  const newBalance = currentBalance + adjustment;

  if (newBalance < CREDIT_LIMITS.MIN_BALANCE) {
    errors.push(
      `Insufficient credits. Current balance: ${currentBalance}, Deduction: ${Math.abs(
        adjustment
      )}. Cannot go below ${CREDIT_LIMITS.MIN_BALANCE}.`
    );
  }

  if (newBalance > CREDIT_LIMITS.MAX_BALANCE) {
    errors.push(
      `Operation would exceed maximum balance of ${CREDIT_LIMITS.MAX_BALANCE} credits.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}

export function getCreditAdjustmentType(amount: number): 'addition' | 'deduction' {
  return amount > 0 ? 'addition' : 'deduction';
}
