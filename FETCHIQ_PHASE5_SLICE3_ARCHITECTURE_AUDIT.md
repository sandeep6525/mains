# FETCHIQ PHASE 5 - SLICE 3 ARCHITECTURE AUDIT

## 1. Executive Summary
This document provides an architecture audit of the FetchIQ system following the successful implementation of Phase 5 Slice 1 (Topic Proposal) and Slice 2 (Topic Mapping Publish Integration). The audit identifies that while documents successfully flow from PDF ingestion through Admin Review and into the `PyqQuestion` database with accurate syllabus mapping, they completely lack the contextual intelligence required by the Mains 360 frontend—specifically the `model_framework` and `directive` fields used in the Answer Writing Studio. The recommended Slice 3 focuses on **AI Answer Blueprint (Model Framework) Generation**.

## 2. Current End-to-End Architecture
1. **Ingestion:** Secure, idempotent PDF upload with SHA-256 deduplication and SystemLock concurrency.
2. **OCR & Extraction:** Python shell orchestration (`extract_pdf_rapidocr.py`) extracts text and structurally normalizes questions into bilingual JSON.
3. **Topic Mapping (Phase 5 Slices 1 & 2):** Deterministic heuristic algorithms propose syllabus mappings. Admins accept mappings, which are saved with an audit trail to `IngestionJob.resultJson`.
4. **Publish Transaction:** The `POST /publish` endpoint atomically upserts data into `PyqQuestion`, securely injecting the verified `topic_id` and `topic_title`.
5. **Consumption:** The Mains 360 frontend fetches PYQs from the backend SQLite database.

## 3. Completed Capabilities
- PDF Ingestion & OCR processing.
- JWT-based authentication and secure Admin routing isolation.
- Native Scraping from Admin-configured sources (`FetchIqSource`).
- Topic Proposal Generation based on `MAINS_PAPERS` static syllabus.
- Idempotent and atomic persistence of topic mappings to `PyqQuestion`.

## 4. Remaining Gaps
By inspecting the actual `PyqQuestion` schema and the `POST /publish` transaction in `ingestion.js`, a critical gap was identified:
- The `PyqQuestion` model contains fields `model_framework` (JSON string), `directive`, and `directive_tip`.
- Currently, `POST /publish` only explicitly extracts and persists `directive: q.directive || null`, and entirely omits `model_framework` and `directive_tip` from the `upsert` payload.
- As a result, dynamically ingested documents reach the Mains 360 `AnswerWritingStudio` with missing blueprints, forcing the frontend to rely on heavily mocked static fallbacks or render empty states.

## 5. Dependency Analysis
The generation of an Answer Blueprint inherently relies on:
1. **Structured Text:** The bilingual question text (Completed in Phase 2).
2. **Syllabus Context:** The approved `topic_id` and `topic_title` (Completed in Phase 5 Slice 2).
Thus, Blueprint Generation has zero outstanding dependencies and is structurally primed for implementation.

## 6. Recommended Slice 3
**Slice 3 Capability: AI Answer Blueprint (Model Framework) & Directive Generation.**
This capability will introduce an intelligence layer (likely LLM-backed) that analyzes the question text and its assigned syllabus topic to dynamically generate a highly structured `model_framework` JSON (comprising an introduction, multi-dimensional points, citations/evidence, and a conclusion) alongside examiner `directive` metadata.

## 7. Proposed Workflow
1. **Review Stage:** While in the `Review.jsx` UI, an Admin selects a mapped question and triggers a "Generate Blueprint" action.
2. **AI Processing:** The backend securely communicates with an LLM/intelligence service, generating the structured framework based on the question and topic context.
3. **Admin Validation:** The UI renders the proposed Blueprint. The Admin can edit dimensions, citations, or directives manually.
4. **Acceptance:** The Admin approves the Blueprint, writing it to `resultJson` with a new audit trail event.
5. **Publish:** The existing `$transaction` pushes the populated `model_framework` and `directive_tip` into the `PyqQuestion` database.

