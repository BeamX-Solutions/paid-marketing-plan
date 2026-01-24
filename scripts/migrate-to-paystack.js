const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToPaystack() {
  console.log('Starting migration from Stripe to Paystack...\n');

  try {
    // Execute raw SQL queries to rename columns
    console.log('Step 1: Renaming stripeCustomerId to paystackCustomerId in users table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users RENAME COLUMN stripeCustomerId TO paystackCustomerId
    `);
    console.log('✓ Users table updated\n');

    console.log('Step 2: Renaming Stripe columns in credit_purchases table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE credit_purchases RENAME COLUMN stripeSessionId TO paystackReference
    `);
    console.log('✓ stripeSessionId → paystackReference');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE credit_purchases RENAME COLUMN stripePaymentId TO paystackTransactionId
    `);
    console.log('✓ stripePaymentId → paystackTransactionId\n');

    console.log('Step 3: Updating indexes...');
    // Drop old indexes
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS users_stripeCustomerId_key`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS credit_purchases_stripeSessionId_key`);
    console.log('✓ Old indexes dropped');

    // Create new indexes
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX users_paystackCustomerId_key ON users(paystackCustomerId)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX credit_purchases_paystackReference_key ON credit_purchases(paystackReference)
    `);
    console.log('✓ New indexes created\n');

    console.log('✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('- User table: stripeCustomerId → paystackCustomerId');
    console.log('- Credit purchases: stripeSessionId → paystackReference');
    console.log('- Credit purchases: stripePaymentId → paystackTransactionId');
    console.log('\nExisting data has been preserved.');
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Update your .env file with Paystack keys');
    console.log('3. Test the payment flow');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToPaystack();
