const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Supabase connection...\n');

    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Connection successful!`);
    console.log(`📊 Users in database: ${userCount}`);

    // Test write
    console.log('\nTesting write operation...');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'test-password-hash',
        role: 'USER',
        status: 'ACTIVE',
      }
    });
    console.log(`✅ Write test successful! Created user: ${testUser.email}`);

    // Test read
    console.log('\nTesting read operation...');
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    console.log(`✅ Read test successful! Found user: ${foundUser?.email}`);

    // Cleanup
    console.log('\nCleaning up test data...');
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log(`✅ Cleanup successful!`);

    console.log('\n🎉 All tests passed! Supabase connection is working perfectly.\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check DATABASE_URL in .env file');
    console.error('2. Verify Supabase project is active');
    console.error('3. Check database password is correct');
    console.error('4. Ensure you ran: npx prisma generate\n');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
