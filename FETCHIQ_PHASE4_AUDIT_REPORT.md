# FetchIQ Phase 4 Audit & Design Report

## 1. Current Architecture
FetchIQ is currently a semi-manual processing pipeline integrated into the Mains 360 platform.
- **Frontend:** React + Vite, styled with TailwindCSS. Contains FetchIQ Admin pages (`Login`, `Dashboard`, `Ingestion`, `Review`).
- **Backend:** Node.js (Express v5) + SQLite (via Prisma).
- **Extraction Engine:** Python 3.13.5 scripts utilizing PaddleOCR and local heuristics, orchestrated by `ingest_upsc_paper.py`.
- **Intelligence Layer:** Pure JavaScript Regex-based normalization and validation Engine (`intelligence.js`).

## 2. Existing Reusable Components
- **File Upload:** Handled via `multer` securely saving to a local `uploads/` directory.
- **Deduplication:** SHA-256 hash checks on `IngestionDocument` prevent identical files from processing twice.
- **Validation Engine:** `runValidation()` gracefully surfaces structural `FAIL` and non-structural `REVIEW` warnings.
- **Publish Pipeline:** Admin `POST /document/:id/publish` safely upserts into `PyqQuestion` within a `$transaction`.
- **Data Flow:** `getQuestions()` in frontend perfectly merges static `PYQ_QUESTIONS` with dynamic backend SQLite data.

## 3. Existing Ingestion Flow
1. Admin Uploads PDF → `POST /api/fetchiq/ingestion/upload`
2. Save to Disk & Hash Check → Returns 409 if duplicate.
3. Spawns Child Process → Runs `py ingest_upsc_paper.py "<path>"`.
4. Saves raw output to `resultJson`.
5. Normalizes & Validates → Flags `READY_TO_PUBLISH` or `REVIEW`.
6. Admin Reviews via UI → Modifies missing data.
7. Admin Publishes → Atomic Prisma Transaction into `PyqQuestion` schema.

## 4. Existing Database Models
- `AdminUser`: Authentication.
- `IngestionDocument`: Tracks uploaded file, SHA-256, source, and overall status (`UPLOADED`, `PUBLISHED`).
- `IngestionJob`: Tracks process lifecycle of extraction (`PENDING`, `RUNNING`, `SUCCESS`, `FAILED`) and holds the payload in `resultJson`.
- `PyqQuestion`: The canonical source of truth for the Mains 360 frontend to render questions dynamically.

## 5. Phase 4 Security and Operational Corrections

### A. Dependency Decision
- **HTTP:** No `axios` will be installed. Node.js >= 18 native `fetch()` will be used to enforce timeouts and abort controllers natively.
- **Scheduler:** No `node-cron` will be installed. A native `setInterval` mapped to a Database Mutex/Lock will be used to orchestrate jobs.
- **HTML Parsing:** No `cheerio` will be installed unless absolutely necessary. We will attempt targeted Regex parsing of the UPSC HTML payload first. If the DOM is too complex/unreliable, `cheerio` will be proposed as the sole new lightweight dependency.

### B. Scheduler Concurrency Protection
Because multiple backend processes may run simultaneously, a pure memory-based timer will cause duplicate scraping.
- **Design:** We will create a `SystemLock` or `SchedulerState` model in Prisma.
- **Lock Mechanism:** When the `setInterval` triggers, the instance will attempt an atomic `update` on the lock row verifying `lastRunAt < 24_HOURS_AGO`. Only the instance that successfully updates the timestamp will proceed with the fetch, guaranteeing idempotency without Redis/BullMQ.

### C. SSRF Protection & Download Security
Automatic downloading poses severe SSRF (Server-Side Request Forgery) risks. The scraper will strictly enforce:
- **Protocol:** `https://` only.
- **Domain Whitelist:** URL must parse to exactly `upsc.gov.in` (no localhost, private IPs, or arbitrary domains).
- **Redirects:** Explicitly configure `fetch` to `redirect: 'manual'` or rigidly validate `Location` headers against the whitelist before following.
- **File Validation:** Response must have `Content-Type: application/pdf`. After streaming to memory, check the first 4 bytes for the PDF Magic Number (`%PDF-`).
- **Resource Limits:** Enforce a hard timeout (e.g., 30s) via `AbortController` and a max file size (e.g., 30MB) during stream reading.
- **Sanitization:** Discard the remote filename entirely. Generate a secure local UUID filename (`<uuid>.pdf`) and save to `uploads/`. Wait for successful hash before creating DB records.
- **Cleanup:** If hash validation, magic bytes, or size limits fail, aggressively `fs.unlink` the temporary payload.

### D. Failed State & Retry Behavior
If an automated detection or OCR fails, it will drop into `FAILED` status.
- **Visibility:** The Admin dashboard will display a dedicated "Failed Jobs" table.
- **Data:** It will surface the Source URL, Failure Reason (`OCR_TIMEOUT`, `BAD_PDF`), and Timestamp.
- **Retry:** A manual `Retry` button will be exposed in the UI. No automatic exponential backoffs will be implemented in Phase 4 to avoid infinite loops on corrupted official PDFs. No Email/Slack notifications will be wired yet.

### E. API / Data Contract Revisions
To support this in the frontend, the existing schema must be augmented:
- **Database Schema Changes:** 
  - `IngestionDocument`: Add `sourceUrl` (already exists, but needs proper enforcement), `detectedAt` (DateTime), `downloadedAt` (DateTime).
  - Add `SystemLock` model for scheduler concurrency.
- **API Changes:** 
  - The `GET /api/fetchiq/dashboard` must return expanded objects showing `source = MANUAL | AUTO_DETECTED` and detailed failure logs.
  - Create `POST /api/fetchiq/ingestion/retry/:id` to support manual admin retries on failed auto-detections.
- **Frontend Changes:**
  - `Dashboard.jsx` needs two tabs/tables: "Uploads" and "Auto-Detected".
  - The list view must surface `sourceUrl`, `failure reason`, and timestamps.

## 6. Implementation Plan Sequence (Phase 4)
1. **Schema Update:** Add `SystemLock` to `prisma/schema.prisma` and ensure `sourceUrl`, `detectedAt`, and `downloadedAt` exist on `IngestionDocument`. Run `npx prisma db push`.
2. **Scraper Core:** Build `backend/services/scraper.js` utilizing native `fetch` with strict SSRF/Whitelist controls and PDF magic-byte validation.
3. **Concurrency Lock:** Build the database-backed mutex logic.
4. **Integration:** Wire the scraper to drop downloaded files securely into the existing `ingestion.js` pipeline.
5. **API Expansion:** Update Dashboard API endpoints to serve automated metadata and failure reasons. Add the retry endpoint.
6. **Frontend Update:** Update `Dashboard.jsx` to parse the new API contract and surface the manual/auto-detected distinction.
