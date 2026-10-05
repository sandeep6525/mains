# FetchIQ Phase 5 Architecture Audit

## 1. What Phase 1–4 Already Provide
- **Phase 1 (Infrastructure):** Secure PDF ingestion, SHA-256 deduplication, file storage, and Python shell orchestration.
- **Phase 2 (Intelligence):** OCR engines (`extract_pdf_rapidocr.py`) and structural normalization (`test_question_parser.py`) to dissect raw text into logically distinct questions, marks, and word limits.
- **Phase 3 (Admin Review & Publish):** The `Review.jsx` React component, manual validation overrides, and the atomic `$transaction` endpoint that seamlessly pushes reviewed documents into the active `PyqQuestion` SQLite database table.
- **Phase 4 (Automation & Access):** Native idempotency via `SystemLock`, SSRF-secured automated scraping bounded by Admin-configured `FetchIqSource` records, and robust JWT-protected `/admin` routing cleanly isolated from the Mains 360 frontend.

## 2. Existing Reusable Components
- **Data Models:** `IngestionDocument`, `IngestionJob`, and `PyqQuestion`.
- **UI:** The `Dashboard`, `Review`, and `Ingestion` components within the `/admin` routing boundary.
- **Backend Infrastructure:** The Express.js `ingestion.js` router and its established `authenticateToken` JWT barrier.
- **Python Pipeline:** The existing `ingest_upsc_paper.py` orchestrator which currently ends with structured JSON output.

## 3. Phase 5 Gap
Currently, when Phase 3/4 publishes a document into `PyqQuestion`, the endpoint natively hardcodes:
```javascript
  topic_id: null,
  topic_title: 'TOPIC_MAPPING_PENDING'
  model_framework: null
```
**The Missing Capability:** The ingested questions are entirely disconnected from the Mains 360 Syllabus Matrix and Mastery Analytics systems. Phase 5 is the **Topic Mapping & Syllabus Tagging** (and potentially `model_framework` generation) layer. FetchIQ must intelligently classify each parsed question against the known UPSC Mains syllabus micro-topics before or during the Review phase.

## 4. Proposed Flow
1. **Extraction (Existing Phase 2):** Document parsed into structured `questions` array.
2. **Classification (New Phase 5):** A classification engine (either heuristic keyword matching against `src/data/syllabus.js` or an LLM integration) evaluates the text of each question to determine `topic_id` and `topic_title`.
3. **Admin Review (Updated Phase 5):** The `Review.jsx` UI presents the auto-detected Syllabus Topic for each question. The Admin can manually override or correct the topic via a dropdown menu populated by the official syllabus.
4. **Publish (Existing Phase 3):** The endpoint saves the finalized `topic_id` and `topic_title` directly to `PyqQuestion`, rendering it instantly available on the Mains 360 frontend.

## 5. Database Changes
**None strictly required.** The `PyqQuestion` model already possesses `topic_id`, `topic_title`, and `model_framework` fields.
*Optional:* A `SyllabusTopic` table could be created if the backend needs relational syllabus awareness (currently syllabus data is static in the frontend).

## 6. API Changes
- Update `POST /api/fetchiq/ingestion/document/:id/publish` to accept and persist `topic_id` and `topic_title` alongside the question text.
- Create a new endpoint (e.g., `GET /api/fetchiq/syllabus`) if the Admin Review dropdown needs to fetch the list of valid topics from the backend.

## 7. UI Changes
- **Review Workspace (`Review.jsx`):** Introduce a "Topic Mapping" column/dropdown for each question.
- **Validation Logic:** Enhance the `runValidation` function in `Review.jsx` to throw a `WARNING` or `FAIL` if `topic_id` remains unassigned or maps to `TOPIC_MAPPING_PENDING`.

## 8. Security Considerations
- The mapping engine (if calling an external LLM API) must securely store API keys in `.env` and handle rate limits/timeouts.
- The Admin UI must strictly enforce that selected `topic_id`s conform to the existing known Mains 360 identifiers to prevent SQL injection or rendering crashes on the frontend.

## 9. Migration Risks
- **Backward Compatibility:** Existing Phase 1-4 data currently has `TOPIC_MAPPING_PENDING`. If Phase 5 enforces strict topic validation, older documents in `REVIEW` state might become un-publishable without manual Admin effort.

## 10. Regression Risks
- Modifying the normalization JSON output structure to include `topic_id` could break the Phase 3 `Review.jsx` parser if it does not expect the new keys.
- Altering the `$transaction` upsert logic could accidentally revert the Phase 4 `question_number` uniqueness blocker fix.

## 11. Test Plan
- **Unit Tests:** Feed known PYQs to the mapping engine; verify it correctly assigns e.g., `GS1-HIS-01` to a history question.
- **UI Tests:** Ensure the `Review.jsx` dropdown correctly updates the intelligence state and validation handles empty topics.
- **Regression Tests:** Execute the Phase 4 suite to ensure automated scraping, locking, and basic extraction remain unscathed.

## 12. Files Expected to Change
- `backend/routes/ingestion.js` (Publish endpoint)
- `src/components/FetchIQ/Review.jsx` (UI mapping)
- `backend/services/intelligence.js` or a new `classification.js` script.

## 13. Files That Must Remain Untouched
- `extract_pdf_rapidocr.py` (OCR layer)
- `test_question_parser.py` (Structural formatting)
- `backend/services/scraper.js` (Phase 4 Automation)
- `prisma/schema.prisma` (SystemLock and PYQ architecture)
- Mains 360 static components (`PYQVaultArchive.jsx`, `PaperSyllabusMatrix.jsx`).

## 14. Implementation Plan (Small Vertical Slices)
**Slice A:** Backend API support for Syllabus List & UI Dropdown in Review.
**Slice B:** Update Publish Endpoint to persist the `topic_id`.
**Slice C:** Implement the Automated Classification Engine to pre-fill the dropdown during the `PROCESSING` state.
