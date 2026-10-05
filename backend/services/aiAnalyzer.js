import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export async function analyzeDocumentWithAI(docId, ocrResult, documentFileOriginalName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const strippedOcrResult = ocrResult?.map(q => ({
      id: q.id,
      question_number: q.question_number ?? q.questionNumber,
      question_en: q.question_en ?? q.questionEn,
      question_hi: q.question_hi ?? q.questionHi,
      subQuestion: q.subQuestion,
      label: q.label,
      marks: q.marks,
      word_limit: q.word_limit ?? q.wordLimit,
      pageNumbers: q.pageNumbers
  })) || [];

  const prompt = `You are a specialized AI designed to analyze raw OCR fragments from a UPSC question paper and reconstruct the bilingual English/Hindi questions.

Inputs:
- Document Name: ${documentFileOriginalName}
- OCR Evidence (JSON array of fragments):
${JSON.stringify(strippedOcrResult, null, 2)}

Rules:
1. Reconstruct questions ONLY from available evidence. Do NOT fabricate missing text, missing languages, missing numbers, or missing marks/words.
2. English and Hindi must remain separate. Do NOT translate. If evidence for one language is missing, set it to null.
3. Pair English and Hindi using multiple signals (question number, page position, reading order, semantic structure, marks/words). OCR language labels can be wrong.
4. Header/Footer/Instructions: Do not place them inside questions.
38. HIERARCHICAL STRUCTURE (CRITICAL): You must group subquestions under their parent question. If a question is structured as 1(a), 1(b), 1(c), the parent questionNumber is 1. You MUST combine all sub-question text into the parent's \`questionEn\` and \`questionHi\` fields. Separate the parts with a double newline (\`\\n\\n\`) and preserve the original prefixes (e.g. \`1A.\` or \`(a)\`). Do NOT use a \`subQuestions\` array. Do NOT create separate top-level questions for 1(a) and 1(b).
39. Evidence Tracking: Provide the indices of the fragments used to construct each language, and the pages involved.
40. Confidence & Status: Assign confidence (0.0 to 1.0). If you are uncertain about grouping or translation pairing, set requiresAdminReview=true.

Return exactly a JSON object conforming to the schema below.

Response Schema (Illustrative):
{
  "documentMetadata": {
    "exam": "string",
    "year": 2026,
    "paperCode": "string",
    "paperTitle": "string",
    "languages": ["English", "Hindi"]
  },
  "sections": ["string"],
  "questions": [
    {
      "questionNumber": 1,
      "section": "A",
      "questionEn": "Context if any...\\n\\n(a) Question A...\\n\\n(b) Question B...",
      "questionHi": "Context if any...\\n\\n(a) Question A...\\n\\n(b) Question B...",
      "marks": null,
      "wordLimit": null,
      "pageNumbers": [],
      "englishEvidence": [],
      "hindiEvidence": [],
      "confidence": 0.95,
      "status": "AI_RECONSTRUCTED",
      "requiresAdminReview": false
    }
  ]
}
`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      documentMetadata: {
        type: "OBJECT",
        properties: {
          exam: { type: "STRING" },
          year: { type: "INTEGER", nullable: true },
          paperCode: { type: "STRING" },
          paperTitle: { type: "STRING" },
          languages: { type: "ARRAY", items: { type: "STRING" } }
        }
      },
      sections: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            questionNumber: { type: "INTEGER", nullable: true },
            section: { type: "STRING", nullable: true },
            questionEn: { type: "STRING", nullable: true },
            questionHi: { type: "STRING", nullable: true },
            marks: { type: "INTEGER", nullable: true },
            wordLimit: { type: "INTEGER", nullable: true },
            pageNumbers: { type: "ARRAY", items: { type: "INTEGER" } },
            englishEvidence: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { fragmentId: { type: "STRING", nullable: true }, page: { type: "INTEGER", nullable: true } } }
            },
            hindiEvidence: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { fragmentId: { type: "STRING", nullable: true }, page: { type: "INTEGER", nullable: true } } }
            },
            confidence: { type: "NUMBER" },
            status: { type: "STRING" },
            requiresAdminReview: { type: "BOOLEAN" }
          }
        }
      }
    }
  };

  console.log('[AI] Analysis request received');
  console.log(`[AI] Document ID: ${docId}`);
  console.log(`[AI] OCR question count: ${ocrResult?.length || 0}`);
  console.log(`[AI] GEMINI_MODEL: ${model}`);
  console.log(`[AI] GEMINI_API_KEY configured: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
  console.log('[AI] Starting Gemini request');

  let response;
  try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      console.log('[AI] Gemini request successful');
  } catch (error) {
      console.log('[AI] Gemini request failed');
      console.log(`[AI] Error name: ${error.name}`);
      console.log(`[AI] Error message: ${error.message}`);
      console.log(`[AI] Error cause: ${error.cause}`);
      console.log(`[AI] Error stack: ${error.stack}`);
      throw error;
  }

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI provider");
  }

  const parsed = JSON.parse(text);
  return parsed;
}
