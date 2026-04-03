import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('Resetting database...');

  // Delete all records
  await prisma.property.deleteMany();

  console.log('Database reset complete.');
}

resetDatabase()
  .catch((err: unknown) => {
    console.error('Reset failed:', err);
    throw err;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
