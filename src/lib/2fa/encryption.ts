/**
 * Encryption utilities for 2FA secrets
 * Uses AES-256-GCM for symmetric encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment
 * Key should be base64-encoded 32-byte key
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable not set. Generate one with: openssl rand -base64 32'
    );
  }

  try {
    const decoded = Buffer.from(key, 'base64');
    if (decoded.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits) when decoded');
    }
    return decoded;
  } catch (error) {
    throw new Error('ENCRYPTION_KEY must be valid base64-encoded 32-byte key');
  }
}

/**
 * Derive encryption key from master key and salt
 */
function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
}

/**
 * Encrypt a 2FA secret
 *
 * @param plaintext - The secret to encrypt
 * @returns Encrypted secret in format: salt:iv:authTag:ciphertext (all base64)
 */
export function encrypt2FASecret(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty secret');
  }

  const masterKey = getEncryptionKey();

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive encryption key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Encrypt
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:ciphertext (all base64)
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a 2FA secret
 *
 * @param encrypted - Encrypted secret in format: salt:iv:authTag:ciphertext
 * @returns Decrypted plaintext secret
 */
export function decrypt2FASecret(encrypted: string): string {
  if (!encrypted) {
    throw new Error('Cannot decrypt empty value');
  }

  const parts = encrypted.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format. Expected salt:iv:authTag:ciphertext');
  }

  const [saltB64, ivB64, authTagB64, ciphertextB64] = parts;

  const masterKey = getEncryptionKey();
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  // Derive the same encryption key
  const key = deriveKey(masterKey, salt);

  // Decrypt
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Validate encryption key is properly configured
 * @returns true if encryption key is valid
 */
export function validateEncryptionKey(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key (for setup)
 * @returns Base64-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}
