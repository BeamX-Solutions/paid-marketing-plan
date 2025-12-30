/**
 * TOTP (Time-based One-Time Password) Service
 * Handles 2FA secret generation, QR code creation, and token verification
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { encrypt2FASecret, decrypt2FASecret } from './encryption';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Marketing Plan Generator';
const TOTP_STEP = 30; // 30 seconds per token
const TOTP_WINDOW = 1; // Allow 1 step before/after (±30 seconds)

/**
 * Generate a new 2FA secret for a user
 *
 * @param userEmail - User's email address (displayed in authenticator app)
 * @returns Object with secret, otpauth URL, and QR code data URL
 */
export async function generate2FASecret(userEmail: string): Promise<{
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}> {
  if (!userEmail) {
    throw new Error('User email is required to generate 2FA secret');
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${userEmail})`,
    issuer: APP_NAME,
    length: 32, // 32 bytes = 256 bits (very secure)
  });

  if (!secret.otpauth_url || !secret.base32) {
    throw new Error('Failed to generate 2FA secret');
  }

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCodeDataUrl,
  };
}

/**
 * Verify a TOTP token against a secret
 *
 * @param token - 6-digit token from authenticator app
 * @param secret - Base32-encoded secret (plain text, not encrypted)
 * @returns true if token is valid
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }

  // Remove any spaces or dashes from token
  const cleanToken = token.replace(/[\s-]/g, '');

  // Verify token is 6 digits
  if (!/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  // Verify against secret
  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: cleanToken,
    step: TOTP_STEP,
    window: TOTP_WINDOW, // Allow ±30 seconds for time sync issues
  });

  return isValid;
}

/**
 * Verify a TOTP token against an encrypted secret from database
 *
 * @param token - 6-digit token from authenticator app
 * @param encryptedSecret - Encrypted secret from database
 * @returns true if token is valid
 */
export function verifyTOTPTokenWithEncrypted(
  token: string,
  encryptedSecret: string
): boolean {
  if (!encryptedSecret) {
    throw new Error('No encrypted secret provided');
  }

  try {
    // Decrypt secret
    const plainSecret = decrypt2FASecret(encryptedSecret);

    // Verify token
    return verifyTOTPToken(token, plainSecret);
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    return false;
  }
}

/**
 * Encrypt a 2FA secret for storage
 *
 * @param secret - Plain text Base32 secret
 * @returns Encrypted secret for database storage
 */
export function encryptSecretForStorage(secret: string): string {
  if (!secret) {
    throw new Error('Secret is required for encryption');
  }

  return encrypt2FASecret(secret);
}

/**
 * Get current TOTP token for a secret (for testing/debugging)
 *
 * @param secret - Base32-encoded secret
 * @returns Current 6-digit token
 */
export function getCurrentTOTPToken(secret: string): string {
  const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    step: TOTP_STEP,
  });

  return token;
}

/**
 * Calculate time remaining until current token expires
 *
 * @returns Seconds remaining (0-30)
 */
export function getTokenTimeRemaining(): number {
  const now = Date.now();
  const stepMs = TOTP_STEP * 1000;
  const elapsed = now % stepMs;
  const remaining = stepMs - elapsed;

  return Math.floor(remaining / 1000);
}

/**
 * Validate a secret is properly formatted
 *
 * @param secret - Base32-encoded secret to validate
 * @returns true if secret is valid Base32
 */
export function validateSecret(secret: string): boolean {
  if (!secret) {
    return false;
  }

  // Base32 alphabet: A-Z and 2-7
  const base32Regex = /^[A-Z2-7]+=*$/;

  return base32Regex.test(secret.toUpperCase());
}
