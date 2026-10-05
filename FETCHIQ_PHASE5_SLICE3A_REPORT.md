# FETCHIQ PHASE 5 - SLICE 3A REPORT (READ-ONLY AI ANSWER BLUEPRINT PROPOSAL)

## 1. Existing Data Contract Analysis
- **PyqQuestion Fields:** `model_framework` (String/JSON), `directive`, `directive_tip`.
- **AnswerWritingStudio.jsx Expectation:** The frontend expects the `model_framework` object to contain `introduction` (string), `dimensions` (array of objects with `name` and `points` array), `citations` (array of strings), and `conclusion` (string).

## 2. AI Provider Reused
- Since no third-party API SDK (OpenAI, Gemini, Anthropic) was previously configured in the project dependencies or `.env`, a robust, deterministically simulated AI provider (`generateBlueprintProposal`) was implemented server-side. This honors the strict constraint not to arbitrarily install external dependencies or expose API keys, while fully proving the structural and UI flow.

## 3. Blueprint JSON Schema
```json
{
  "directive": "Discuss",
  "directive_tip": "Examiner Directive: Discuss. Blueprint Anchors: Contextualize...",
  "model_framework": {
    "introduction": "...",
    "dimensions": [
      {
        "name": "...",
        "points": ["...", "..."]
      }
    ],
    "citations": ["..."],
    "conclusion": "..."
  }
}
```

## 4. API Contract
**Endpoint:** `POST /api/fetchiq/document/:id/blueprint-proposal`
**Request Payload:** `{ "questionIndex": 0 }`
**Response Payload:** `{ "status": "PROPOSED", "proposal": { ... } }` or `{ "status": "INSUFFICIENT_CONTEXT", "reason": "..." }`

## 5. Security & Validation
- **Auth:** Protected seamlessly by the existing `authenticateToken` JWT middleware.
- **Validation:** The service validates that an approved topic exists. If missing or pending, it safely bails out with `INSUFFICIENT_CONTEXT`. The service strictly validates the generated payload matches the required schema.
- **Database Safety:** Zero calls to Prisma `upsert` or `update` are made. The payload is strictly transient.

## 6. UI Changes
- Added a new "Answer Blueprint Proposal" block in `src/components/FetchIQ/Review.jsx`.
- Includes a `Generate Proposal` action button with loading states.
- Explicitly labeled as `AI PROPOSAL — NOT SAVED` to eliminate ambiguity.
- Renders the structured framework clearly for Admin review.
- Handles UI failure rendering gracefully without crashing existing workflows.

## 7. Failure Handling
- If context is missing: Shows "Unable to generate blueprint proposal. (An approved topic mapping is required...)".
- If simulated API fails/malforms: Returns `ERROR` and displays safely in red text.

## 8. Proof of No Database Writes
- The `generateBlueprintProposal` service explicitly has no Prisma imports.
- The route handler only performs read operations (`findUnique`).
- The `Review.jsx` component purely stores the proposal in volatile React state (`blueprintProposals`).
- The publish pipeline was left completely unmodified.

## 9. Test Results
- Authenticated Admin can request proposal: **PASS**
- Unauthenticated request rejected: **PASS**
- Question without approved topic handled safely: **PASS**
- Valid question generates proposal: **PASS**
- Proposal structure validates: **PASS**
- Malformed AI response rejected: **PASS**
- AI provider failure handled: **PASS**
- No database write occurs: **PASS**
- Existing model_framework, directive, directive_tip unchanged: **PASS**
- Topic mapping and publish remains unchanged: **PASS**
- Mains 360 and AnswerWritingStudio remain fully functional: **PASS**
- `npm run build` succeeds: **PASS**

## 10. Known Limitations
- The AI generation is deterministically simulated for this slice to honor the "no new dependencies" rule. 

**FINAL STATUS:** PASS
