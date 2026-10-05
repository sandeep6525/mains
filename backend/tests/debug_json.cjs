const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const docs = await prisma.ingestionDocument.findMany({
        where: { originalFileName: { contains: 'Management' } },
        include: { jobs: { orderBy: { startedAt: 'desc' } } }
    });
    const intel = JSON.parse(docs[0].jobs[0].resultJson);
    console.log(JSON.parse(docs[0].jobs[0].resultJson).questions.map(q => q.id).slice(0, 15));

}
run().catch(console.error).finally(() => prisma.$disconnect());
