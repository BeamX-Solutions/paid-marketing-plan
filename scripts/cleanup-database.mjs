/**
 * Database Cleanup Script for Production
 *
 * This script will:
 * 1. Delete specific user accounts
 * 2. Delete all marketing plans
 * 3. Delete all credit transactions
 * 4. Delete all credit purchases
 *
 * Run with: node scripts/cleanup-database.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCOUNTS_TO_DELETE = [
  'admin@example.com',
  'nwekeobinna15@gmail.com',
  'ibehchimaobi98@gmail.com',
  'beamxanalyticssolutions@gmail.com',
];

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // 1. Delete specific user accounts
    console.log('📧 Deleting specific user accounts...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: ACCOUNTS_TO_DELETE,
        },
      },
    });
    console.log(`✅ Deleted ${deletedUsers.count} user accounts`);

    // 2. Delete all marketing plans
    console.log('\n📄 Deleting all marketing plans...');
    const deletedPlans = await prisma.plan.deleteMany({});
    console.log(`✅ Deleted ${deletedPlans.count} marketing plans`);

    // 3. Delete all credit transactions
    console.log('\n💳 Deleting all credit transactions...');
    const deletedTransactions = await prisma.creditTransaction.deleteMany({});
    console.log(`✅ Deleted ${deletedTransactions.count} credit transactions`);

    // 4. Delete all credit purchases
    console.log('\n🛒 Deleting all credit purchases...');
    const deletedPurchases = await prisma.creditPurchase.deleteMany({});
    console.log(`✅ Deleted ${deletedPurchases.count} credit purchases`);

    // 5. Get remaining user count
    const remainingUsers = await prisma.user.count();
    console.log(`\n👥 Remaining users in database: ${remainingUsers}`);

    console.log('\n✨ Database cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDatabase()
  .catch((error) => {
    console.error('Failed to cleanup database:', error);
    process.exit(1);
  });
