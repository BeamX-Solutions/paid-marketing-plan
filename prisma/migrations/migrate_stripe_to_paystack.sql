-- Migration: Switch from Stripe to Paystack
-- This migration renames Stripe columns to Paystack columns to preserve existing data

-- Step 1: Rename columns in users table
ALTER TABLE users RENAME COLUMN stripeCustomerId TO paystackCustomerId;

-- Step 2: Rename columns in credit_purchases table
ALTER TABLE credit_purchases RENAME COLUMN stripeSessionId TO paystackReference;
ALTER TABLE credit_purchases RENAME COLUMN stripePaymentId TO paystackTransactionId;

-- Step 3: Update default currency from 'usd' to 'ngn' for new records
-- Note: SQLite doesn't support modifying column defaults directly
-- The schema.prisma file now has currency default('ngn'), which will apply to new records
-- Existing records keep their original currency values

-- Step 4: Drop and recreate unique indexes with new column names
DROP INDEX IF EXISTS users_stripeCustomerId_key;
CREATE UNIQUE INDEX users_paystackCustomerId_key ON users(paystackCustomerId);

DROP INDEX IF EXISTS credit_purchases_stripeSessionId_key;
CREATE UNIQUE INDEX credit_purchases_paystackReference_key ON credit_purchases(paystackReference);
