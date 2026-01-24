const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Force SQLite connection
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

async function exportData() {
  console.log('Exporting SQLite data...\n');

  try {
    const users = await prisma.user.findMany();
    const plans = await prisma.plan.findMany();
    const creditPurchases = await prisma.creditPurchase.findMany();
    const creditTransactions = await prisma.creditTransaction.findMany();
    const adminActions = await prisma.adminAction.findMany();
    const securityEvents = await prisma.securityEvent.findMany();

    const data = {
      users,
      plans,
      creditPurchases,
      creditTransactions,
      adminActions,
      securityEvents,
      exportedAt: new Date().toISOString()
    };

    fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Plans: ${plans.length}`);
    console.log(`- Credit Purchases: ${creditPurchases.length}`);
    console.log(`- Credit Transactions: ${creditTransactions.length}`);
    console.log(`- Admin Actions: ${adminActions.length}`);
    console.log(`- Security Events: ${securityEvents.length}`);
    console.log('\nData saved to: data-export.json\n');

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
