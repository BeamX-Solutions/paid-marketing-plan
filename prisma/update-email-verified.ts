import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating existing users to mark emails as verified...');

  const result = await prisma.user.updateMany({
    where: {
      emailVerified: false,
    },
    data: {
      emailVerified: true,
    },
  });

  console.log(`Updated ${result.count} users to email verified status.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
