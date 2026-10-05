# YuktiPrep integration module

This is a standalone Python service plus admin review page, ready for adaptation to YuktiPrep. It has not been installed in the actual YuktiPrep repository: its framework, identity provider and question-bank schema were not supplied.

## Local startup

From question_extractor/:

    pip install -r requirements.txt
    export YUKTI_IMPORT_ADMIN_TOKEN='<generate-a-long-random-secret>'
    export YUKTI_IMPORT_DATA='./import_data'
    uvicorn yuktiprep.api:app --host 127.0.0.1 --port 8000

In another terminal with the same working directory and environment:

    python -m yuktiprep.worker

Install Tesseract and chosen language packs as in README.md. The service stores uploaded originals, jobs, reviewed results, and an audit trail in the data directory. The persistent queue survives API restarts. Run exactly one worker. If a worker crashes, stop it before running a replacement with --recover; never recover jobs while another worker is active.

Open http://127.0.0.1:8000/admin/question-import. The API serves admin.html at that route from the same origin. Copy its form logic into the existing admin frontend. Do not open it as file://: CORS is intentionally not enabled. Never put the admin token in a student app, URL or browser persistent storage. The page holds it only in its password field.

## End-to-end flow

Upload → durable queued job → separate OCR worker → review → corrected approval → module staging bank → existing YuktiPrep question bank.

Endpoints:

| Method | Path | Purpose |
|---|---|---|
| POST | /api/v1/question-imports | Multipart upload; exam_id, syllabus_topic_id, source_reference, languages, ocr_mode |
| GET | /api/v1/question-imports/{job_id} | Status, raw grouped result and warnings |
| POST | /api/v1/question-imports/{job_id}/approve | Reviewed JSON: {"questions": [...]} |
| GET | /api/v1/question-bank/imports/{job_id} | Approved payload for downstream integration |

Statuses: queued, processing, review, approved, failed. Approval is atomic, accepts only review jobs, and rejects a duplicate approval. Admin-only access protects uploads, review and exports. Maximum upload 25 MiB, maximum 100 pages; extension and signature checks precede queue insertion. Language and OCR flags are validated. Source provenance and exam/topic tags travel with the approved payload.

## Connect existing YuktiPrep modules

1. Mount this behind YuktiPrep's authenticated admin gateway. Replace admin() with verification of existing SSO/JWT and content-import/content-review permissions; bind tenant and reviewer identity to each job. The supplied shared-token implementation is single-organization only.
2. Replace staging SQLite bank insertion in store.approve() with the existing bank service transaction or transactional outbox. Use job_id plus question.id as an idempotency key. Until adapted, approval writes only this module's staging bank, not YuktiPrep's live database.
3. Validate exam_id and syllabus_topic_id against the authoritative syllabus registry before approval. The current module validates their presence only; it does not establish official authenticity or in-syllabus status.
4. Store parent.text as shared passage/instructions, children as linked parts. Do not publish children without passage links. Preserve pages, source_reference, original language and import ID. Add year, paper, exam phase, marks and question type according to your actual bank schema; do not infer them from OCR unchecked.
5. PYQ search and mock-test engines should consume only approved records after bank ingestion. Embedding/RAG indexing follows approval. Existing answer-key validation, difficulty calibration and analytics continue in the bank workflow; this importer does not generate answers or success scores.
6. Preserve source-language variants explicitly. English/Telugu bilingual versions require reviewed alignment identifiers; do not auto-merge similar labels. Add a separately reviewed translation pipeline if required.

## Deployment work before public exposure

Use HTTPS and existing admin authorization; add per-user/tenant ownership, quotas, request-body limits at the proxy, malware scanning, content licensing review, retention/deletion procedures and operator monitoring. Run PDF/OCR workers in an isolated container with CPU/memory/time limits and no external network. Current OCR timeout is per region; there is no whole-job time budget or pixel limit. Keep this service internal until isolation and resource limits are configured. Configure installed language packs and test them with actual multilingual papers.

SQLite plus a single worker is an internal integration baseline. For scale, move persistence to the existing PostgreSQL database and use your durable task queue with visibility timeouts, retry limits and dead-letter handling. No automatic retries are provided; failed imports require operator diagnosis and re-upload. Jobs interrupted in processing require explicit recovery.

## Scope and verified behavior

The attached English example extracted one main question, passage and five children. Parser fixtures cover Unicode text and page continuations. API tests cover unauthorized requests, upload → worker → review → approval → bank export, duplicate approval, invalid signatures and upload limits. Actual multilingual OCR and existing YuktiPrep SSO/database connections remain unverified. MCQ/nested-part limitations in README.md still apply.