## 8. Backend Changes
- Create `backend/services/blueprintGenerator.js` to handle LLM orchestration (prompting, validation, and JSON parsing).
- Add `POST /api/fetchiq/document/:id/blueprint-proposal` endpoint to trigger generation.
- Modify `POST /api/fetchiq/document/:id/publish` in `ingestion.js` to accurately read `intelQ.model_framework` and `intelQ.directive_tip` and include them in the Prisma `upsert`.

## 9. Database Changes
**None required.** The `PyqQuestion` schema already defines:
- `model_framework String?`
- `directive String?`
- `directive_tip String?`
No Prisma migrations are necessary.

## 10. API Changes
- **New Proposal Endpoint:** Accepts `questionText`, `topicTitle`, and `marks` to generate contextual blueprints.
- **Update Publish Endpoint Payload:** Must now accept and validate `model_framework` as a serialized JSON string.

## 11. Admin UI Changes
- Expand `src/components/FetchIQ/Review.jsx` with a new "Blueprint Framework" section for each question.
- Include editable text areas or JSON form fields for `Introduction`, `Dimensions`, `Citations`, and `Conclusion`.
- Add a "Generate Blueprint" action button (disabled if the question is `UNMAPPED`).

## 12. Mains 360 Impact
Zero direct changes are needed for Mains 360 code files. However, the `AnswerWritingStudio` component will natively begin consuming real, dynamic data from the database instead of falling back to the hardcoded `UNIFIED_QUESTIONS` mock framework. 

## 13. Security & Authorization
- The new endpoint must be protected by the existing `authenticateToken` middleware.
- LLM API keys must be isolated in `.env` and never exposed to the frontend.
- Backend must rigorously validate the shape of the AI-generated JSON before passing it to the frontend to prevent prototype pollution or XSS vectors.
- No automatic persistence to the database; Admin approval is mandatory.

## 14. Audit Requirements
When a blueprint is accepted or manually modified by the Admin, the `resultJson` array must push a new entry to the question's `audit` array:
`{ action: 'BLUEPRINT_ACCEPTED', timestamp: '...', by: 'admin' }`.

## 15. Testing Strategy
- **Unit Tests:** Mock the LLM response to ensure `blueprintGenerator.js` correctly enforces the JSON schema.
- **Integration Tests:** Verify `ingestion.js` successfully maps the new fields into SQLite during `/publish`.
- **UI Tests:** Ensure Mains 360 correctly renders a newly published question with the dynamic framework, bypassing the static mock.

## 16. Rollback Strategy
If the AI generation produces malformed data or high costs:
- Disable the LLM integration by returning an `UNAVAILABLE` status from the proposal endpoint.
- Existing questions remain unaffected, natively falling back to `null` which Mains 360 handles defensively.

## 17. Files Expected to Change
- `backend/routes/ingestion.js` (Updates to the publish transaction and new routing).
- `src/components/FetchIQ/Review.jsx` (New UI states for blueprint preview and editing).
- `backend/services/blueprintGenerator.js` (New file for AI orchestration).

## 18. Files That Must Remain Untouched
- `prisma/schema.prisma`
- `src/data/syllabusData.js`
- `backend/services/topicMapping.js`
- `extract_pdf_rapidocr.py`
- All Mains 360 Consumer UI components (e.g., `AnswerWritingStudio.jsx`).

## 19. Risks
- **AI Hallucinations:** The LLM may generate false citations or incorrect directive definitions. Admin read-only review and explicit approval mitigates this risk.
- **JSON Structure Instability:** If the LLM returns invalid JSON, the frontend could crash. The backend MUST enforce strict JSON schema parsing and fallback cleanly if parsing fails.

## 20. Final Recommendation
The architecture natively supports it, the database schema is already prepared for it, and the Mains 360 frontend actively demands it. **Proceed with implementing AI Answer Blueprint Generation as Phase 5 Slice 3.**
