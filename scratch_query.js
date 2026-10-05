import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.ingestionDocument.findMany({
    where: { originalFileName: { contains: 'ZOOLOGY' } }
  });
  console.log('DOCS:');
  console.log(JSON.stringify(docs, null, 2));

  for (const doc of docs) {
    const pyqs = await prisma.pyqQuestion.findMany({
      where: {
        ingestionDocumentId: doc.id
      }
    });
    console.log(`PYQS FOR DOC ${doc.id} via ingestionDocumentId:`);
    console.log(JSON.stringify(pyqs.map(q => ({
      id: q.id,
      year: q.year,
      paper_code: q.paper_code,
      question_number: q.question_number,
      isPublished: q.isPublished,
      ingestionDocumentId: q.ingestionDocumentId
    })), null, 2));

    const pyqsLegacy = await prisma.pyqQuestion.findMany({
      where: {
        paper_code: { contains: 'ZOO' }
      }
    });
    console.log(`LEGACY PYQS (paper_code contains ZOO):`);
    console.log(JSON.stringify(pyqsLegacy.map(q => ({
      id: q.id,
      year: q.year,
      paper_code: q.paper_code,
      question_number: q.question_number,
      isPublished: q.isPublished,
      ingestionDocumentId: q.ingestionDocumentId
    })), null, 2));
  }
}

main().finally(() => prisma.$disconnect());
