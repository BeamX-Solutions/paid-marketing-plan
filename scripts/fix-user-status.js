require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserStatus() {
  try {
    console.log('Updating all users to ACTIVE status...');

    const result = await prisma.user.updateMany({
      data: {
        status: 'ACTIVE'
      }
    });

    console.log(`✓ Updated ${result.count} user(s) to ACTIVE status`);

    // Display all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        role: true
      }
    });

    console.log('\nCurrent users:');
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.status} (${user.role})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserStatus();
