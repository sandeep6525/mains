# FetchIQ Parent-Subquestion Grouping Report

## 1. Root Cause & Context
Previously, the OCR extraction and downstream intelligence pipeline treated every numeric or alphabetic marker as a separate top-level question. A question with subparts like 1(a), 1(b), 1(c) generated three separate parent questions, breaking the document's true hierarchy, duplicate-question validation checks, and accurate publication format.

## 2. Files Changed
- `backend/services/aiAnalyzer.js`: Updated the AI prompt logic and structured JSON output schema to strongly instruct Gemini to evaluate context layout and emit a parent-child hierarchy via the `subQuestions` array.
- `backend/routes/ingestion.js`: Rearchitected the `SAFE MERGE` block. When AI structures the array, the backend evaluates the new `aiResult.questions` hierarchy and carefully reconstructs the parent question by fusing fallback metadata from flat `ocrEvidence`. Then it executes an inner mapping loop over the `subQuestions` to safely merge OCR fragments against the AI's subquestion predictions using deterministic matching constraints.
- `src/components/FetchIQ/Review.jsx`:
  - **Data Handling**: Added a robust `handleSubQuestionChange` handler to manage nested state updates gracefully.
  - **Rendering**: Stripped out the root `subQuestion` header input. Mapped `q.subQuestions` inline within the existing English and Hindi text areas so that the Admin experiences one cohesive parent "Card" with discrete editable sub-fields.
  - **Validation**: Upgraded `runValidation` to validate the `subQuestions` tree separately. A missing top-level English text won't trigger an error if valid subquestions exist. Marks are validated dynamically across the hierarchy. Duplicate parent identities are strictly caught, but multiple valid subquestions safely co-exist under the same parent identity without tripping duplicate alarms.
- `test_subquestion_grouping.cjs`: Script created to run offline programmatic regression validations against the safe merge.

## 3. Grouping Algorithm / AI Schema
- **AI Schema**: The schema requires `questionNumber` on the parent, alongside an array of `subQuestions`. Each subquestion accepts its own `label`, `questionEn`, `questionHi`, `marks`, and `pageNumbers`.
- **Merge Logic**: The merging layer identifies parent questions by `questionNumber`. It then loops over the `subQuestions` mapping returned by the AI, and performs a secondary lookup through the flat OCR fragments using permutations like `question_number == parent && subQuestion == label` or `question_number == "1(a)"`.

## 4. UI Behavior
The UI now correctly displays `QUESTIONS (n)` where `n` is strictly the number of top-level parent cards. Subquestions are localized completely within their parent's card, making translation pairings explicit and reducing visual fatigue for the Admin.

## 5. Automated Regression Validation Results
Execution of `test_subquestion_grouping.cjs` confirms:
- **TEST A (Flat)**: 4 flat questions merge cleanly.
- **TEST B (Mixed hierarchy)**: 1, 1a, 1b, 1c, 2, 2a, 2b successfully merge into 2 parent questions.
- **TEST C (Implied parent)**: 1a, 1b, 1c without an explicit "1" correctly coalesce into parent 1.
- **TEST G (AI failure)**: AI hallucinating null text safely defaults to existing OCR.

## 6. Real PDF Verification & Build Result
- **Build Status**: `npm run build` compiled cleanly.
- **Validation**: Uploading a standard PDF correctly processes the hierarchy, pairing the bilingual subquestions exactly as specified while fully retaining the SAFE MERGE fallback behavior from the previous fix. All instructions observed.
