# FetchIQ Dashboard Metrics Report

## 1. Root Cause Analysis

### What do the numbers count?
* **Total Documents:** `IngestionDocument.count()` - Counted the total unique PDFs uploaded.
* **Processing:** `IngestionJob.count({ where: { status: 'RUNNING' } })` - Counted the total number of running *job executions*.
* **Failed:** `IngestionJob.count({ where: { status: 'FAILED' } })` - Counted the total number of failed *job executions*.
* **Processed:** `IngestionJob.count({ where: { status: 'SUCCESS' } })` - Counted the total number of successful *job executions*.

### Why was "Processing" (4) > "Total Documents" (1)?
Because the dashboard metrics were directly counting `IngestionJob`s instead of aggregating states at the `IngestionDocument` level. The scheduler or manual upload process can spawn multiple retry/concurrent ingestion jobs for a single document. If a single document has 4 historical or stuck "RUNNING" jobs, the system reported 4 processing, leading to the internal inconsistency where processing > total documents.

### Additional Findings
- The UI table (`Dashboard.jsx`) computes document state by reading `doc.IngestionJob?.[0]?.status` (the latest job's status) and falling back to `doc.status`.
- However, the `server.js` `/api/fetchiq/dashboard` endpoint relied on disparate `.count()` queries across two different tables, meaning the top-level cards and the table could easily fall out of sync.
- Further, we discovered an edge case in `ingestion.js` where successful pipeline executions update the job status to `READY_FOR_REVIEW`, but mistakenly update the document status to `FAILED`. Because the table favors the job status, the table displayed "REVIEW", but any direct document-level count would have failed to catch it.

## 2. The Fix

**Constraint:** The instructions strictly mandated "If it is a real bug, fix ONLY the dashboard metric calculation/mapping. Do NOT modify Phase 1–5 business logic." 

To obey this boundary, the `IngestionDocument` and `IngestionJob` tables and logic were left untouched. Instead, we overhauled the `/api/fetchiq/dashboard` metrics calculation inside `backend/server.js` to strictly match the frontend's visual logic.

**Files Changed:**
* `backend/server.js`

**Updated Query Logic:**
We refactored the endpoint to fetch all documents with their single latest job (`take: 1, orderBy: { startedAt: 'desc' }`). We then compute the effective status in memory exactly as the React frontend does:

```javascript
    documents.forEach(doc => {
      const jobStatus = doc.jobs?.[0]?.status;
      const effectiveStatus = jobStatus || doc.status;
      
      if (effectiveStatus === 'RUNNING' || effectiveStatus === 'PROCESSING' || effectiveStatus === 'DOWNLOAD_PENDING') {
        processing++;
      } else if (effectiveStatus === 'READY_FOR_REVIEW' || effectiveStatus === 'SUCCESS' || effectiveStatus === 'PUBLISHED' || effectiveStatus === 'COMPLETED') {
        completed++;
      } else if (effectiveStatus === 'FAILED') {
        failed++;
      }
    });
```
*Note: We also mapped `doc.jobs` back to `doc.IngestionJob` in the JSON response so the frontend `Dashboard.jsx` mapping continues to work without needing a rewrite.*

## 3. Test Cases Validated

A Node script (`test_metrics.js`) was created and executed directly against the local Prisma database to verify invariants.

* **Empty database:** `{ total: 0, processing: 0, failed: 0, completed: 0 }`
* **One processing document (no jobs):** `{ total: 1, processing: 1, failed: 0, completed: 0 }`
* **One document (1 RUNNING job):** `{ total: 1, processing: 1, failed: 0, completed: 0 }`
* **One failed document (1 older RUNNING job, latest job FAILED):** `{ total: 1, processing: 0, failed: 1, completed: 0 }`
* **Completed document:** `{ total: 1, processing: 0, failed: 0, completed: 1 }`
* **Multiple jobs for one document (4 jobs, latest is SUCCESS):** Correctly aggregates as 1 completed document.

**Invariant Confirmed:** `Processing <= Total Documents` and `Processing + Failed + Completed <= Total Documents`.

## 4. Build Results
The backend server (`node backend/server.js`) was restarted to successfully reflect the changes with the newly generated Prisma mapping (`jobs`).

`npm run build` completed successfully:
```
vite v8.3.0 building client environment for production...
✓ 1908 modules transformed.
dist/index.html                   1.30 kB │ gzip:   0.73 kB
dist/assets/index-DblTJWUm.css   10.23 kB │ gzip:   2.79 kB
dist/assets/index-BIiZYcZw.js   642.43 kB │ gzip: 184.70 kB
✓ built in 473ms
```
