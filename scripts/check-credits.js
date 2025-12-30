/**
 * Check Credit Balance Script
 * Usage: node scripts/check-credits.js <email>
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCredits(email) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        creditPurchases: {
          where: {
            status: 'active',
            expiresAt: { gte: new Date() }
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    // Calculate total credits
    const totalCredits = user.creditPurchases.reduce(
      (sum, purchase) => sum + (purchase.creditsRemaining || 0),
      0
    );

    const activePurchases = user.creditPurchases.length;
    const creditsPerPlan = parseInt(process.env.CREDITS_PER_PLAN || '50');
    const plansAvailable = Math.floor(totalCredits / creditsPerPlan);

    console.log('\n' + '='.repeat(60));
    console.log('💳 Credit Balance Report');
    console.log('='.repeat(60));
    console.log(`User: ${user.firstName || ''} ${user.lastName || ''} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.status}`);
    console.log('─'.repeat(60));
    console.log(`Total Credits: ${totalCredits}`);
    console.log(`Active Purchases: ${activePurchases}`);
    console.log(`Credits per Plan: ${creditsPerPlan}`);
    console.log(`Plans Available: ${plansAvailable}`);
    console.log('─'.repeat(60));

    if (totalCredits < creditsPerPlan) {
      console.log(`⚠️  INSUFFICIENT CREDITS`);
      console.log(`Need ${creditsPerPlan - totalCredits} more credits to generate a plan`);
      console.log(`Status: Will show "Insufficient Credits" modal`);
    } else {
      console.log(`✅ SUFFICIENT CREDITS`);
      console.log(`Can generate ${plansAvailable} plan(s)`);
    }

    console.log('='.repeat(60) + '\n');

    if (activePurchases > 0) {
      console.log('Active Credit Purchases:');
      console.log('─'.repeat(60));
      user.creditPurchases.forEach((purchase, index) => {
        const expiresAt = new Date(purchase.expiresAt);
        const daysUntilExpiry = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));

        console.log(`${index + 1}. ${purchase.creditsRemaining} credits remaining`);
        console.log(`   Granted: ${purchase.creditsGranted} | Expires: ${expiresAt.toLocaleDateString()} (${daysUntilExpiry} days)`);
        console.log(`   Amount Paid: $${(purchase.amountPaid / 100).toFixed(2)} | Session: ${purchase.stripeSessionId?.substring(0, 20)}...`);
      });
      console.log('='.repeat(60) + '\n');
    }

  } catch (error) {
    console.error('Error checking credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Error: Please provide an email address');
  console.log('\nUsage: node backend/scripts/check-credits.js <email>');
  console.log('Example: node backend/scripts/check-credits.js user@example.com\n');
  process.exit(1);
}

checkCredits(email);
