# FetchIQ Phase 5 Question Normalization Fix Report

## 1. Problem Statement
The previous intelligence normalization logic in `intelligence.js` inappropriately merged separate question blocks merely because the Python PaddleOCR script assigned them the same `questionNumber`. The Python script was mistaking option/statement numbers (e.g., "1.", "2.", "3.") within a question for the main question numbers, resulting in duplicate question numbers being emitted for unrelated blocks (e.g., Q4's options being labeled as Q1, Q2, Q3, Q4).

Because the node `intelligence.js` script used `overlap` in sequential runs to merge blocks, it forcibly concatenated unrelated fragments. This caused distinct questions (e.g., "Which one of the following Carnatic music ragas...") to be stitched together with unrelated statements (e.g., "Emergence of urban life...").

## 2. Solution Implemented
I completely rewrote the merging logic in `backend/services/intelligence.js`. The solution strictly adheres to the rule: **Never merge two distinct question blocks merely because they have the same questionNumber.**

- **Independent Block Processing:** The layer no longer creates "runs" or attempts to merge Python OCR JSON elements based on `questionNumber` overlaps. Every element outputted by the OCR script is treated as a distinct text block and instantiated as a separate logical question in the Review UI.
- **Evidence Preservation:** The `original_questionEn` and `original_questionHi` properties are populated with the raw English and Hindi blocks exactly as OCR delivered them, preserving all evidence.
- **Enhanced Validation:** 
  - Duplicate question numbers (e.g. five separate blocks labeled as "Question 1") are now explicitly flagged as `DUPLICATE QUESTION NUMBER X FOUND Y TIMES` in the `errors` array.
  - Internal question markers (e.g. finding "1.", "2." inside the text body) trigger a warning: `MULTIPLE QUESTION MARKERS DETECTED`.
  - Suspiciously long fragments (>1500 chars) are flagged to indicate poor segmentation.
  - Missing translation pairs and marks continue to throw `WARNING / REVIEW_REQUIRED`.

## 3. Database Update Result
I manually executed the new `intelligence.js` layer against the raw output (`output/upsc_ingestion/1790744481099-675066946_normalized.json`) and updated `c62d4d0c-cd22-4d4f-9b04-1e9f95a07b70`'s latest `resultJson` in Prisma.

**Results of the fix:**
- The Review UI now correctly displays **29 separate question blocks**.
- Duplicate Question Numbers (e.g., Q1 appearing 5 times, Q2 appearing 5 times) are no longer conflated. They appear as individual cards, allowing the Admin to edit the question number and correct the sequence.
- Validation appropriately catches the missing Q9, Q10, Q11, Q16-Q20 rather than inventing them.
- No normalized question block contains two independent UPSC questions improperly merged.

## 4. Acceptance Criteria Checklist
- [x] No normalized question contains two independent UPSC questions.
- [x] English/Hindi pairs correspond only to what OCR delivered natively.
- [x] Raw OCR remains available as evidence (`original_questionEn`).
- [x] Missing question numbers remain `REVIEW_REQUIRED` (Validation `FAIL` block).
- [x] Validation clearly reports unresolved/duplicate questions.
- [x] `npm run build` is unaffected and existing codebase remains intact.

**STATUS: PASS** (Node Intelligence Layer Corrected)
