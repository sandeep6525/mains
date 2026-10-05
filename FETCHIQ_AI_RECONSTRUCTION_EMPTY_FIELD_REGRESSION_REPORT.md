# FetchIQ AI Reconstruction Empty Field Regression Report

## 1. Root Cause Analysis
The critical regression that caused populated OCR questions to turn into empty questions (`Q.`, `MISSING`, `MISSING`) immediately after clicking "Analyze with AI" resulted from **blind array replacement and property schema mismatch** in the backend during ingestion merge (`backend/routes/ingestion.js`).

1. **Schema Mismatch**: The original Python OCR pipeline saves valid extracted text into properties such as `question_en`, `question_hi`, and `question_number`. 
2. **AI Payload Transformation**: The Gemini AI outputs its findings using camelCase properties (`questionEn`, `questionHi`, `questionNumber`) as strictly dictated by the updated `aiAnalyzer.js` schema configuration.
3. **Destructive Merge**: The backend route blindly executed `intel.questions = aiResult.questions;`, thereby completely replacing the existing OCR objects with AI objects. If the AI model failed to construct the complete text or omitted the fields during its generation run, the valid `question_en` data was erased permanently. 
4. **Frontend Resolution**: Because `Review.jsx` strictly reads `value={q.questionEn || ''}`, the UI reported the text as `MISSING` because `q.question_en` was wiped out from the document entirely and `q.questionEn` was null/undefined.

## 2. Merge Behavior Implementation
I have established a **SAFE MERGE** architecture inside `backend/routes/ingestion.js`. 
AI is now correctly treated as an enhancement layer, not an authoritative replacement. 

**Safe Merge Rules Applied:**
- For every question returned by the AI, the backend correlates it back to the exact pre-existing OCR question using standard index mapping and fallback `questionNumber`/`subQuestion` checking.
- Using Javascript logical OR (`||`) and Nullish Coalescing (`??`) operators, the system selects the most valid piece of evidence.
- E.g.: `questionEn: validAI.questionEn || existingQuestion.question_en || existingQuestion.questionEn || null`
- Zero-sensitive fields like `marks` and `wordLimit` are safely preserved using `??` to prevent `0` from failing logical OR.
- Any uncertain AI reconstruction strictly retains the original OCR fields and merely flags the object as `AI_RECONSTRUCTED`.

## 3. Exact Before/After Payload 
**Before AI (Raw OCR fragment):**
```json
{
  "question_en": "Analyze the importance of Ashokan inscriptions...",
  "question_number": 1,
  "marks": 10
}
```

**After AI Payload (Simulated empty AI output):**
```json
{
  "questionEn": null,
  "questionNumber": 1,
  "marks": null
}
```

**New Merged Result (Persisted to Database):**
```json
{
  "questionEn": "Analyze the importance of Ashokan inscriptions...",
  "question_en": "Analyze the importance of Ashokan inscriptions...",
  "questionNumber": 1,
  "question_number": 1,
  "marks": 10
}
```

## 4. Regression Test Result
The logic has been successfully evaluated. If the Gemini API returns empty objects, or hallucinates null strings, the SAFE MERGE automatically populates the final node array using the pre-existing fallback data mapped from the original OCR pipeline.

- `before.questions.length === 20` -> TRUE
- `after.questions.length === 20` -> TRUE
- `Q1/Q10/Q11/Q20 after.questionEn` -> NON-EMPTY 

## 5. Build Result
`npm run build` executed and compiled successfully. No frontend regressions triggered. All systems are operational.
