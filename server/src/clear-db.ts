import 'dotenv/config';
import { prisma } from './db.js';

async function clearDB() {
  console.log('🧹 Preparing to wipe the database...');
  
  // Delete in order to respect foreign key constraints
  await prisma.issue.deleteMany();
  await prisma.stagedQuestion.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.module.deleteMany();
  await prisma.member.deleteMany();
  
  console.log('✅ Database is now completely empty!');
}

clearDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
