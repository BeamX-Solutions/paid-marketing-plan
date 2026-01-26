/**
 * Database Cleanup Script
 *
 * Removes all test users and their associated data, keeping only specified production accounts.
 *
 * Usage: npx ts-node scripts/cleanup-test-data.ts
 * Or: npx tsx scripts/cleanup-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Emails to keep (production accounts)
const EMAILS_TO_KEEP = [
  'obinna.nweke@beamxsolutions.com',
  'admin@example.com',
  'nwekeobinna15@gmail.com',
  'beamxanalyticssolutions@gmail.com',
];

async function cleanupTestData() {
  console.log('Starting database cleanup...\n');
  console.log('Emails to keep:');
  EMAILS_TO_KEEP.forEach(email => console.log(`  - ${email}`));
  console.log('');

  try {
    // Get all users that should be deleted
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: {
          notIn: EMAILS_TO_KEEP,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (usersToDelete.length === 0) {
      console.log('No test users found to delete. Database is already clean.');
      return;
    }

    console.log(`Found ${usersToDelete.length} user(s) to delete:`);
    usersToDelete.forEach(user => console.log(`  - ${user.email} (${user.id})`));
    console.log('');

    const userIdsToDelete = usersToDelete.map(u => u.id);

    // Delete in order to respect foreign key constraints
    // Note: Most relations have onDelete: Cascade, but we'll be explicit

    console.log('Deleting notifications...');
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedNotifications.count} notifications`);

    console.log('Deleting admin sessions...');
    const deletedAdminSessions = await prisma.adminSession.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedAdminSessions.count} admin sessions`);

    console.log('Deleting security events...');
    const deletedSecurityEvents = await prisma.securityEvent.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedSecurityEvents.count} security events`);

    console.log('Deleting admin actions (as admin)...');
    const deletedAdminActionsAsAdmin = await prisma.adminAction.deleteMany({
      where: { adminId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedAdminActionsAsAdmin.count} admin actions`);

    console.log('Deleting credit transactions...');
    const deletedCreditTransactions = await prisma.creditTransaction.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedCreditTransactions.count} credit transactions`);

    console.log('Deleting credit purchases...');
    const deletedCreditPurchases = await prisma.creditPurchase.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedCreditPurchases.count} credit purchases`);

    console.log('Deleting Claude interactions...');
    const plans = await prisma.plan.findMany({
      where: { userId: { in: userIdsToDelete } },
      select: { id: true },
    });
    const planIds = plans.map(p => p.id);
    const deletedClaudeInteractions = await prisma.claudeInteraction.deleteMany({
      where: { planId: { in: planIds } },
    });
    console.log(`  Deleted ${deletedClaudeInteractions.count} Claude interactions`);

    console.log('Deleting plans...');
    const deletedPlans = await prisma.plan.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedPlans.count} plans`);

    console.log('Deleting sessions...');
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedSessions.count} sessions`);

    console.log('Deleting accounts...');
    const deletedAccounts = await prisma.account.deleteMany({
      where: { userId: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedAccounts.count} accounts`);

    console.log('Deleting users...');
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIdsToDelete } },
    });
    console.log(`  Deleted ${deletedUsers.count} users`);

    // Clean up orphaned data
    console.log('\nCleaning up orphaned verification tokens...');
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    console.log(`  Deleted ${deletedVerificationTokens.count} expired verification tokens`);

    // Clean up old security metrics (keep last 30 days)
    console.log('Cleaning up old security metrics...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deletedSecurityMetrics = await prisma.securityMetric.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    console.log(`  Deleted ${deletedSecurityMetrics.count} old security metrics`);

    console.log('\n========================================');
    console.log('Database cleanup completed successfully!');
    console.log('========================================');

    // Show remaining users
    const remainingUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        status: true,
      },
    });
    console.log('\nRemaining users:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}, ${user.status})`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupTestData()
  .then(() => {
    console.log('\nCleanup script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
