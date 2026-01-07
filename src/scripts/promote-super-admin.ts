import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteSuperAdmin() {
  try {
    // First, list all users to help debug
    console.log('Fetching all users from database...');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
      take: 10,
    });

    console.log(`Found ${allUsers.length} users in database:`);
    allUsers.forEach((u: any) => console.log(`  - ${u.email} (${u.role})`));
    console.log('');

    const email = 'obinna.nweke@beamxsolutions.com'; // Try with .com

    console.log(`Looking for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('Please check the email address and try again.');
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.email} (current role: ${user.role})`);

    if (user.role === 'SUPER_ADMIN') {
      console.log('✓ User is already a SUPER_ADMIN. No changes needed.');
      process.exit(0);
    }

    console.log(`Promoting user to SUPER_ADMIN...`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, role: true },
    });

    console.log(`✅ Successfully promoted ${updatedUser.email} to ${updatedUser.role}`);
    console.log(`User ID: ${updatedUser.id}`);

  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteSuperAdmin();
