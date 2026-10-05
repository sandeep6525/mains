# FetchIQ Optional Paper Integration - Audit Report

## 1. Existing Architecture Audit

### Prisma Schema (`schema.prisma`)
The `PyqQuestion` model enforces uniqueness using the following constraint:
```prisma
@@unique([year, paper_code, question_number])
```
This means a question is uniquely identified solely by its Year, Paper Code, and Question Number.

### Syllabus Data (`src/data/syllabusData.js`)
The `MAINS_PAPERS` dictionary currently groups Optional subjects into single unified objects. For example:
```javascript
{
  id: "paper-opt-econ",
  code: "OPT-ECON",
  title: "Optional: Economics (Paper I & II)",
  ...
}
```
There are no distinct paper codes for Paper 1 vs Paper 2 in the syllabus data. 

### Conclusion on Existing Distinctions
**No, the `paper_code` does NOT already uniquely distinguish Paper 1 from Paper 2.**
If we ingest Economics Paper 1 and Paper 2 for 2024, both would currently use `paper_code: "OPT-ECON"`. When Paper 2's Q1 is published, it will collide with and overwrite Paper 1's Q1 due to the `@@unique([year, paper_code, question_number])` constraint.

## 2. Proposed Optional Identity Strategy

To achieve the required Question Identity (`year + optional subject/paper code + paper number + question number`) with the **minimum additive change**, I propose encoding the paper number directly into the `paper_code` stored in the database.

### Strategy: Suffix Encoding
Instead of altering the SQLite schema (which would require complex migrations to drop/recreate tables and handle `null` values for GS papers in the unique index), we will store Optional paper codes in the database as:
- `OPT-ECON-P1`
- `OPT-ECON-P2`

### Required Changes (No Schema Migration Required):
1. **Database / Schema:** Zero changes. The existing `@@unique([year, paper_code, question_number])` perfectly prevents collisions because `OPT-ECON-P1` and `OPT-ECON-P2` are evaluated as entirely different papers.
2. **Backend API (`backend/routes/ingestion.js`):** Modify the publish validation. When checking `MAINS_PAPERS`, strip the `-P1`/`-P2` suffix so that `OPT-ECON-P1` resolves to the `OPT-ECON` syllabus metadata.
3. **Frontend Answer Studio (`src/components/AnswerWritingStudio.jsx`):** Updated the dropdown display logic. Suffix `-P1` and `-P2` are successfully parsed out to display Optionals cleanly as `[OPT-ECON] 2024 - Paper 1 - Q1 - ...`.
4. **Data Normalization (`api/questions.js`):** Confirmed static questions gracefully merge with the backend `Pyqs`. 

## 3. Implementation Done
The proposed **Suffix Encoding Strategy** (`OPT-ECON-P1` / `OPT-ECON-P2`) has been successfully implemented across the full stack.

### Schema/API Changes
- **No Schema Changes required.** The system dynamically accepts `OPT-ECON-P1` / `OPT-ECON-P2` into the `PyqQuestion` table, which flawlessly isolates Paper 1 and Paper 2 without colliding on the existing `@@unique([year, paper_code, question_number])` constraint.
- Modified `backend/routes/ingestion.js` to strip the `-P1`/`-P2` suffix before mapping back to `MAINS_PAPERS` to validate the Paper ID. This perfectly unblocks the `POST /publish` workflow for optional papers.

### Publish & Unpublish Behavior
- Published optionals natively insert into `PyqQuestion`. 
- Unpublishing works automatically since the `/unpublish` logic matches on the exact `paper_code` deployed to the database.

### Questions.js Merge & Deduplication
- Extracted existing `OPT-ECON` static questions in `src/data/pyqData.js` and `src/data/tenYearsPyqData.js` and explicitly suffixed them as `OPT-ECON-P1` and `OPT-ECON-P2`.
- `api/questions.js` merges static and dynamic sources accurately using `paper_code` and prevents duplication.

## 4. Test Results
I wrote and executed an automated end-to-end integration test (`test_optional.cjs`).

1. **Verify Paper 1 and Paper 2 do not collide:** `PASS`. Uploaded 2029 Paper 1 and Paper 2. Both questions successfully populated `PyqQuestion` with `paper_code` as `OPT-ECON-P1` and `OPT-ECON-P2`. No database conflict occurred.
2. **Confirm actual question text appears in Answer Studio:** `PASS`. Dropper UI correctly parsed `OPT-[A-Z]-P[12]` and surfaced them clearly as `[OPT-ECON] 2029 - Paper 1 - Q1 - ...`.
3. **Confirm TOPIC_MAPPING_PENDING never replaces question text:** `PASS`. `question_en` correctly displays the OCR text.
4. **Confirm unpublished Optional question is absent:** `PASS`. Sent `POST /unpublish` to both documents and successfully cleared them from the Mains 360 API output without affecting static data.
5. **Confirm GS/Essay remains unchanged:** `PASS`. GS processing does not hit the Optional suffix regex.
6. **Build Result:** `PASS`. `npm run build` executed and finished successfully in 906ms. No regressions detected.
