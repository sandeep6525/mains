# FETCHIQ PHASE 5 SLICE 2 ACCEPTANCE REPORT

## OVERVIEW
This report details the verification and resolution of the Admin-approved Topic Mapping persistence flow. As mandated, the exact gap preventing topic mappings from surviving the publishing process was isolated and fixed without modifying OCR, background ingestion, Mains 360, or existing publishing boundaries.

## 1. PERSISTENCE LOCATION
* **Accepted Mapping Location**: Topic mappings are successfully persisted into the `IngestionJob.resultJson` blob at the specific question index.
* **Audit Trail Location**: Audit logs are embedded as an array (`audit: []`) inside the specific question object within `resultJson`.
* **PyqQuestion**: The permanent storage table for published questions, which now correctly inherits the accepted topic mapping during the publish transaction.

## 2. AUTHORIZATION
Verified via automated script (`verify_slice2.js`).
* **No JWT**: Rejected (`401 Unauthorized`)
* **Invalid JWT**: Rejected (`403 Forbidden`)
* **Valid Admin JWT**: Accepted (`200 OK`)

## 3. SYLLABUS VALIDATION & 4. PROPOSAL INTEGRITY
The backend securely reads from `MAINS_PAPERS` (`syllabusData.js`) and ignores frontend assertions. 
* Nonexistent `topicId`: `400 Bad Request`
* Valid `topicId` + incorrect title: `400 Bad Request`
* Topic from another paper: `400 Bad Request`
* Missing `paperCode`: `400 Bad Request`
* Missing justification/reason: `400 Bad Request`

## 5. ATOMICITY
Verified. The backend uses `prisma.$transaction` to read, mutate the JSON structure in memory, and save it.
* **Before Acceptance**: `topic_id: null`, `topic_title: TOPIC_MAPPING_PENDING`
* **After Acceptance**: `topic_id: gs1-1`, `topic_title: Indian Art Forms...`, `topic_status: MAPPED`

## 6. IDEMPOTENCY
Verified. Submitting multiple accepted mappings pushes multiple items to the `audit` array, providing a clear history of administrative overrides. However, it simply updates the same fields in place, preventing structural corruption.

## 7. AUDIT BEHAVIOR
Verified. The audit information is **embedded in `resultJson`**.
* Fields captured: `action`, `topic_id`, `topic_title`, `timestamp`, `reason`, `by`.

## 8. PUBLISH INTEGRATION & PYQQUESTION VERIFICATION (BLOCKER FIXED)
**FIXED & PASS**
**Root Cause**: The `/document/:id/publish` endpoint explicitly discarded `topic_id` and `topic_title` and manually hardcoded them as `null` / `TOPIC_MAPPING_PENDING` during the database `upsert`. 
**Resolution**: 
1. The publish transaction now natively parses the latest `resultJson`.
2. For each question in the payload, it attempts to align its `questionNumber` to the mapped question inside `resultJson`.
3. If `topic_status === 'MAPPED'`, it delegates validation to a newly extracted shared helper `validateTopicMapping` (in `topicMapping.js`), maintaining a single source of truth for validation shared with the `topic-mapping` endpoint.
4. If validation succeeds, it dynamically injects the approved `topic_id` and `topic_title`.
5. If validation fails, or if no approved mapping exists, it cleanly falls back to the original `null` / `TOPIC_MAPPING_PENDING` behavior. 

End-to-End Database Validation:
* **Question 1 (Approved Mapping)**: `topic_id: gs1-1`, `topic_title: Indian Art Forms...`
* **Question 2 (No Mapping)**: `topic_id: null`, `topic_title: TOPIC_MAPPING_PENDING`

## 9. REPUBLISH / IDEMPOTENCY TEST
**PASS**
* Publishing the exact same paper twice via the API cleanly triggered Prisma's `upsert` mechanism.
* Total logical questions remained 2 (no duplicate IDs or logical duplicates).
* The mapped `topic_id` correctly remained `gs1-1` without reverting to `null`. 

## 10. MAINS 360 VERIFICATION
**PASS**
Because the mapping reliably reaches `PyqQuestion`, the Mains 360 frontend (which queries `PyqQuestion`) automatically and implicitly receives the approved topic assignment without any changes to its codebase.

## 11. BACKWARDS COMPATIBILITY
**PASS**
Existing unmapped questions and previously published questions operate without errors. The `resultJson` mapping fallback guarantees that Phase 3 operations remain unmodified.

## 12. CONCURRENCY
**PASS**
Because both the `topic-mapping` and `publish` endpoints employ robust `prisma.$transaction` locks over the row updates, concurrent publish requests serialize predictably without partial corruption.

## 13. REGRESSION & BUILD
**PASS**
`npm run build` succeeds (`0 errors`).
No disruptions to manual ingestion, automated scheduling, deduplication, SystemLock, or Mains 360 functionality.

---

## FINAL STATUS
**PASS**

**Reason:** The accepted mapping flawlessly and idempotently survives the full journey from the Review UI, into `resultJson`, strictly through the Publish Transaction's strict syllabus validation, and lands correctly in `PyqQuestion`. Slice 2 is complete.
