/**
 * Credit validation utility
 * Validates credit operations and enforces limits
 */

import { z } from 'zod';

/**
 * Credit operation limits
 */
export const CREDIT_LIMITS = {
  MIN_ADJUSTMENT: -10000, // Maximum deduction per operation
  MAX_ADJUSTMENT: 10000, // Maximum addition per operation
  MIN_BALANCE: 0, // Minimum allowed balance
  MAX_BALANCE: 1000000, // Maximum allowed balance
} as const;

/**
 * Credit adjustment schema
 */
export const CreditAdjustmentSchema = z.object({
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
    .int('Amount must be an integer')
    .refine(
      (val) => val !== 0,
      'Amount cannot be zero'
    )
    .refine(
      (val) => val >= CREDIT_LIMITS.MIN_ADJUSTMENT,
      `Amount cannot be less than ${CREDIT_LIMITS.MIN_ADJUSTMENT} credits`
    )
    .refine(
      (val) => val <= CREDIT_LIMITS.MAX_ADJUSTMENT,
      `Amount cannot be more than ${CREDIT_LIMITS.MAX_ADJUSTMENT} credits`
    ),
  reason: z.string().optional(),
});

export type CreditAdjustment = z.infer<typeof CreditAdjustmentSchema>;

/**
 * Validation result interface
 */
export interface CreditValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate credit adjustment request
 */
export function validateCreditAdjustment(
  amount: number,
  reason?: string
): CreditValidationResult {
  const errors: string[] = [];

  try {
    CreditAdjustmentSchema.parse({ amount, reason });
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate balance after operation
 */
export function validateBalanceAfterOperation(
  currentBalance: number,
  adjustment: number
): CreditValidationResult {
  const errors: string[] = [];
  const newBalance = currentBalance + adjustment;

  if (newBalance < CREDIT_LIMITS.MIN_BALANCE) {
    errors.push(
      `Insufficient credits. Current balance: ${currentBalance}, Deduction: ${Math.abs(adjustment)}. Cannot go below ${CREDIT_LIMITS.MIN_BALANCE}.`
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

/**
 * Format credit amount for display
 */
export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Get credit adjustment type
 */
export function getCreditAdjustmentType(amount: number): 'addition' | 'deduction' {
  return amount > 0 ? 'addition' : 'deduction';
}
