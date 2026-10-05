# FetchIQ Review Question Soft Delete Report

## 1. Feature Overview
Implemented a safe, non-destructive "Remove Question" workflow inside the FetchIQ Review page. Admins can now explicitly mark a question as "REMOVED" before publishing, which completely excludes the question and its sub-questions from the final `PyqQuestion` publish step. The original OCR and AI evidence is retained 100% in the underlying Intelligence job payload.

## 2. Files Changed
- `src/components/FetchIQ/Review.jsx`
  - Added `removeConfirm` state and a confirmation modal.
  - Added a `<Trash2>` "Remove Question" button in the question card header.
  - Rendered a compact "REMOVED FROM PUBLICATION" row for any question with `reviewStatus === 'REMOVED'`, along with a "Restore" button.
  - Updated the Questions header to display counts: `20 ACTIVE • 2 REMOVED`.
  - Modified the frontend `runValidation` function to skip entirely any question marked as removed. This guarantees that missing translations or marks on removed questions don't block the document from reaching the `READY_TO_PUBLISH` state.

- `backend/routes/ingestion.js`
  - Added an exclusion rule inside `POST /document/:id/publish`.
  - Before upserting `PyqQuestion` entities, the loop safely skips any question where `reviewStatus === 'REMOVED'` or `excludedFromPublish === true`.
  - Logs the skipping in the publishing diagnostics object.

- `backend/tests/test_review_question_soft_delete.cjs`
  - Created an integration test confirming that removed questions are skipped during the publish transaction, and all active questions are safely inserted.

## 3. Behavioral Guarantees
- **Persistence:** Because the `reviewStatus` property is added directly to the existing `intel.questions` array, it leverages the existing `autosave` loop. No new database schema fields or separate endpoints were required.
- **Publish Safety:** The `publish` endpoint will ignore the question entirely.
- **Restore Behavior:** Clicking `Restore` instantly returns the question to `ACTIVE` state, retaining all previous edits, markings, translations, and AI confidences.
- **Sub-question Hierarchy:** Removing a parent question automatically excludes the entire hierarchy from publication because the flag lives on the parent root object.
- **Zero-loss Regression Checked:** The physical `ocrResult` array and fragments remain unmodified, ensuring that zero evidence is destroyed.

## 4. Build Result
`npm run build` executed successfully without errors.
