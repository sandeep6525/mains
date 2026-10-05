const fs = require('fs');

const mockOcrEvidence = [
    { id: 'frag0', questionNumber: '1', questionEn: 'Critically comment with', questionHi: 'खण्डA SECTION A 10x5=50 क्या आपको लगता है...' },
    { id: 'frag1', questionNumber: '2', questionEn: 'examples.', questionHi: '(a) अपने उत्तर...' },
    { id: 'frag2', questionNumber: '3', questionEn: 'developed and emerging markets.', questionHi: '(b) निरंतर नवाचार...' },
    { id: 'frag3', questionNumber: '4', questionEn: null, questionHi: '(c) सिद्ध कीजिए।' },
    { id: 'frag4', questionNumber: '5', questionEn: 'Answer the following...', questionHi: '2. निम्नलिखित...' },
    { id: 'frag5', questionNumber: null, questionEn: 'What is the relationship...', questionHi: '(a) संस्कृति...' }
];

function applyDeterministicHierarchy(ocrEvidence) {
    let currentParentNumber = null;

    ocrEvidence.forEach((q, idx) => {
        if (!q.id) q.id = `ocr_frag_${idx}`;

        const textEn = (q.questionEn || '').trim();
        const textHi = (q.questionHi || '').trim();

        if (currentParentNumber === null && q.questionNumber && !isNaN(q.questionNumber)) {
            currentParentNumber = parseInt(q.questionNumber, 10);
        }

        // 1. Check combined pattern like "1(a)" or "Q1(a)"
        const getCombinedMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)\s*\(\s*([a-e])\s*\)/i);
        const cmEn = getCombinedMatch(textEn);
        const cmHi = getCombinedMatch(textHi);
        const cm = cmEn || cmHi;
        if (cm) {
            currentParentNumber = parseInt(cm[1], 10);
            q.questionNumber = currentParentNumber;
            q.subQuestion = cm[2].toLowerCase();
            q.label = q.subQuestion;
            return;
        }

        // 2. Check subquestion pattern like "(a)" or "(b)"
        const getSubMatch = (txt) => txt.match(/^(?:Q\.?\s*(?:\d+\s*)?)?\(\s*([a-e])\s*\)/i);
        const smEn = getSubMatch(textEn);
        const smHi = getSubMatch(textHi);
        const sm = smEn || smHi;
        if (sm && currentParentNumber !== null) {
            q.questionNumber = currentParentNumber;
            q.subQuestion = sm[1].toLowerCase();
            q.label = q.subQuestion;
            return;
        }

        // 3. Check new parent pattern like "1." or "Q1" or "1"
        const getParentMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)(?:\.|\s|$)/i);
        const pmEn = getParentMatch(textEn);
        const pmHi = getParentMatch(textHi);
        const pm = pmEn || pmHi;
        if (pm) {
            currentParentNumber = parseInt(pm[1], 10);
            q.questionNumber = currentParentNumber;
            q.subQuestion = null;
            q.label = null;
            return;
        }
    });

    return ocrEvidence;
}

function simulateMerge(validAI, ocrEvidence) {
    const matchedFragmentIds = new Set();
    
    // Find existing parent question by matching questionNumber
    let existingQuestionFrags = ocrEvidence.filter(q => {
        const qNum = validAI.questionNumber;
        return ((q.questionNumber == qNum || String(q.questionNumber).replace(/[^0-9]/g, '') == qNum)) && !q.subQuestion && !q.label;
    });

    let existingQuestion = {};
    existingQuestionFrags.forEach(f => {
        matchedFragmentIds.add(f.id);
        if (f.questionEn) existingQuestion.questionEn = (existingQuestion.questionEn ? existingQuestion.questionEn + '\n' : '') + f.questionEn;
        if (f.questionHi) existingQuestion.questionHi = (existingQuestion.questionHi ? existingQuestion.questionHi + '\n' : '') + f.questionHi;
    });

    const mergedSubQuestions = (validAI.subQuestions || []).map((aiSub) => {
        const existingSubFrags = ocrEvidence.filter(q => {
            const qNum = validAI.questionNumber;
            const isParentMatch = (q.questionNumber == qNum || String(q.questionNumber).startsWith(`${qNum}(`));
            const isSubMatch = (q.subQuestion === aiSub.label || q.label === aiSub.label || String(q.questionNumber).includes(`(${aiSub.label})`));
            return isParentMatch && isSubMatch;
        });

        let matchedSub = {};
        existingSubFrags.forEach(f => {
            matchedFragmentIds.add(f.id);
            if (f.questionEn) matchedSub.questionEn = (matchedSub.questionEn ? matchedSub.questionEn + '\n' : '') + f.questionEn;
            if (f.questionHi) matchedSub.questionHi = (matchedSub.questionHi ? matchedSub.questionHi + '\n' : '') + f.questionHi;
        });

        return { ...matchedSub, label: aiSub.label };
    });

    return {
        questionNumber: validAI.questionNumber,
        ...existingQuestion,
        subQuestions: mergedSubQuestions,
        matchedFragments: Array.from(matchedFragmentIds)
    };
}

const mockAI = {
    questionNumber: 1,
    subQuestions: [{label: 'a'}, {label: 'b'}, {label: 'c'}]
};

const result = applyDeterministicHierarchy(mockOcrEvidence);
const mergeResult = simulateMerge(mockAI, result);
console.log(JSON.stringify(mergeResult, null, 2));
