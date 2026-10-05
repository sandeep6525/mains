# FetchIQ Review Zero Questions Forensic Report

## 1. Document 41d8190f-5e54-4c09-8e9a-77aeb59cd13a (Note: Provided ID 4d18190f was a typo, DB ID is 41d8190f)

### All related IngestionJob records:
**Job ID**: 4e343332-b676-446a-a2a7-26dc0b2d6285
- **status**: READY_FOR_REVIEW
- **createdAt / startedAt**: Wed Sep 30 2026 08:55:23 GMT+0530
- **updatedAt / completedAt**: Wed Sep 30 2026 08:55:24 GMT+0530
- **resultJson exists**: true
- **resultJson question count**: 0
- **validation**: `{"status":"FAIL","errors":["MISSING QUESTION 1","MISSING QUESTION 2","MISSING QUESTION 3",..."MISSING QUESTION 20"],"warnings":[]}`
- **extracted metadata**: `{"exam":{"value":"UPSC CSE Mains"},"year":{"value":null},"paper":{"value":"UNKNOWN"},"paperType":{"value":"UNKNOWN"},"subject":{"value":"General Studies"}}`
- **error/failure reason**: `null`

## 2. Identify the exact latest IngestionJob
The exact latest IngestionJob is **4e343332-b676-446a-a2a7-26dc0b2d6285**.

## 3. Identify the exact IngestionJob returned by the Review API
The exact IngestionJob returned by the Review API is **4e343332-b676-446a-a2a7-26dc0b2d6285**.

## 4. Explain why Review.jsx receives/displays QUESTIONS (0)
The Python OCR extraction failed to find any valid questions in the document (producing an empty `[]` array for questions and `"validationStatus": "FAILED"`). However, the backend (`ingestion.js`) unconditionally sets the job's `status` to `READY_FOR_REVIEW` simply because the JSON file was created on disk. The Review UI then correctly loads this job and displays the 0 questions from the empty `job.resultJson.questions` array.

## 5. Compare the job-selection logic used by Dashboard and Review API
- **Dashboard API** (`server.js`): Uses `jobs: { orderBy: { startedAt: 'desc' }, take: 1 }`
- **Review API** (`ingestion.js`): Uses `jobs: { orderBy: { startedAt: 'desc' }, take: 1 }`
- **Conclusion**: The logic is completely identical. Both APIs pull the exact same most recent job.

## 6. Investigate GS-I PDF.pdf (Document: 3b9121b9-af72-4978-9761-2c5994edd02e)
- **job ID**: 03360721-23b8-43eb-8668-ed55e18a0792
- **RUNNING since when**: Tue Sep 29 2026 19:25:58 GMT+0530
- **whether the Python process is actually alive**: No. Process inspection confirms the `python` process is dead.
- **whether this is a stale RUNNING database record**: Yes. It is an orphaned job. The Node backend likely restarted while the background Python process was running, causing the DB record to remain stuck in the `RUNNING` state without a process attached.
- **any error information**: There is no error message in the DB because the job never actually hit the completion/failure handler.

---

## ROOT CAUSE
1. For the 0-questions issue, `ingestion.js` unconditionally assigns `READY_FOR_REVIEW` to the job status as long as the OCR JSON file exists on disk, ignoring if the file contains 0 questions or failed validation.
2. For the stuck RUNNING issue, the job is an orphaned database record caused by the Node server restarting or crashing while the OCR process was active, meaning the close event never fired.

## SMALLEST SAFE FIX
1. Modify `backend/routes/ingestion.js` to conditionally assign `READY_FOR_REVIEW` only if `intelligentResult.questions.length > 0`; otherwise assign `FAILED`.
2. Manually change the orphaned GS-I job status to `FAILED` in the database to clear the stale `RUNNING` state.
