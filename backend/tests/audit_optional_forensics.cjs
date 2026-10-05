const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const { analyzeDocumentWithAI } = require('../services/aiAnalyzer');

// Copy of ingestion.js normalization
function normalizeQuestionFields(q) {
    if (!q) return {};
    return {
        ...q,
        questionNumber: (q.questionNumber === null || q.questionNumber === 'null') ? null : (q.questionNumber ?? null),
        questionEn: (q.questionEn === null || q.questionEn === 'null') ? null : (q.questionEn ?? null),
        questionHi: (q.questionHi === null || q.questionHi === 'null') ? null : (q.questionHi ?? null),
        subQuestion: (q.subQuestion === null || q.subQuestion === 'null' || q.subQuestion === 'undefined') ? null : (q.subQuestion ?? null),
        label: (q.label === null || q.label === 'null' || q.label === 'undefined') ? null : (q.label ?? null),
        marks: (q.marks === null || q.marks === 'null' || q.marks === 'undefined') ? null : (q.marks ?? null)
    };
}
function isValidText(text) {
    return typeof text === 'string' && text.trim().length > 0 && text !== 'null';
}

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
    const job = doc.jobs[0];
    
    const intel = JSON.parse(job.resultJson);
    let ocrEvidence = intel.questions.map(normalizeQuestionFields);

    console.log("--- FORENSIC TABLE ---");
    console.log("| ID | Index | Raw QNum | Label | Page | Text Preview | Parent | SubQ |");
    
    let currentParentNumber = null;
    ocrEvidence.forEach((q, idx) => {
        if (!q.id) q.id = `ocr_frag_${idx}`;
        const textEn = (q.questionEn || '').trim();
        const textHi = (q.questionHi || '').trim();

        const rawQNum = q.questionNumber;
        const rawLabel = q.label || q.subQuestion;

        if (currentParentNumber === null && q.questionNumber && !isNaN(q.questionNumber)) {
            currentParentNumber = parseInt(q.questionNumber, 10);
        }

        if (q.questionNumber && String(q.questionNumber).match(/^Q\.?\s*(\d+)/i)) {
            currentParentNumber = parseInt(String(q.questionNumber).match(/^Q\.?\s*(\d+)/i)[1], 10);
        }

        const getCombinedMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)\s*\(\s*([a-e])\s*\)/i);
        const cm = getCombinedMatch(textEn) || getCombinedMatch(textHi);
        if (cm) {
            currentParentNumber = parseInt(cm[1], 10);
            q.questionNumber = currentParentNumber;
            q.subQuestion = cm[2].toLowerCase();
            q.label = q.subQuestion;
        } else {
            const getSubMatch = (txt) => txt.match(/^(?:Q\.?\s*(?:\d+\s*)?)?\(\s*([a-e])\s*\)/i);
            const sm = getSubMatch(textEn) || getSubMatch(textHi);
            if (sm && currentParentNumber !== null) {
                q.questionNumber = currentParentNumber;
                q.subQuestion = sm[1].toLowerCase();
                q.label = q.subQuestion;
            } else {
                const getParentMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)(?:\.|\s|$)/i);
                const pm = getParentMatch(textEn) || getParentMatch(textHi);
                if (pm) {
                    currentParentNumber = parseInt(pm[1], 10);
                    q.questionNumber = currentParentNumber;
                    q.subQuestion = null;
                    q.label = null;
                }
            }
        }

        let preview = textEn ? textEn.substring(0, 30).replace(/\n/g, ' ') : textHi ? textHi.substring(0, 30).replace(/\n/g, ' ') : '';
        console.log(`| ${q.id} | ${idx} | ${rawQNum} | ${rawLabel} | ${q.pageNumbers?.[0]} | ${preview} | ${q.questionNumber} | ${q.subQuestion} |`);
    });

    console.log("\n--- AI MERGE SIMULATION ---");
    const aiResult = await analyzeDocumentWithAI(doc.id, ocrEvidence, doc.originalFileName);

    console.log("AI PARENTS:", aiResult.questions.length);
    aiResult.questions.forEach(aq => {
       console.log(`Q${aq.questionNumber} - SubQuestions: ${(aq.subQuestions || []).map(s => s.label).join(', ')}`);
    });

}

run().catch(console.error).finally(() => prisma.$disconnect());
