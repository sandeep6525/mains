# FETCHIQ PHASE 5 - SLICE 3A: REAL AI ARCHITECTURE AUDIT

## 1. Current Mock Architecture
Currently, `backend/services/blueprintGenerator.js` provides a strictly deterministic mock response. It uses hardcoded string interpolation based on available inputs (topic title, marks) to enforce the JSON structure required by `AnswerWritingStudio.jsx`, simulating network latency using a local `setTimeout`. No actual AI processing occurs.

## 2. Existing AI Integrations Found
An exhaustive search of the existing YuktiPrep repository (including `package.json`, `.env` templates, backend Python scripts, and backend Node.js services) yielded **zero** existing AI integrations.
- No `@google/genai`, `openai`, `anthropic`, or `groq-sdk` packages are installed.
- No `GEMINI_API_KEY` or equivalent secrets exist in `.env.example`.
- Python OCR processing (`paddleocr` in `extract_upside_downside.py`) is purely computer-vision based, completely devoid of LLM inference logic.

## 3. Provider Comparison
N/A. Since no existing providers are configured within the YuktiPrep ecosystem, no comparison of existing services is possible.

## 4. Reuse Opportunities
None. FetchIQ cannot reuse an existing server-side LLM integration because the existing ecosystem does not possess one.

## 5. Recommended Provider
**Strategy B: Add a New Provider (Google Gemini)**

**Why Gemini?**
FetchIQ handles large text extraction contexts and highly structured JSON schemas. Google Gemini (specifically `gemini-1.5-flash`) offers:
- Extremely cost-efficient token pricing suitable for bulk PYQ ingestion.
- First-class native support for strict JSON schema output (`responseSchema`).
- Excellent bilingual (English/Hindi) comprehension natively required by YuktiPrep's dataset.

## 6. Required Dependencies
The official Google Gen AI SDK must be installed on the backend:
`npm install @google/genai`

## 7. Required Environment Variables
A single secret is required to be added to `.env`:
`GEMINI_API_KEY=AIzaSy...`

## 8. Security Model
- **Server-Side Exclusivity:** The API key will remain strictly within the Node.js backend environment variables (`process.env.GEMINI_API_KEY`).
- **No Client Exposure:** The React frontend will never possess or transmit the API key.
- **Authorization Barrier:** The existing `POST /api/fetchiq/document/:id/blueprint-proposal` route is natively shielded by the `authenticateToken` JWT middleware, meaning only verified Admins can trigger billable LLM generations.
- **Data Validation:** The generated output will be validated on the server before being sent to the client.

## 9. Structured Output Strategy
To guarantee compatibility with the existing `AnswerWritingStudio.jsx` frontend, the Gemini API request must leverage `responseMimeType: "application/json"` combined with a strict `responseSchema` enforcing the exact expected shape:
```json
{
  "type": "OBJECT",
  "properties": {
    "directive": { "type": "STRING" },
    "directive_tip": { "type": "STRING" },
    "model_framework": {
      "type": "OBJECT",
      "properties": {
        "introduction": { "type": "STRING" },
        "dimensions": {
          "type": "ARRAY",
          "items": {
             "type": "OBJECT",
             "properties": {
               "name": { "type": "STRING" },
               "points": { "type": "ARRAY", "items": { "type": "STRING" } }
             }
          }
        },
        "citations": { "type": "ARRAY", "items": { "type": "STRING" } },
        "conclusion": { "type": "STRING" }
      }
    }
  }
}
```

## 10. Failure Handling
- **Missing API Key:** If `GEMINI_API_KEY` is undefined, the service should gracefully fallback to the deterministic mock or return `INSUFFICIENT_CONTEXT`.
- **API Timeout/Error:** Try/catch blocks around the LLM call will safely return `{ status: "ERROR", reason: err.message }` preventing server crashes.
- **Malformed JSON:** The strict schema makes this highly unlikely, but a JSON parsing check will validate the final object.

## 11. Proposed Integration Flow
1. Admin clicks "Generate Proposal" in `Review.jsx`.
2. Request hits `/blueprint-proposal` and loads the validated document/topic data.
3. `blueprintGenerator.js` formulates an instructional prompt (combining question text, marks, word limit, and syllabus topic) and calls `gemini-1.5-flash` passing the strict JSON schema.
4. Gemini returns the intelligently generated blueprint.
5. Service validates the object and returns it to the Admin UI for read-only evaluation.

## 12. Files Expected to Change
- `package.json` (New `@google/genai` dependency)
- `.env.example` (New `GEMINI_API_KEY` definition)
- `backend/services/blueprintGenerator.js` (Replace local mock with actual SDK initialization and inference call)

## 13. Files That Must Remain Untouched
- `src/components/FetchIQ/Review.jsx` (UI already handles the proposal perfectly)
- `backend/routes/ingestion.js` (Route already handles auth and context accurately)
- `prisma/schema.prisma` (No DB changes)
- Mains 360 Frontend Components

## 14. Risks
- **Hallucinations:** LLM generating irrelevant citations. The Read-Only proposal phase natively mitigates this by requiring Admin oversight before any persistence occurs.
- **Cost Accumulation:** Unfettered generation could incur API costs. Secured by JWT Admin gating.

## 15. Rollback Strategy
If the AI provider proves unreliable, `blueprintGenerator.js` can simply be reverted to its current deterministic string-interpolation logic with zero impact on the database or downstream components.

## 16. Implementation Plan
1. `npm install @google/genai`
2. Configure `.env` with `GEMINI_API_KEY`.
3. Rewrite `generateBlueprintProposal` to securely construct the payload, define the strict JSON schema, execute the API call, and return the proposal natively to the existing UI. 
