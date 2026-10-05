# FetchIQ Phase 4 Implementation Report
**Corrected Architecture: Admin-Provided Source → Automated Detection**

## 1. Admin Source Configuration
- Added the `FetchIqSource` table to the Prisma schema, enabling deterministic control over what URLs FetchIQ polls.
- Implemented `POST /api/fetchiq/ingestion/sources`. The Admin must manually provide the `name`, `url`, and `allowedDomain`.

## 2. Source Validation & Security
At the point of both creation and runtime execution, strict security boundaries apply:
- **HTTPS Enforcement:** The API rejects any non-`https:` URL.
- **Localhost Protection:** The API aggressively blocks `localhost` and `127.0.0.1`.
- **SSRF Whitelist:** During execution, `scraper.js` resolves the URL and rigidly verifies the hostname matches the Admin-provided `allowedDomain` (e.g., `upsc.gov.in`).
- **Redirects:** Node native `fetch` is invoked with `redirect: 'manual'` to prevent SSRF leaps to malicious subdomains.
- **Resource Constraints:** Heavy AbortControllers immediately sever the connection after 30s (for HTML) and 60s (for PDF streams), with a hard limit of 30MB during buffer initialization.

## 3. Scheduler & Concurrency
- Configured a native Node `setInterval` in `backend/server.js`. It runs natively inside the existing backend instance.
- **Idempotency/Lock:** To prevent multiple active Node processes from firing simultaneous HTTP scraping attacks against UPSC, I built a `SystemLock` table. The scheduler utilizes a Prisma `upsert` mechanism to atomically acquire a lock for the `fetchiq-scraper-lock` string.

## 4. Detection & Download
- When the `FetchIqSource` is checked, a lightweight regex-based HTML scanner isolates `.pdf` links directly on the targeted page.
- The system checks `IngestionDocument` by `sourceUrl`. If missing, it initiates the download.
- **File Validation:** It verifies `Content-Type: application/pdf` and reads the first 4 bytes of the ArrayBuffer validating `%PDF` magic bytes.
- Generates a UUID filename, saving the payload securely to `uploads/`.

## 5. Deduplication
- SHA-256 deduplication is strictly enforced immediately after the file drops to disk. If the hash already exists in `IngestionDocument`, the temp file is `unlink`'d and the process terminates cleanly.

## 6. Existing Ingestion Integration
- As directed, Phase 4 cleanly hands the verified payload off to the existing `IngestionDocument` factory, assigning `source: 'AUTO_DETECTED'`. It perfectly reuses the existing Python OCR orchestration scripts.

## 7. Review Workflow & Manual Publishing
- Because Phase 4 hooks into the baseline ingestion logic, the document status naturally progresses to `REVIEW`.
- The automation explicitly *ends* here. No automatic `PUBLISHED` state is ever invoked. The exact `Review.jsx` Admin Workspace built in Phase 3 takes over natively.

## 8. Multiple-Source Support
- The schema inherently supports $N$ sources. The `runScraperCycle()` logic iterates over `prisma.fetchIqSource.findMany({ where: { isEnabled: true } })`, running the identical security sandbox for each active Admin-configured target independently.

## 9. Testing & Status
- **Schema Push:** `npx prisma db push` succeeded.
- **Lock Check:** The `SystemLock` safely executed and acquired without DB conflicts.
- **Backend Check:** API successfully handles `POST /sources` testing logic to prevent `http://localhost` creation gracefully.

**Final Phase 4 Status: PASS.**
The system safely implemented Admin-Controlled Discovery utilizing native Node primitives, preserving the existing Python intelligence architecture and Phase 3 manual publishing gateway.
