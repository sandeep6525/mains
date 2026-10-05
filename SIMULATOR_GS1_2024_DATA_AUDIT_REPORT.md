# SIMULATOR GS-I 2024 DATA AUDIT REPORT

## 1. Total 2024 GS-I records
The Prisma database (`dev.db`) contains exactly **20** records for `year = 2024` and `paper_code = 'GS-I'`.

## 2. Published count
There are **0** published records for GS-I 2024 in the database (`isPublished: true`).

## 3. Unpublished count
There are **20** unpublished records for GS-I 2024 in the database (`isPublished: false`).

## 4. Paper-code variants
A `groupBy` query for `paper_code` containing 'GS' for the year 2024 returned exactly one variant:
- `'GS-I'`: 20 records
No anomalous variants (like `GS1`, `GS_1`, etc.) were found in the database.

## 5. Question numbers
The 20 unpublished GS-I records in the database are perfectly sequenced from `1` through `20`. The database successfully holds the complete structure of the paper: `Q1, Q2, Q3 ... Q20`.

## 6. isPublished distribution
For the 20 GS-I 2024 records in the database:
- Questions 1 through 20 all have `isPublished = false`.
None of the genuine database questions have been published.

## 7. Archive data source
The `PYQVaultArchive.jsx` component ("10Y PYQs & Mocks") pulls data using the `getQuestions()` API method from `src/services/api/questions.js`. This method performs a **merge of both**:
A. The `PyqQuestion` database (via `/api/fetchiq/ingestion/pyqs` which filters for `isPublished: true`).
B. The static frontend data (`PYQ_QUESTIONS` / `TEN_YEAR_PAPERS`).
Since the database returns 0 published questions for GS-I 2024, the Archive only displays the static fallback question(s).

## 8. Simulator data source
Following the previous fix, the Simulator's configuration screen also calls `getQuestions()` to calculate availability. Therefore, it identically sees the **0 database questions + 1 static fallback question = 1 Question Available**.

## 9. Generation query
The backend generation query (`POST /api/fetchiq/simulator/pyq/generate`) correctly filters using exactly:
- `paper_code` (e.g., `'GS-I'`)
- `year` (e.g., `2024`)
However, it only searches the database. Since the database has 0 published questions, the backend generator would return a 404/Empty Error for this paper if hit directly. (Note: Our recent fix bypassed this by using the frontend `getQuestions()` output for generation, but the underlying data discrepancy remains).

## 10. Exact root cause
The root cause is a combination of two factors:
1. **Unpublished Database Records:** The entire 20-question 2024 GS-I paper exists cleanly in the database, but all 20 records are flagged as `isPublished: false`. Thus, they are filtered out by the backend API.
2. **Static Fallback Bleed-Through:** Because the DB returns 0 questions, the frontend `getQuestions()` method seamlessly merges in a static, hardcoded dummy question for GS-I 2024 from `src/data/pyqData.js` (`"Evaluate the role of Bhakti and Sufi movements..."`). 
*Explicit confirmation:* The Archive question is static fallback data. It does not match the actual DB Q1 (`"Analyze the importance of Ashokan inscriptions..."`).

## 11. Recommended minimal fix
**Do NOT alter the frontend architecture.** The system is working exactly as designed (protecting unpublished drafts). 
The minimal fix is to formally **publish** the 20 existing GS-I 2024 records in the database. 
This can be achieved by running a secure backend script to update `isPublished = true` for `paper_code: 'GS-I'` and `year: 2024`. Once published, the frontend API will pull the genuine 20 questions, which will automatically override the 1 static fallback question, instantly restoring the full paper in both the Archive and the Simulator.
