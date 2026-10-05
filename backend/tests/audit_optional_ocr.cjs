const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const docs = await prisma.ingestionDocument.findMany({
        where: { originalFileName: { contains: 'Management' } },
        include: { jobs: { orderBy: { startedAt: 'desc' } } }
    });
    
    if (docs.length === 0) {
        console.log("No Management PDFs found");
        process.exit(1);
    }
    
    const doc = docs[0];
    console.log("Found document:", doc.originalName);
    
    const job = doc.jobs[0];
    if (!job || !job.resultJson) {
        console.log("No resultJson found");
        process.exit(1);
    }
    
    const intel = JSON.parse(job.resultJson);
    const questions = intel.questions;
    
    console.log(`Found ${questions.length} fragments.`);
    
    for (let i = 0; i < Math.min(15, questions.length); i++) {
        const q = questions[i];
        console.log(`\nFrag ${i} - QNum: '${q.questionNumber}' | SubQ: '${q.subQuestion}' | Marks: '${q.marks}'`);
        console.log(`EN: ${q.questionEn}`);
        console.log(`HI: ${q.questionHi}`);
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
