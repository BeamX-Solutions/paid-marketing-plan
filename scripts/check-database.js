const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function checkDatabase() {
  try {
    console.log('Checking SQLite database contents...\n');

    const userCount = await prisma.user.count();
    const planCount = await prisma.plan.count();
    const creditPurchaseCount = await prisma.creditPurchase.count();
    const creditTransactionCount = await prisma.creditTransaction.count();

    console.log('📊 Database Summary:');
    console.log('─────────────────────────────');
    console.log(`Users: ${userCount}`);
    console.log(`Plans: ${planCount}`);
    console.log(`Credit Purchases: ${creditPurchaseCount}`);
    console.log(`Credit Transactions: ${creditTransactionCount}`);
    console.log('─────────────────────────────\n');

    if (userCount === 0 && planCount === 0 && creditPurchaseCount === 0) {
      console.log('✅ Database is EMPTY - Safe to start fresh with Supabase!');
      console.log('   No need to export data.\n');
    } else {
      console.log('⚠️  Database has data - You should:');
      console.log('   1. Export data: node scripts/export-sqlite-data.js');
      console.log('   2. Review data-export.json');
      console.log('   3. Decide what to keep\n');

      if (userCount > 0) {
        console.log('Users found:');
        const users = await prisma.user.findMany({
          select: { id: true, email: true, role: true, createdAt: true }
        });
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.role}) - Created: ${new Date(user.createdAt).toLocaleDateString()}`);
        });
        console.log('');
      }

      if (creditPurchaseCount > 0) {
        console.log('Credit Purchases found:');
        const purchases = await prisma.creditPurchase.findMany({
          select: {
            creditsGranted: true,
            creditsRemaining: true,
            amountPaid: true,
            currency: true,
            purchaseDate: true
          }
        });
        purchases.forEach(p => {
          console.log(`  - ${p.creditsGranted} credits (${p.creditsRemaining} remaining) - ${p.currency.toUpperCase()} ${p.amountPaid / 100}`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
