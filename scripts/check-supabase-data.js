const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking Supabase database contents...\n');

    const userCount = await prisma.user.count();
    const planCount = await prisma.plan.count();
    const creditPurchaseCount = await prisma.creditPurchase.count();
    const creditTransactionCount = await prisma.creditTransaction.count();
    const adminActionCount = await prisma.adminAction.count();
    const securityEventCount = await prisma.securityEvent.count();

    console.log('📊 Database Summary:');
    console.log('─────────────────────────────');
    console.log(`Users: ${userCount}`);
    console.log(`Plans: ${planCount}`);
    console.log(`Credit Purchases: ${creditPurchaseCount}`);
    console.log(`Credit Transactions: ${creditTransactionCount}`);
    console.log(`Admin Actions: ${adminActionCount}`);
    console.log(`Security Events: ${securityEventCount}`);
    console.log('─────────────────────────────\n');

    if (userCount > 0) {
      console.log('Sample users:');
      const users = await prisma.user.findMany({
        take: 5,
        select: { id: true, email: true, role: true, createdAt: true }
      });
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
      console.log('');
    }

    if (creditPurchaseCount > 0) {
      console.log('Credit Purchases:');
      const purchases = await prisma.creditPurchase.findMany({
        select: {
          id: true,
          userId: true,
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

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
