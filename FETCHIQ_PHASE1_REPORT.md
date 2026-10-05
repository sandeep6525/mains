# FetchIQ Phase 1 Foundation Report

## 1. Files Created
- `prisma/schema.prisma` (Database schema definition)
- `backend/server.js` (Express API Server)
- `backend/routes/auth.js` (Login endpoint)
- `backend/routes/ingestion.js` (Upload & Python invocation logic)
- `backend/seed.js` (Admin user seeding script)
- `src/components/FetchIQ/Login.jsx` (Admin login UI)
- `src/components/FetchIQ/Dashboard.jsx` (Status dashboard UI)
- `src/components/FetchIQ/Ingestion.jsx` (PDF Upload UI)

## 2. Files Modified
- `src/App.jsx` (Injected simple path-based routing for `/fetchiq/login`, `/fetchiq/dashboard`, `/fetchiq/ingestion` without breaking existing `AnswerWritingStudio` or tab navigation)
- `.env.example` (Added `JWT_SECRET`, admin credentials, and `FETCHIQ_PYTHON_COMMAND`)

## 3. Database Schema
Created the minimal required SQLite/Prisma schema:
- **`AdminUser`**: Tracks `email`, `password`, `id`, and timestamps.
- **`IngestionDocument`**: Tracks uploaded PDFs, safely stored file path, `sha256` for deduplication, and high-level `status`.
- **`IngestionJob`**: Tracks the processing task (`STARTED`, `SUCCESS`, `FAILED`), linking to `IngestionDocument`, and capturing `errorMessage` directly from Python's stderr.

## 4. API Endpoints
- `POST /api/fetchiq/auth/login`: Accepts email/password, returns JWT.
- `GET /api/fetchiq/dashboard`: Returns counts of total, processing, completed, and failed jobs.
- `POST /api/fetchiq/ingestion/upload`: Handles `multipart/form-data` secure PDF upload, saves safely, checks SHA-256 deduplication, creates Prisma records, and invokes the Python OCR orchestrator asynchronously.

## 5. Authentication Flow
- User logs in via the `/fetchiq/login` React UI.
- Express verifies bcrypt hashed password against the SQLite DB (seeded).
- Express returns a JSON Web Token (JWT).
- React stores it in `localStorage` and redirects to `/fetchiq/dashboard`.
- The Dashboard and Upload APIs expect the `Bearer <token>` in headers.

## 6. Upload Flow
- User selects PDF in `/fetchiq/ingestion`.
- Express uses `multer` configured specifically for `application/pdf` with a 50MB limit.
- File is saved in an untrusted backend `/uploads` folder with a randomized hash filename (`Date.now() + random + .pdf`).
- A `sha256` hash is independently calculated to avoid duplication.

## 7. OCR Invocation Flow
- In `backend/routes/ingestion.js`, `spawn()` triggers the Python process.
- The command uses the `FETCHIQ_PYTHON_COMMAND` environment variable.
- Express reads `stdout` and `stderr`.
- If exit code is 0 and the `_normalized.json` output file exists, job succeeds.
- If it fails (like the oneDNN crash), `stderr` is captured directly into `IngestionJob.errorMessage` and the status changes to `FAILED`.

## 8. Environment Variables
- `JWT_SECRET=dev_secret_fetchiq_2026`
- `FETCHIQ_ADMIN_EMAIL=admin@yuktiprep.com`
- `FETCHIQ_ADMIN_PASSWORD=admin123`
- `FETCHIQ_PYTHON_COMMAND=py`

## 9. Commands to Run (Currently Running in Background)
```bash
# Backend Setup and Run
npm install --no-audit --no-fund --force
npx prisma generate
npx prisma db push
node backend/seed.js
node backend/server.js

# Frontend
npm run dev
```

## 10. Test Results
The backend installation, database generation, and dev servers were successfully initiated and are running asynchronously. The React routing has been injected properly without disrupting existing tabs. The Python OCR orchestrator is hooked securely into `child_process.spawn()`.

## 11. Any Errors
- During `npm install`, we encountered file locking (`EBUSY`) from the previous Vite/React processes. The processes were killed, `npm install --force` was run, and the processes were restarted to avoid dependency staleness.
- The OCR script has not yet been executed in a full run *through the UI*, so you are now ready for the final acceptance test.

## 12. Exact Next Recommended Step
**PERFORM YOUR FIRST ACCEPTANCE TEST:**
1. Navigate to `http://localhost:5173/fetchiq/login`.
2. Login with `admin@yuktiprep.com` and `admin123`.
3. Open the Dashboard.
4. Click "+ PROCESS NEW UPSC PAPER".
5. Upload `papers/2026_GS1.pdf`.
6. Confirm backend receives it, creates SHA-256, stores record, runs Python, and either succeeds or captures the exact PaddlePaddle error in the UI.

I will **STOP** here and await your test results and approval to continue.
