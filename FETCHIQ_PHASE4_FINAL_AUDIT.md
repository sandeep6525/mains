# FetchIQ Phase 4 Final Audit Report

*(Previous sections truncated for brevity. Refer to original audit for full details.)*

## Phase 4 Blocker Fix

### 1. Root Cause
- **SystemLock Concurrency:** The previous implementation used Prisma `upsert`, which blindly overwrites rows regardless of their existing state. This defeated mutual exclusion, allowing multiple schedulers to trigger concurrently.
- **PYQ Uniqueness:** The previous implementation used a compound index `@@unique([year, paper_code, id])`. Since `id` is natively a `@default(uuid())` primary key, the index was inherently useless. Logical identity was implicitly bound to string construction logic rather than rigid database structures.

### 2. Exact Files Changed
- `prisma/schema.prisma`
- `backend/services/scraper.js`
- `backend/routes/ingestion.js`

### 3. SystemLock Implementation Correction
- Replaced `upsert` with an atomic, two-step check:
  1. `create()`: Attempts to unconditionally insert the lock. If it already exists, this throws a Prisma uniqueness constraint error safely.
  2. `updateMany()`: Catching the error, the scheduler attempts an atomic update explicitly enforcing `where: { id: lockId, expiresAt: { lt: now } }`.
- If `updateMany` returns `count: 0`, the lock is active and the cycle safely skips. If `count: 1`, the lock is reclaimed atomically.
- **Normal Completion:** On success, the lock remains active until its natural expiry (+10 mins) preventing immediate redundant executions.
- **Failure:** On `catch`, the lock is immediately forcefully expired (`expiresAt: new Date(0)`), allowing instantaneous retry by another node.

### 4. PYQ Uniqueness Correction
- Modified `PyqQuestion` in `schema.prisma`.
- Added the column `question_number Int`.
- Replaced the flawed constraint with: `@@unique([year, paper_code, question_number])`.
- Updated `backend/routes/ingestion.js`. The `upsert` now relies on `year_paper_code_question_number`, ensuring logical uniqueness guarantees are firmly enforced by SQLite independent of the string format of `id`.

### 5. Concurrency Test Results
Created `test_concurrency.js` to simulate simultaneous promises and crashed processes.
**Results:**
- **TEST A (Simultaneous Start):** Instance A logged `Lock acquired`. Instance B logged `Lock denied - another instance owns lock`. PASS.
- **TEST B (Expiration):** Inserted a stale lock from 20 minutes ago. Instance A logged `Reclaimed expired lock`. PASS.
- **TEST C/D (Failure Release):** Verified `catch` block resets expiry to epoch `0`. PASS.

### 6. Duplicate Test Results
- **TEST F (Logical Publish Check):** With the new `@@unique([year, paper_code, question_number])` constraint, attempting to publish the 2026 GS-I paper twice executes the `upsert` cleanly. No duplicate rows spawn, even if the primary `id` string generation format drifted. PASS.

### 7. Regression Test Results
- **TEST H (Manual Path):** Standard `POST /api/fetchiq/ingestion/upload` continues to accept PDFs successfully. PASS.
- **TEST I (Stop at Review):** Automated scraper drops to `UPLOADED` state. Python script hooks into `PROCESSING` and halts at `REVIEW`. PASS.
- **TEST J (Publish Protection):** Automated scraper explicitly lacks the Prisma `$transaction` logic required to hit `PyqQuestion`. PASS.

### 8. Remaining Limitations
- Single-instance SQLites don't strictly require distributed locks if scaled to 1 container, but the `SystemLock` mechanism perfectly abstracts this if the app is ever migrated to Postgres/MySQL.

**PHASE 4 BLOCKER FIX COMPLETE**
