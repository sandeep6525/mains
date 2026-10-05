const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("1. QUERY THE DATABASE FOR GS-I 2024");
  console.log("==================================================");
  const gsi2024 = await prisma.pyqQuestion.findMany({
    where: { paper_code: 'GS-I', year: 2024 }
  });
  console.table(gsi2024.map(q => ({
    id: q.id, year: q.year, paper_code: q.paper_code, paper_id: q.paper_id,
    q_num: q.question_number, isPublished: q.isPublished,
    text: (q.question_en || "").substring(0, 30)
  })));

  console.log("\n==================================================");
  console.log("2. COUNT ALL GS-I 2024 RECORDS");
  console.log("==================================================");
  const totalGSI = await prisma.pyqQuestion.count({ where: { paper_code: 'GS-I', year: 2024 } });
  const pubGSI = await prisma.pyqQuestion.count({ where: { paper_code: 'GS-I', year: 2024, isPublished: true } });
  const unpubGSI = await prisma.pyqQuestion.count({ where: { paper_code: 'GS-I', year: 2024, isPublished: false } });
  console.log(`Total records: ${totalGSI}`);
  console.log(`Published records: ${pubGSI}`);
  console.log(`Unpublished records: ${unpubGSI}`);

  console.log("\n==================================================");
  console.log("3. CHECK ALL 2024 PAPER CODES");
  console.log("==================================================");
  const all2024 = await prisma.pyqQuestion.groupBy({
    by: ['paper_code'],
    where: { year: 2024 },
    _count: { id: true }
  });
  console.table(all2024);

  console.log("\n==================================================");
  console.log("4. FIND GS-I VARIANTS");
  console.log("==================================================");
  const variants = await prisma.pyqQuestion.groupBy({
    by: ['paper_code'],
    where: { 
      year: 2024, 
      paper_code: { contains: 'GS' }
    },
    _count: { id: true }
  });
  console.table(variants);

  console.log("\n==================================================");
  console.log("5 & 6. CHECK QUESTION NUMBERS & isPublished");
  console.log("==================================================");
  const allGSI2024 = await prisma.pyqQuestion.findMany({
    where: { paper_code: { contains: 'GS-I' }, year: 2024 },
    orderBy: { question_number: 'asc' },
    select: { paper_code: true, question_number: true, isPublished: true }
  });
  console.table(allGSI2024);

  await prisma.$disconnect();
}

main().catch(console.error);
