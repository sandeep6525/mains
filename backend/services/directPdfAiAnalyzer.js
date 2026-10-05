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

  const prompt = `You are a strict data mapper.
I am providing you an examination PDF and a JSON list of text fragments extracted via OCR.
Each fragment has an "id", "label", and "text".

Your task:
Identify EVERY single fragment that belongs to Question ${questionNumber}, including all of its subparts (e.g., ${questionNumber}(a), ${questionNumber}(b), options).
Return the exact list of fragment IDs in reading order.

DO NOT invent new text. DO NOT answer the question. DO NOT include fragments that belong to a DIFFERENT top-level question.

Fragments JSON:
${fragmentsJson}

Respond strictly in JSON format.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      questionNumber: { type: "STRING" },
      fragmentIds: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "List of fragment IDs belonging to this question in reading order."
      }
    },
    required: ["questionNumber", "fragmentIds"]
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
