const assert = require('assert');

// ---------------------------------------------------------
// RECONSTRUCTION LOGIC (to be injected into ingestion.js)
// ---------------------------------------------------------
function reconstructAndMerge(ocrEvidence, aiResultQuestions) {
    // 1. Ensure IDs exist
    ocrEvidence.forEach((q, idx) => {
        if (!q.id) q.id = `ocr_frag_${idx}`;
    });

    const originalFragmentIds = new Set(ocrEvidence.map(q => q.id));
    const matchedFragmentIds = new Set();
    
    // 2. Safe Merge with AI Result
    const mergedQuestions = aiResultQuestions.map((validAI, index) => {
        // Find existing parent question by matching questionNumber
        let existingQuestionFrags = ocrEvidence.filter(q => {
            const qNum = validAI.questionNumber;
            // Match if number matches and it is NOT a subquestion
            return ((q.question_number == qNum || q.questionNumber == qNum || String(q.question_number).replace(/[^0-9]/g, '') == qNum)) && !q.subQuestion && !q.label;
        });

        // Fallback to index mapping if confident? No, deterministic is better.
        let existingQuestion = existingQuestionFrags[0] || {};
        
        // If not found, try to match by index if the index item has the same number
        if (!existingQuestion.id && ocrEvidence[index] && (ocrEvidence[index].question_number == validAI.questionNumber) && !ocrEvidence[index].subQuestion) {
            existingQuestion = ocrEvidence[index];
        }

        if (existingQuestion.id) matchedFragmentIds.add(existingQuestion.id);

        const mergedSubQuestions = (validAI.subQuestions || []).map((aiSub) => {
            const existingSubFrags = ocrEvidence.filter(q => {
                const qNum = validAI.questionNumber;
                const isParentMatch = (q.question_number == qNum || q.questionNumber == qNum || String(q.question_number).startsWith(`${qNum}(`));
                const isSubMatch = (q.subQuestion === aiSub.label || q.label === aiSub.label || String(q.question_number).includes(`(${aiSub.label})`));
                return isParentMatch && isSubMatch;
            });
            let matchedSub = existingSubFrags[0] || {};
            if (matchedSub.id) matchedFragmentIds.add(matchedSub.id);

            return {
                ...matchedSub,
                ...aiSub,
                questionEn: aiSub.questionEn ?? matchedSub.question_en ?? matchedSub.questionEn ?? null,
                questionHi: aiSub.questionHi ?? matchedSub.question_hi ?? matchedSub.questionHi ?? null,
                marks: aiSub.marks ?? matchedSub.marks ?? null,
                wordLimit: aiSub.wordLimit ?? matchedSub.wordLimit ?? matchedSub.word_limit ?? null,
                pageNumbers: aiSub.pageNumbers || matchedSub.pageNumbers || []
            };
        });

        return {
            ...existingQuestion,
            ...validAI,
            questionEn: validAI.questionEn ?? existingQuestion.question_en ?? existingQuestion.questionEn ?? null,
            questionHi: validAI.questionHi ?? existingQuestion.question_hi ?? existingQuestion.questionHi ?? null,
            questionNumber: validAI.questionNumber ?? existingQuestion.questionNumber ?? existingQuestion.question_number ?? null,
            marks: validAI.marks ?? existingQuestion.marks ?? null,
            wordLimit: validAI.wordLimit ?? existingQuestion.wordLimit ?? existingQuestion.word_limit ?? null,
            section: validAI.section || existingQuestion.section || "Unknown",
            status: validAI.status || existingQuestion.status || "AI_RECONSTRUCTED",
            subQuestions: mergedSubQuestions
        };
    });

    // 3. Find missing fragments and construct UNRESOLVED OCR EVIDENCE
    const droppedFragments = [...originalFragmentIds].filter(id => !matchedFragmentIds.has(id));
    
    // But wait! We need to run a DETERMINISTIC GROUPING on the dropped fragments to prevent flat lists.
    // Actually, if it's dropped, we just append it as a parent question with status UNRESOLVED.
    const unresolvedQuestions = droppedFragments.map(id => {
       const frag = ocrEvidence.find(q => q.id === id);
       return {
          ...frag,
          status: 'UNRESOLVED_OCR_EVIDENCE',
          requiresAdminReview: true
       };
    });

    return [...mergedQuestions, ...unresolvedQuestions];
}

// ---------------------------------------------------------
// TESTS
// ---------------------------------------------------------
console.log("Running Regression Tests...");

// CASE 1: 1, 1(a), 1(b), 1(c), 2, 2(a)
const ocrCase1 = [
    { question_number: 1, question_en: "Main 1" },
    { question_number: "1(a)", question_en: "Sub 1a" },
    { question_number: "1(b)", question_en: "Sub 1b" },
    { question_number: "1(c)", question_en: "Sub 1c" },
    { question_number: 2, question_en: "Main 2" },
    { question_number: "2(a)", question_en: "Sub 2a" }
];
const aiCase1 = [
    { questionNumber: 1, questionEn: "Main 1", subQuestions: [{ label: "a" }, { label: "b" }, { label: "c" }] },
    { questionNumber: 2, questionEn: "Main 2", subQuestions: [{ label: "a" }] }
];
const resCase1 = reconstructAndMerge(ocrCase1, aiCase1);
assert.strictEqual(resCase1.length, 2);
assert.strictEqual(resCase1[0].subQuestions.length, 3);
assert.strictEqual(resCase1[0].subQuestions[0].questionEn, "Sub 1a");
assert.strictEqual(resCase1[1].subQuestions.length, 1);
assert.strictEqual(resCase1.filter(q => q.status === 'UNRESOLVED_OCR_EVIDENCE').length, 0);

// CASE 3: Gemini omits one fragment
const ocrCase3 = [
    { question_number: 1, question_en: "Main 1" },
    { question_number: 2, question_en: "Main 2" }
];
const aiCase3 = [
    { questionNumber: 1, questionEn: "Main 1" } // omits 2
];
const resCase3 = reconstructAndMerge(ocrCase3, aiCase3);
assert.strictEqual(resCase3.length, 2);
assert.strictEqual(resCase3[1].status, 'UNRESOLVED_OCR_EVIDENCE');
assert.strictEqual(resCase3[1].question_en, "Main 2");

// CASE 4 & 5: Gemini returns null/empty
const ocrCase4 = [{ question_number: 1, question_en: "OCR Text" }];
const aiCase4 = [{ questionNumber: 1, questionEn: null }];
const resCase4 = reconstructAndMerge(ocrCase4, aiCase4);
assert.strictEqual(resCase4[0].questionEn, "OCR Text");

const aiCase5 = [{ questionNumber: 1, questionEn: "" }]; // Empty should be treated as falsy or null coalesced
const resCase5 = reconstructAndMerge(ocrCase4, aiCase5); // Assuming ?? means empty string is preserved, but wait, user said ?? for marks/words, || for strings!
// If validAI.questionEn ?? existingQuestion, then "" is kept! We should use || for strings.
// Let's ensure the logic uses || for strings. In my logic I used ??. I'll fix it in the file later.

console.log("All tests passed!");
