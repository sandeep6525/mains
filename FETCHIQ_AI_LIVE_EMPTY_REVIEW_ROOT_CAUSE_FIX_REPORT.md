# FetchIQ AI Live Empty Review Root Cause & Fix Report

## 1. Live Bug Diagnosis
The live issue presented with 22 questions becoming "MISSING" for both English and Hindi, along with lost paper metadata, and the document entering `READY_TO_PUBLISH` state despite containing no valid text.

**Root Cause Forensics:**
1. **AI Dropping Data:** The AI reconstruction (Gemini) was returning `null` or "MISSING" for text fields, or returning question structures that didn't perfectly map to the original OCR fragments.
2. **Destructive Merge:** The old `SAFE MERGE` logic utilized a simple `||` fallback. If Gemini returned the string `"MISSING"`, the fallback evaluated to `true`, actively overwriting the perfectly valid OCR text with the `"MISSING"` string.
3. **Destructive Metadata:** The old metadata merge blindly applied `aiResult.documentMetadata` without checking for `null`, actively erasing valid metadata extracted earlier.
4. **Validation Blindspot:** The frontend `Review.jsx` validation script counted a question as valid merely if it existed, without enforcing that it contained valid text fields.

## 2. Fix Implementation

### A. Transactional AI Analysis (`backend/routes/ingestion.js`)
- The AI analysis endpoint is now fully transactional.
- A **Before AI Audit** captures the exact number of valid text fields and fragments.
- After merging the AI output, an **After AI Audit** calculates `textLoss`.
- If `textLoss > 0` (meaning valid OCR text was destroyed or omitted), the transaction is immediately **REJECTED**, and the original JSON is preserved safely.
- The UI gracefully warns the user: `"AI analysis was not safely applied. Original OCR has been preserved."`

### B. AI Empty Field Protection
- Implemented an `isValidText()` utility to scrub all variants of null, undefined, empty whitespace, and string literals like `"MISSING"` or `"[missing]"`.
- The merge algorithm uses `??` combined with `isValidText()` to guarantee that Gemini cannot overwrite real text with a placeholder. 

### C. Metadata Persistence
- Extracted metadata (exam, year, paper) is now explicitly protected. The system only updates a field if Gemini provides a validated, non-null string.

### D. Strict Validation Rules (`src/components/FetchIQ/Review.jsx`)
- The `READY_TO_PUBLISH` status is now impossible to reach if `usableQuestionCount === 0`.
- Added logic to explicitly fail validation if any `UNRESOLVED_OCR_EVIDENCE` exists, ensuring no data loss can sneak into production without admin resolution.

## 3. Regression Testing
- Created `test_ai_empty_review_regression.cjs` which systematically runs through 5 distinct failure scenarios (including exact reproductions of the live screenshot bug).
- The tests verify:
  1. AI empty field protection correctly salvages text.
  2. Transactional text-loss correctly rolls back state if OCR is corrupted.
  3. Dropped subquestions are cleanly moved to `UNRESOLVED_OCR_EVIDENCE` (0 drops).
  4. Metadata is explicitly preserved on failure.

All tests passed successfully, and a frontend production build was compiled.
