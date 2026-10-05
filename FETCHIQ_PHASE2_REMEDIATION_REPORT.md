# FetchIQ Phase 2 Remediation Report

## 1. Root Cause Analysis

### A. Root Cause of Duplicate Q1
The existing parser (due to 2-column complexities) incorrectly treated the massive `Time Allowed : Three Hours` instruction block as "Question 1". Then, it encountered the actual Question 1 and created a second Q1 object. Additionally, on subsequent pages, the footer `(Answer in 150 words) 10` repeatedly triggered false Q1 fragments.

### B. Root Cause of Missing Q5
Q5 was genuinely merged into Q4 by the raw OCR. In `2026_GS1_normalized.json`, the Hindi block for Q4 read:
> "... cyclones. 5"Tundra regions are ecologically fragile..."
Because the parser didn't segment it into a new object, Q5 completely disappeared from the question count.

### C. Root Cause of Instruction-as-Question
The Python extraction scripts do not natively understand UPSC document structure. They greedily capture the first block of text on the first page and try to assign it to the active question number (which initializes at 1).

---

## 2. Normalization Fixes Implemented

Without touching `test_question_parser.py` or any other raw extraction scripts, I significantly improved the FetchIQ Node.js Normalization layer (`backend/services/intelligence.js`):

1. **Document Instructions Extraction:** 
   The logic now identifies major instruction blocks (e.g., `Time Allowed`, `QUESTION PAPER SPECIFIC INSTRUCTIONS`) and safely moves them into a dedicated `document.instructions` field, dropping them from the question processing pipeline.
   
2. **Footer Fragment De-noising:** 
   Regex checks were added to identify repeating footer fragments (like `(उत्तर 150 शब्दों में दीजिए) (Answer in 150 words) 10`) which are purely metadata fragments. These are filtered out from becoming standalone questions.

3. **Sub-segmentation (Recovering Q5):** 
   A secondary segmentation pass was added to the raw question blocks. Using the Regex `/(?:\s|^)(1[0-9]|20|[2-9])(?=["'a-zA-Z\u0900-\u097F])/g`, the normalizer scans inside every raw question block to find embedded starting numbers. It successfully detected the `" 5"` embedded inside Q4 and split it into a distinct Q5 block!

4. **Bilingual Separation (Pairing):** 
   Since the OCR frequently dumped English text into the `.hindi` field, I implemented a script-based separation logic. It splits the raw question string into clauses and sorts them by the presence of Devanagari Unicode ranges (`[\u0900-\u097F]`). English phrases go to `questionEn` and Hindi phrases to `questionHi`. 

---

## 3. Real Test Results (2026_GS1.pdf)

Re-running the actual `papers/2026_GS1.pdf` through the updated normalization layer produced vastly superior results:

- **Missing Question 5:** **FIXED.** Q5 was successfully recovered from the Q4 block and instantiated in the JSON array.
- **Duplicate Question Number 1:** **FIXED.** The parser correctly merged the fragmented pieces and discarded the instruction noise. The output now has exactly one Q1.
- **Instruction Separation:** **FIXED.** The `document.instructions` field is successfully populated, and Q1 is no longer bloated with document metadata.
- **Question Count:** **PASS.** The array now correctly contains exactly 20 distinct questions matching the expected document metadata.

### Validation Result:
**Status: `REVIEW`** (Upgraded from `FAIL`)
- **Errors (`0`)**: No missing questions, no duplicates, no empty strings.
- **Warnings (`16`)**: The system generated `MISSING MARKS` or `MISSING TRANSLATION PAIR` warnings for several questions (like Q2, Q3) because the raw OCR completely failed to capture those fragments in the JSON.

This is the **intended and correct behavior**. The validation layer downgraded from `FAIL` (structural damage like missing Q5) to `REVIEW` (missing metadata like 10 marks), safely allowing the Admin to fill in the missing 10/15 marks on the dashboard instead of automatically passing a flawed paper.

---

## 4. Remaining Limitations
- While English/Hindi pairing is much better, severe structural OCR failures (where the Python engine simply drops half a page) still result in missing text. We cannot magically recover text that wasn't OCR'd. The `REVIEW` status handles this perfectly by alerting the admin.

## 5. Files Modified
- `backend/services/intelligence.js`

Phase 2 Remediation is complete and deterministic. Awaiting approval to proceed to the Admin Review & Pyq Publish phase.
