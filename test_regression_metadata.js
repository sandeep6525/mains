import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: 'e:/yuktiprep-mains/yuktiprep-mains/.env' });

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const fragments = [
  { id: "frag_1", label: "instruction", text: "Write short notes on the following in about 150 words each: 10x5=50\nGreen house effect.", english: "Write short notes on the following in about 150 words each: 10x5=50\nGreen house effect.", hindi: "" },
  { id: "frag_2", label: "a", text: "Gene therapy and its significance.", english: "Gene therapy and its significance.", hindi: "" },
  { id: "frag_3", label: "b", text: "Null hypothesis: .", english: "Null hypothesis: .", hindi: "" },
  { id: "frag_4", label: "c", text: "Principle and applications of gel electrophoresis.", english: "Principle and applications of gel electrophoresis.", hindi: "" },
  { id: "frag_5", label: "d", text: "Explain the following human genetic diseases : (i) Haemophilia\n(ii) Thalassemia 10+10", english: "Explain the following human genetic diseases : (i) Haemophilia\n(ii) Thalassemia 10+10", hindi: "" },
  { id: "frag_6", label: "e", text: "Explain various biological rhythms with the help of suitable examples.", english: "Explain various biological rhythms with the help of suitable examples.", hindi: "" },
  { id: "frag_7", label: "f", text: "Write the principle, working and applications of Transmission Electron\nMicroscope (TEM).", english: "Write the principle, working and applications of Transmission Electron\nMicroscope (TEM).", hindi: "" },
  { id: "frag_8", label: "footer", text: "KVMS-P-ZOY 4", english: "KVMS-P-ZOY 4", hindi: "" }
];

async function runTest() {
  const fragmentsJson = JSON.stringify(fragments.map(f => ({id: f.id, label: f.label, text: f.text})), null, 2);

  const prompt = `You are a rigorous data mapper and text cleaner.
I am providing you a JSON list of text fragments extracted via OCR.
Each fragment has an "id", "label", and "text".

Your task:
1. Identify EVERY fragment that belongs to the question, including all of its subparts and any relevant metadata (instructions, word limits, marks, section headers).
2. Separate the actual question text from instructions, marks, word limits, section headers, and OCR noise.
3. Determine the language of the text. If English and Hindi are present, separate them into the _en and _hi fields.
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

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.0,
      }
    });

    const parsed = JSON.parse(response.text);
    console.log(JSON.stringify(parsed, null, 2));

    // Zero-loss validation simulation
    let duplicateAssignments = 0;
    let unknownFragmentIds = 0;
    const allAssignedFragments = new Set();
    const mappedFragments = parsed.sourceFragmentIds || [];
    const metaFragments = (parsed.metadataFragments || []).map(m => m.fragmentId);
    const subQFragments = (parsed.subQuestions || []).flatMap(sq => sq.sourceFragmentIds || []);

    const questionUniqueFragments = new Set([...mappedFragments, ...metaFragments, ...subQFragments]);

    questionUniqueFragments.forEach((fragId) => {
        const isMetaOnly = metaFragments.includes(fragId) && !mappedFragments.includes(fragId) && !subQFragments.includes(fragId);
        if (allAssignedFragments.has(fragId)) {
            if (!isMetaOnly) duplicateAssignments++;
        }
        allAssignedFragments.add(fragId);
        
        if (!fragments.find(f => f.id === fragId)) {
            unknownFragmentIds++;
        }
    });

    const originalEnglishCharacters = fragments.reduce((acc, f) => acc + f.english.length, 0);
    const originalHindiCharacters = fragments.reduce((acc, f) => acc + f.hindi.length, 0);
    
    let assignedEnglishCharacters = 0;
    let assignedHindiCharacters = 0;
    allAssignedFragments.forEach(fragId => {
        const frag = fragments.find(f => f.id === fragId);
        if (frag) {
            assignedEnglishCharacters += frag.english.length;
            assignedHindiCharacters += frag.hindi.length;
        }
    });

    const totalOriginalChars = originalEnglishCharacters + originalHindiCharacters;
    const totalAssignedChars = assignedEnglishCharacters + assignedHindiCharacters;
    const lossPercentage = totalOriginalChars > 0 ? ((totalOriginalChars - totalAssignedChars) / totalOriginalChars) * 100 : 0;
    
    let unmappedFragments = 0;
    fragments.forEach(f => {
        if (!allAssignedFragments.has(f.id)) unmappedFragments++;
    });

    console.log('\n--- VALIDATION ---');
    console.log(`originalFragments: ${fragments.length}`);
    console.log(`mappedFragments: ${allAssignedFragments.size}`);
    console.log(`unmappedFragments: ${unmappedFragments}`);
    console.log(`duplicateAssignments: ${duplicateAssignments}`);
    console.log(`unknownFragmentIds: ${unknownFragmentIds}`);
    console.log(`lossPercentage: ${lossPercentage.toFixed(2)}%`);
    
    if (unmappedFragments === 0 && duplicateAssignments === 0 && unknownFragmentIds === 0 && lossPercentage === 0) {
        console.log('STATUS: PASS');
    } else {
        console.log('STATUS: FAILED');
    }

  } catch (e) {
    console.error("Test Error:", e);
  }
}

runTest();
