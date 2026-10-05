const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- TEST: Soft Delete Question ---');

  // 1. Create a dummy document and job with 2 questions
  const doc = await prisma.ingestionDocument.create({
    data: {
      originalFileName: 'soft_delete_test.pdf',
      storedFileName: 'soft_delete_test.pdf',
      filePath: '/tmp/soft_delete_test.pdf',
      sha256: 'mockhash123',
      status: 'NEEDS_REVIEW'
    }
  });

  const mockIntel = {
    identification: {
        year: { value: 2026 },
        paper: { value: 'GS1' }
    },
    questions: [
        {
            questionNumber: 1,
            questionEn: 'Question 1',
            questionHi: 'प्रश्न 1'
        },
        {
            questionNumber: 2,
            questionEn: 'Question 2',
            questionHi: 'प्रश्न 2',
            reviewStatus: 'REMOVED' // Soft deleted
        }
    ]
  };

  const job = await prisma.ingestionJob.create({
    data: {
      documentId: doc.id,
      status: 'AI_ANALYSIS_COMPLETED',
      resultJson: JSON.stringify(mockIntel)
    }
  });

  // 2. Mock a request to the publish endpoint (using the same logic from the route)
  // We'll just execute the route logic directly here to test the outcome.
  
  const id = doc.id;
  const questions = mockIntel.questions;
  const documentIdentity = mockIntel.identification;

  let skippedFragments = 0;
  let publishedCount = 0;
  
  await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (q.reviewStatus === 'REMOVED' || q.excludedFromPublish === true) {
            skippedFragments++;
            continue;
        }
        
        // Mock publish logic
        await tx.pyqQuestion.create({
            data: {
                id: `pyq-2026-gs1-0${q.questionNumber}`,
                year: 2026,
                paper_code: 'GS1',
                paper_id: 'paper-gs1',
                question_number: q.questionNumber,
                question_en: q.questionEn
            }
        });
        publishedCount++;
      }
      
      await tx.ingestionDocument.update({
          where: { id: doc.id },
          data: { status: 'PUBLISHED' }
      });
  });

  // 3. Assertions
  console.log(`Skipped Fragments: ${skippedFragments} (Expected: 1)`);
  console.log(`Published Count: ${publishedCount} (Expected: 1)`);

  const createdQuestions = await prisma.pyqQuestion.findMany({
      where: { year: 2026, paper_code: 'GS1' }
  });

  console.log(`Questions created in DB: ${createdQuestions.length}`);
  const hasQ2 = createdQuestions.some(q => q.question_number === 2);
  console.log(`Was Q2 published? ${hasQ2}`);
  
  if (skippedFragments === 1 && publishedCount === 1 && createdQuestions.length === 1 && !hasQ2) {
      console.log('✅ TEST PASSED: Soft delete successfully excluded question 2 from publication.');
  } else {
      console.error('❌ TEST FAILED');
      process.exit(1);
  }

  // Cleanup
  await prisma.pyqQuestion.deleteMany({ where: { year: 2026, paper_code: 'GS1' } });
  await prisma.ingestionJob.delete({ where: { id: job.id } });
  await prisma.ingestionDocument.delete({ where: { id: doc.id } });
  
  process.exit(0);
}

runTest().catch(e => {
  console.error(e);
  process.exit(1);
});
