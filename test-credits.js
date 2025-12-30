// Test script to manually add credits to a user account
// Run with: node test-credits.js <email> <credits>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestCredits(email, credits = 100) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    // Calculate expiration date (12 months from now)
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    // Create a test credit purchase
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId: user.id,
        creditsGranted: credits,
        creditsRemaining: credits,
        amountPaid: credits * 100, // $1 per credit for testing
        currency: 'usd',
        purchaseDate,
        expiresAt,
        stripeSessionId: `test_session_${Date.now()}`,
        status: 'active'
      }
    });

    console.log('✅ Test credits added successfully!');
    console.log(`   User: ${email}`);
    console.log(`   Credits: ${credits}`);
    console.log(`   Purchase ID: ${purchase.id}`);
    console.log(`   Expires: ${expiresAt.toLocaleDateString()}`);
    console.log('');
    console.log('🎯 Now you can:');
    console.log('   1. Visit http://localhost:3004/dashboard to see your credits');
    console.log('   2. Try generating a plan (costs 50 credits)');
    console.log('   3. Check transaction history after generating');

  } catch (error) {
    console.error('❌ Error adding credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const email = process.argv[2];
const credits = parseInt(process.argv[3]) || 100;

if (!email) {
  console.log('Usage: node test-credits.js <email> [credits]');
  console.log('Example: node test-credits.js user@example.com 100');
  process.exit(1);
}

addTestCredits(email, credits);
