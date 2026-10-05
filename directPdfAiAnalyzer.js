import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export async function analyzeDocumentStructure(docId, filePath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  console.log(`[DIRECT-AI] Uploading PDF to Gemini...`);
  let uploadedFile = await ai.files.upload({
      file: filePath,
      mimeType: 'application/pdf',
  });
  console.log(`[DIRECT-AI] Upload successful. URI: ${uploadedFile.uri}. Waiting for processing...`);

  let fileState = uploadedFile.state;
  while (fileState === 'PROCESSING') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    uploadedFile = await ai.files.get({ name: uploadedFile.name });
    fileState = uploadedFile.state;
  }

  if (fileState === 'FAILED') {
    throw new Error('File processing failed.');
  }

  const prompt = `Analyze this examination PDF.
Identify ALL top-level question numbers.
Do NOT list sub-questions (e.g. 1(a), 1(b)) as top-level questions.
Respond strictly in JSON.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      topLevelQuestionCount: { type: "INTEGER" },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            questionNumber: { 
              type: "STRING", 
              description: "Only the exact question label, e.g. '1', '2', '3'" 
            }
          },
          required: ["questionNumber"]
        }
      }
    },
    required: ["topLevelQuestionCount", "questions"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
          role: 'user',
          parts: [
              { fileData: { fileUri: uploadedFile.uri, mimeType: 'application/pdf' } },
              { text: prompt }
          ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.0
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI provider");
  }

  let parsed;
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();
    parsed = JSON.parse(cleanText);
  } catch (e) {
    console.error(`[DIRECT-AI] Structure JSON Parse Error. Snippet: ${text.substring(0, 500)}`);
    throw e;
  }
  
  parsed.fileUri = uploadedFile.uri;
  return parsed;
}

export async function mapFragmentsToQuestion(fileUri, questionNumber, allFragments) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const fragmentsJson = JSON.stringify(allFragments, null, 2);

  const prompt = `You are a rigorous data mapper and text cleaner.
I am providing you an examination PDF and a JSON list of text fragments extracted via OCR.
Each fragment has an "id", "label", and "text".

Your task:
1. Identify EVERY fragment that belongs to Question ${questionNumber}, including all of its subparts (e.g., ${questionNumber}(a), options) and any relevant metadata (instructions, word limits, marks, section headers).
2. Separate the actual question text from instructions, marks, word limits, section headers, and OCR noise.
3. Determine the language of the text. If English and Hindi are present, separate them into the _en and _hi fields. If it's a mix, put it in the _en field and it will be flagged later.
4. Maintain the existing subquestion hierarchy (e.g., (a), (b), (c)). If an OCR fragment contains sub-subquestions like (i) and (ii) (e.g. "(i) Haemophilia (ii) Thalassemia"), you MUST split them into their own distinct \`subQuestions\` objects. It is perfectly fine for multiple subquestion objects to share the same \`sourceFragmentIds\` if they originated from the same fragment. Passages/instructions applying to all subquestions go in the parent instruction fields.
5. Identify any metadata fragments (WORD_LIMIT, MARKS, SECTION_HEADER, PAGE_HEADER, PAGE_FOOTER, NOISE).
6. Return the cleaned, semantic representation.

CRITICAL RULES:
- DO NOT invent new text. DO NOT paraphrase. DO NOT correct OCR typos.
- Reconstruct text ONLY using the EXACT SUBSTRINGS found in the provided OCR fragments.
- DO NOT artificially split sentences if it removes context. Just ensure that the exact text is preserved.
- If marks are embedded in text (like "10x5=50" or "10+10"), extract the numeric value into the \`marks\` field, but you must still preserve the EXACT original OCR string in the text field if it cannot be cleanly separated into a standalone metadata fragment.
- Do not silently correct things like "Null hypothesis: ." to "Null hypothesis."
- If any source fragment cannot be classified confidently, assign it to a text field or instruction field rather than dropping it or rewriting it.

Fragments JSON:
${fragmentsJson}

Respond strictly in JSON format matching the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      question_number: { type: "INTEGER" },
      question_en: { type: "STRING" },
      question_hi: { type: "STRING" },
      instruction_en: { type: "STRING" },
      instruction_hi: { type: "STRING" },
      word_limit: { type: "INTEGER" },
      marks: { type: "INTEGER" },
      section: { type: "STRING" },
      subQuestions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            label: { type: "STRING" },
            text_en: { type: "STRING" },
            text_hi: { type: "STRING" },
            sourceFragmentIds: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["label", "text_en", "text_hi", "sourceFragmentIds"]
        }
      },
      sourceFragmentIds: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      metadataFragments: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            fragmentId: { type: "STRING" },
            type: { type: "STRING" }
          },
          required: ["fragmentId", "type"]
        }
      }
    },
    required: ["question_number", "question_en", "question_hi", "instruction_en", "instruction_hi", "subQuestions", "sourceFragmentIds", "metadataFragments"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
          role: 'user',
          parts: [
              { fileData: { fileUri: fileUri, mimeType: 'application/pdf' } },
              { text: prompt }
          ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.0,
      maxOutputTokens: 8192
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI provider");
  }

  console.log(`[DIRECT-AI-DIAGNOSTIC] Response length: ${text.length}`);
  console.log(`[DIRECT-AI-DIAGNOSTIC] First 500 chars: ${text.substring(0, 500)}`);
  console.log(`[DIRECT-AI-DIAGNOSTIC] Last 1000 chars: ${text.length > 1000 ? text.substring(text.length - 1000) : text}`);
  console.log(`[DIRECT-AI-DIAGNOSTIC] Has \`\`\`json: ${text.includes('\`\`\`json')}`);

  let parsed;
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();
    parsed = JSON.parse(cleanText);
    return parsed;
  } catch (e) {
    console.error(`[DIRECT-AI] Mapping JSON Parse Error.`);
    throw e;
  }
}
