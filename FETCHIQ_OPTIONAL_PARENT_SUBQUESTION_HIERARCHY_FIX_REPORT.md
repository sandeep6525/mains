# FetchIQ Optional Paper Hierarchy Fix Report

## Overview
The goal was to fix the AI analysis bug for Optional Papers where hierarchical questions (e.g. Q1 -> 1(a), 1(b), 1(c)) were incorrectly parsed, leading to duplicated or unresolved fragments in the Review UI. This caused issues because the OCR process sometimes assigned sequential numbers (2, 3, 4) to subquestions instead of grouping them under their parent question. 

## Root Cause Analysis
1. **OCR Numbering**: The raw OCR output assigned sequential numbers to subquestions. For example, subquestion 1(a) might have been assigned `questionNumber: 2`, and 1(b) assigned `questionNumber: 3`.
2. **AI Merge Logic Flaw**: When Gemini correctly identified the hierarchy (Q1 with subquestions a, b), the `SAFE MERGE` logic failed to match Gemini's output back to the original OCR fragments. It looked for `q.questionNumber == 1` and `q.subQuestion == 'a'`, but the OCR fragment had `q.questionNumber == 2`.
3. **Fragment Dropping**: Because the matching failed, the SAFE MERGE treated the subquestions as entirely new entities created by AI. The original OCR fragments for 1(a) and 1(b) were marked as `UNRESOLVED_OCR_EVIDENCE` and pushed back into the final result as separate top-level questions, creating duplication and layout issues.
4. **Multiple Match Bug**: Even when fragments *did* match, the SAFE MERGE logic only consumed the first matching fragment (`existingSubFrags[0]`). If a subquestion's text was split across multiple fragments (e.g., English on one fragment, Hindi on another), the second fragment was left unconsumed and became `UNRESOLVED_OCR_EVIDENCE`.

## Solution Implemented
1. **Deterministic Hierarchy Detector**: Implemented a preprocessing step *before* Gemini analysis inside `backend/routes/ingestion.js`. This logic deterministically groups fragments by matching patterns like `1(a)`, `(a)`, and explicit `Q` indicators. It normalizes the `ocrEvidence` so that all fragments belonging to a parent-subquestion relationship explicitly share the correct `questionNumber` and `subQuestion` label. 
2. **Multi-Fragment Consumption**: Fixed the `SAFE MERGE` logic in `ingestion.js` to consume *all* OCR fragments that match a Gemini question or subquestion, rather than just the first one (`existingSubFrags[0]`). This safely merges the English and Hindi texts (which are often separated in different OCR fragments) into a single unified subquestion object.
3. **Validation**: The deterministic pre-processing ensures that Gemini receives a cleaner OCR snapshot, and the multi-fragment merge ensures zero OCR loss without duplication. 

## Testing and Verification
- **Test Script Added**: Created `backend/tests/test_optional_hierarchy.cjs` to simulate the deterministic hierarchy parsing and the multi-fragment merge logic.
- **Verification**: Ran the test suite against edge cases (e.g. `1`, `(a)`, `Q2`, `(a)`) and confirmed that fragments correctly adopted the parent question number and subquestion labels.
- **Regression Testing**: Executed `backend/tests/test_ai_zero_loss_hierarchy.cjs` and `backend/tests/test_ai_empty_review_regression.cjs` to ensure that standard GS-I, GS-II, Essay, and Compulsory English papers remain unaffected. All tests passed.

## Outcome
Optional papers with subquestions (1(a), 1(b), etc.) will now be correctly reconstructed by the AI and safely merged back with their original OCR evidence, preserving zero OCR loss and displaying properly nested within the Review UI. No OCR code was modified.
