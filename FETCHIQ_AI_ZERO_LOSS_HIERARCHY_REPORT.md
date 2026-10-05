# FetchIQ AI Zero Loss Hierarchy Report

## 1. Root Cause
The previous AI `SAFE MERGE` logic was heavily dependent on exact 1-to-1 array index mappings and overly simplistic `find()` operations. This caused Gemini's hierarchical reductions (e.g. condensing 1, 1(a), 1(b) into a single Q1) to silently drop the trailing original OCR fragments. Those dropped fragments disappeared from the `intel.questions` JSON state entirely, leading to missing questions and breaking the fundamental requirement that AI should only enhance—not delete—OCR evidence.

## 2. Architecture & Merge Algorithm
To fix this, the `SAFE MERGE` logic in `backend/routes/ingestion.js` was entirely rewritten to implement a **Deterministic Fragment Conservation Strategy**:

1. **ID Enforcement**: Every single raw `ocrEvidence` fragment is guaranteed a unique `id` prior to AI processing.
2. **Deterministic Parent Matching**: We match Gemini's parent questions to existing OCR fragments by robustly scanning for equivalent explicit question numbers (parsing strings and normalizing symbols).
3. **Deterministic Subquestion Matching**: We perform a secondary inner scan across `ocrEvidence` to locate exactly which subquestions correspond to Gemini's labeled subparts, checking combinations like `qNum(label)` or explicit `subQuestion` fields.
4. **Zero OCR Loss Validation**: Every matched fragment ID is recorded. After the entire Gemini hierarchy is rebuilt and merged with local OCR fragments, we execute a mathematical diff: `originalFragmentIds - matchedFragmentIds`.
5. **Unresolved Fallback Appending**: Any OCR fragment that Gemini omitted or failed to structure is appended to the bottom of the final payload as `UNRESOLVED_OCR_EVIDENCE`, ensuring absolute Zero OCR Loss.

## 3. UI Updates
`Review.jsx` was enhanced to recognize `UNRESOLVED_OCR_EVIDENCE`.
- Unresolved evidence now renders with a red `UNRESOLVED EVIDENCE` badge instead of `Q.`.
- "MISSING" flags on empty English/Hindi textboxes are hidden for unresolved evidence, preventing false alarms since the text typically sits entirely on one language field when it is unresolved raw text.

## 4. Test Results
- **test_ai_zero_loss_hierarchy.cjs**: A regression suite was created testing 5 core failure modes (Hierarchy Grouping, Missing Gemini output, Null/Empty values). All assertions passed, confirming 0 fragments are lost under any failure condition.
- **npm run build**: Passed.

## 5. Files Changed
- `backend/routes/ingestion.js`: Implemented the zero-loss fallback algorithm in the `/ai-analyze` endpoint.
- `backend/tests/test_ai_zero_loss_hierarchy.cjs`: Regression suite.
- `src/components/FetchIQ/Review.jsx`: Rendering logic for `UNRESOLVED_OCR_EVIDENCE`.

*Note: Python OCR files, database schemas, and publishing routines remain strictly unmodified.*
