/**
 * Backup Codes Service
 * Generates and verifies one-time backup codes for 2FA account recovery
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BACKUP_CODE_LENGTH = 12; // Length of each backup code
const BACKUP_CODE_COUNT = 10; // Number of backup codes to generate
const BCRYPT_ROUNDS = 10; // bcrypt cost factor

/**
 * Format a backup code with dashes for readability
 * Example: ABCD-EFGH-IJKL
 *
 * @param code - Raw backup code
 * @returns Formatted code with dashes
 */
function formatBackupCode(code: string): string {
  // Split into groups of 4 characters
  const parts = [];
  for (let i = 0; i < code.length; i += 4) {
    parts.push(code.slice(i, i + 4));
  }
  return parts.join('-');
}

/**
 * Generate a single random backup code
 *
 * @returns Formatted backup code (e.g., "ABCD-EFGH-IJKL")
 */
function generateSingleBackupCode(): string {
  // Use uppercase alphanumeric characters (no confusing characters like O, 0, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  // Generate random code
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }

  return formatBackupCode(code);
}

/**
 * Generate multiple backup codes
 *
 * @param count - Number of codes to generate (default: 10)
 * @returns Array of formatted backup codes
 */
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  const codes: string[] = [];
  const codeSet = new Set<string>(); // Ensure uniqueness

  while (codes.length < count) {
    const code = generateSingleBackupCode();

    // Ensure code is unique
    if (!codeSet.has(code)) {
      codes.push(code);
      codeSet.add(code);
    }
  }

  return codes;
}

/**
 * Hash backup codes for storage
 *
 * @param codes - Array of plain text backup codes
 * @returns Array of hashed codes
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const hashed: string[] = [];

  for (const code of codes) {
    // Remove dashes before hashing
    const cleanCode = code.replace(/-/g, '');
    const hash = await bcrypt.hash(cleanCode, BCRYPT_ROUNDS);
    hashed.push(hash);
  }

  return hashed;
}

/**
 * Store backup codes as JSON string for database
 *
 * @param codes - Array of plain text backup codes
 * @returns JSON string of hashed codes with metadata
 */
export async function prepareBackupCodesForStorage(
  codes: string[]
): Promise<string> {
  const hashedCodes = await hashBackupCodes(codes);

  const backupCodesData = {
    codes: hashedCodes,
    createdAt: new Date().toISOString(),
    usedCount: 0,
  };

  return JSON.stringify(backupCodesData);
}

/**
 * Verify a backup code against stored hashes
 *
 * @param code - User-provided backup code
 * @param storedCodesJson - JSON string from database
 * @returns Object with isValid and updatedCodesJson
 */
export async function verifyBackupCode(
  code: string,
  storedCodesJson: string
): Promise<{
  isValid: boolean;
  updatedCodesJson: string | null;
  remainingCodes: number;
}> {
  if (!code || !storedCodesJson) {
    return { isValid: false, updatedCodesJson: null, remainingCodes: 0 };
  }

  try {
    const backupCodesData = JSON.parse(storedCodesJson);
    const { codes: hashedCodes } = backupCodesData;

    // Remove dashes from input code
    const cleanCode = code.replace(/-/g, '').toUpperCase();

    // Try to match against each stored hash
    for (let i = 0; i < hashedCodes.length; i++) {
      const hash = hashedCodes[i];

      // Skip if code already used (marked as null)
      if (hash === null) {
        continue;
      }

      // Check if code matches this hash
      const isMatch = await bcrypt.compare(cleanCode, hash);

      if (isMatch) {
        // Mark code as used by setting to null
        hashedCodes[i] = null;

        // Update used count
        backupCodesData.usedCount = (backupCodesData.usedCount || 0) + 1;

        // Calculate remaining codes
        const remainingCodes = hashedCodes.filter((c: string | null) => c !== null).length;

        return {
          isValid: true,
          updatedCodesJson: JSON.stringify(backupCodesData),
          remainingCodes,
        };
      }
    }

    // No match found
    return {
      isValid: false,
      updatedCodesJson: null,
      remainingCodes: hashedCodes.filter((c: string | null) => c !== null).length,
    };
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return { isValid: false, updatedCodesJson: null, remainingCodes: 0 };
  }
}

/**
 * Get remaining backup codes count
 *
 * @param storedCodesJson - JSON string from database
 * @returns Number of unused backup codes
 */
export function getRemainingBackupCodesCount(storedCodesJson: string): number {
  if (!storedCodesJson) {
    return 0;
  }

  try {
    const backupCodesData = JSON.parse(storedCodesJson);
    const { codes } = backupCodesData;

    return codes.filter((c: string | null) => c !== null).length;
  } catch {
    return 0;
  }
}

/**
 * Check if user should regenerate backup codes
 * Warns when fewer than 3 codes remain
 *
 * @param storedCodesJson - JSON string from database
 * @returns true if user should regenerate codes
 */
export function shouldRegenerateBackupCodes(storedCodesJson: string): boolean {
  const remaining = getRemainingBackupCodesCount(storedCodesJson);
  return remaining < 3;
}

/**
 * Parse backup codes JSON safely
 *
 * @param storedCodesJson - JSON string from database
 * @returns Parsed backup codes data or null
 */
export function parseBackupCodes(storedCodesJson: string): {
  codes: (string | null)[];
  createdAt: string;
  usedCount: number;
} | null {
  if (!storedCodesJson) {
    return null;
  }

  try {
    return JSON.parse(storedCodesJson);
  } catch {
    return null;
  }
}
