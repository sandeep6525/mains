import { getCanonicalPaperChoices, getBasePaperCode } from '../utils/paperRegistry.js';

const basePaperConfigs = {
    "GS-I": {
        displayName: "General Studies I",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 20,
        type: "GS"
    },
    "GS-II": {
        displayName: "General Studies II: Governance, Constitution, Polity, Social Justice & IR",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 20,
        type: "GS"
    },
    "GS-III": {
        displayName: "General Studies III: Economy, Agriculture, S&T, Environment & Security",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 20,
        type: "GS"
    },
    "GS-IV": {
        displayName: "General Studies IV: Ethics, Integrity and Aptitude",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 12,
        type: "GS"
    },
    "ESSAY": {
        displayName: "Essay",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 2,
        type: "ESSAY"
    }
};

export const getPaperConfig = (canonicalCode) => {
    // Determine if it's optional
    if (canonicalCode.startsWith("OPT-")) {
        const baseCode = getBasePaperCode(canonicalCode);
        const choices = getCanonicalPaperChoices();
        const found = choices.find(c => c.code === baseCode);
        let name = found ? found.label.replace(" (P1 & P2)", "") : baseCode;
        
        let part = "";
        if (canonicalCode.endsWith("-P1")) part = " - Paper 1";
        if (canonicalCode.endsWith("-P2")) part = " - Paper 2";
        
        return {
            displayName: name + part,
            code: canonicalCode,
            type: "OPTIONAL",
            totalMarks: 250,
            durationMinutes: 180,
            questionCount: 20,
            instructions: "Answer all questions. Structure follows UPSC optional patterns."
        };
    }

    const config = basePaperConfigs[canonicalCode];
    if (config) {
        return {
            ...config,
            code: canonicalCode,
            instructions: config.type === "ESSAY" 
                ? "Write two essays, choosing one topic from each of the Sections A and B, in about 1000-1200 words each."
                : (config.type === "GS" && canonicalCode === "GS-IV"
                    ? "The paper consists of 12 questions in two sections: Section A (Theory) and Section B (Case Studies). Answer all questions."
                    : "Answer all 20 questions. Questions 1 to 10 are 10 marks (150 words) each; Questions 11 to 20 are 15 marks (250 words) each.")
        };
    }

    // Fallback
    return {
        displayName: canonicalCode,
        code: canonicalCode,
        type: "UNKNOWN",
        totalMarks: 250,
        durationMinutes: 180,
        questionCount: 20,
        instructions: "Standard UPSC instructions apply."
    };
};
