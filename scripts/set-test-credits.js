/**
 * Set Test Credits Script
 * Usage: node scripts/set-test-credits.js <email> <amount>
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setTestCredits(email, amount) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Setting Test Credits');
    console.log('='.repeat(60));
    console.log(`User: ${user.email}`);
    console.log(`Setting credits to: ${amount}`);
    console.log('─'.repeat(60));

    // Delete all existing credit purchases
    const deleted = await prisma.creditPurchase.deleteMany({
      where: { userId: user.id }
    });

    console.log(`Deleted ${deleted.count} existing credit purchase(s)`);

    if (amount > 0) {
      // Create new credit purchase with the specified amount
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

      const purchase = await prisma.creditPurchase.create({
        data: {
          userId: user.id,
          creditsGranted: amount,
          creditsRemaining: amount,
          amountPaid: 0,
          currency: 'usd',
          status: 'active',
          expiresAt,
          stripeSessionId: `test_${Date.now()}`
        }
      });

      console.log(`✅ Created new credit purchase`);
      console.log(`   Credits: ${purchase.creditsRemaining}`);
      console.log(`   Expires: ${expiresAt.toLocaleDateString()}`);
    } else {
      console.log(`✅ Set to zero credits (all purchases deleted)`);
    }

    console.log('─'.repeat(60));

    const creditsPerPlan = parseInt(process.env.CREDITS_PER_PLAN || '50');
    const plansAvailable = Math.floor(amount / creditsPerPlan);

    if (amount < creditsPerPlan) {
      console.log(`⚠️  INSUFFICIENT CREDITS`);
      console.log(`Need ${creditsPerPlan - amount} more credits to generate a plan`);
      console.log(`\n💡 User will see "Insufficient Credits" modal`);
    } else {
      console.log(`✅ SUFFICIENT CREDITS`);
      console.log(`Can generate ${plansAvailable} plan(s)`);
    }

    console.log('='.repeat(60));
    console.log('\n🎯 Testing Tips:');
    console.log('─'.repeat(60));
    console.log('1. Login with this user account');
    console.log('2. Create or select a plan');
    console.log('3. Click "Generate Plan" button');

    if (amount < creditsPerPlan) {
      console.log('4. ⚠️  Expected: Insufficient Credits modal appears');
      console.log('5. Verify modal shows:');
      console.log(`   - Required: ${creditsPerPlan} credits`);
      console.log(`   - Available: ${amount} credits`);
      console.log(`   - Need: ${creditsPerPlan - amount} more credits`);
    } else {
      console.log('4. ✅ Expected: Plan generation starts');
      console.log('5. Credits will be deducted upon generation');
    }

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('Error setting test credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get arguments from command line
const email = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!email || isNaN(amount)) {
  console.log('\n❌ Error: Please provide email and credit amount');
  console.log('\nUsage: node backend/scripts/set-test-credits.js <email> <amount>');
  console.log('\nExamples:');
  console.log('  node backend/scripts/set-test-credits.js user@example.com 0      # Zero credits');
  console.log('  node backend/scripts/set-test-credits.js user@example.com 25     # Partial credits');
  console.log('  node backend/scripts/set-test-credits.js user@example.com 49     # Almost enough');
  console.log('  node backend/scripts/set-test-credits.js user@example.com 50     # Exact amount');
  console.log('  node backend/scripts/set-test-credits.js user@example.com 100    # Plenty of credits');
  console.log('\n💡 Tips:');
  console.log('  • Credits per plan: 50 (default)');
  console.log('  • Use 0-49 credits to test insufficient credits modal');
  console.log('  • Use 50+ credits to test successful generation\n');
  process.exit(1);
}

setTestCredits(email, amount);
