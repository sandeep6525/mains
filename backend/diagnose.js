import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- API TEST ---');
  try {
    const res = await fetch('http://localhost:3000/api/fetchiq/simulator/pyq/availability');
    const text = await res.text();
    console.log('API Status:', res.status);
    console.log('API Response:', text.substring(0, 500));
  } catch (e) {
    console.error('API Error:', e);
  }

  console.log('\n--- PRISMA DB CHECK ---');
  try {
    const totalCount = await prisma.pyqQuestion.count();
    console.log('Total PyqQuestion records:', totalCount);
    
    const publishedCount = await prisma.pyqQuestion.count({
      where: { isPublished: true }
    });
    console.log('Published PyqQuestion records:', publishedCount);

    const sample = await prisma.pyqQuestion.findMany({
      take: 5,
      select: { year: true, paper_code: true, question_number: true, isPublished: true }
    });
    console.log('Sample PyqQuestion records:');
    console.table(sample);

  } catch (e) {
    console.error('Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
