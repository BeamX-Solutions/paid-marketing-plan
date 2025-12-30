// Quick script to check credit balance
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCredits(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        creditPurchases: {
          where: {
            status: 'active',
            expiresAt: { gte: new Date() }
          }
        },
        creditTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const totalCredits = user.creditPurchases.reduce((sum, p) => sum + p.creditsRemaining, 0);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CREDIT BALANCE REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 User: ${email}`);
    console.log(`💰 Total Credits: ${totalCredits}`);
    console.log(`📦 Active Packages: ${user.creditPurchases.length}`);
    console.log('');

    if (user.creditPurchases.length > 0) {
      console.log('📦 CREDIT PACKAGES:');
      user.creditPurchases.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.creditsRemaining}/${p.creditsGranted} credits (Expires: ${p.expiresAt.toLocaleDateString()})`);
      });
      console.log('');
    }

    if (user.creditTransactions.length > 0) {
      console.log('📝 RECENT TRANSACTIONS:');
      user.creditTransactions.forEach((t, i) => {
        const sign = t.creditAmount > 0 ? '+' : '';
        console.log(`   ${i + 1}. ${sign}${t.creditAmount} credits - ${t.description || t.transactionType}`);
      });
    } else {
      console.log('📝 No transactions yet');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'nwekeobinna15@gmail.com';
checkCredits(email);
