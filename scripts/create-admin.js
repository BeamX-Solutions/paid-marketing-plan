require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔐 Create Admin User\n');
    
    const email = await question('Admin email: ');
    const password = await question('Admin password: ');
    const confirmPassword = await question('Confirm password: ');
    
    if (!email || !password) {
      console.error('❌ Email and password are required');
      process.exit(1);
    }
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }
    
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }
    
    console.log('\n⏳ Hashing password...');
    const hashedPassword = await hash(password, 12);
    
    console.log('⏳ Creating admin user...');
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        businessName: 'System Administrator',
      },
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Status:', admin.status);
    console.log('\n🔐 You can now login at /admin/login\n');
    
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
