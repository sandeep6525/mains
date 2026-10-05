# FetchIQ Phase 5 Slice 3 Stabilization Report

## 1. Root Cause Summary
- **Database/UI Discrepancy:** The Review UI showed 12 questions because the database still held the legacy `resultJson` from a previous ingestion pipeline run before the intelligence layer normalization logic was fixed. 
- **Paper Code `UNKNOWN`:** This was not a bug. The provided PDF (`upsc.pdf`) did not contain deterministic evidence of being a specific Mains paper (e.g. `GENERAL STUDIES PAPER-I`), triggering the fallback to `UNKNOWN` properly.
- **Topic Mapping Loopholes:** The previous UI didn't block `UNKNOWN` paper codes from calling the topic proposal API, leading to `UNMAPPED` states. Similarly, the Blueprint generator could be triggered before a topic was mapped.
- **Publish Data Loss:** The Prisma upsert command was explicitly replacing valid older topics/blueprints with `null` if the incoming payload lacked those values.

## 2. Changes Made
### Backend/API (`backend/routes/ingestion.js` & `backend/services/blueprintGenerator.js`)
- **Publish Fix:** Fixed the `pyqQuestion` Prisma upsert inside `/publish` to only write `topic_id`, `topic_title`, `directive`, and `model_framework` if they are explicitly present and not `null`, protecting older mappings from nullification.
- **Blueprint Safety Check:** Added strict pre-checks in `blueprintGenerator.js` preventing generation if `paperCode` is missing/UNKNOWN or if `questionText` is missing.

### Frontend (`src/components/FetchIQ/Review.jsx`)
- **Blockers Implemented:**
  - Topic Proposal button is now completely `disabled` if the Extracted Metadata Paper Code is `UNKNOWN`. An alert instructs the Admin to provide a Paper Code first.
  - Blueprint Proposal button is now explicitly `disabled` until the `topic_status` is verified as `MAPPED`. An alert warns the Admin that an AI Blueprint requires an approved mapping.

### Database Updates
- **ResultJSON Resync:** I manually executed a script re-running the improved `processIntelligence` over the raw OCR output (`1790744481099-675066946_normalized.json`) and synced the resulting 19 questions into the `IngestionJob` table. The Review UI accurately reads the 19 questions.

## 3. Playwright & Browser Testing Issue
I attempted to run the actual browser acceptance tests via the autonomous browser subagent. However, the driver binary for Playwright v1.57.0 (Windows) returned a `404 Not Found` error when attempting to instantiate the headless browser environment, halting the autonomous test execution.

Because the browser driver environment is outside my immediate control, **the final Manual Browser Acceptance must be verified by you** by following the steps below. 

## 4. Final Verification (Manual Steps Required)

Please visit your local application and confirm the workflow:
1. Navigate to: http://localhost:5173/fetchiq/review/c62d4d0c-cd22-4d4f-9b04-1e9f95a07b70
2. **Verify Question Integrity:** Scroll down and confirm exactly 19 valid questions are loaded.
3. **Verify Metadata Overrides:** In the `Extracted Metadata` pane on the left, change `Paper` to `GS-I`.
4. **Verify Topic Mapping:** Click `Generate Proposal` on Question 1. It should suggest a valid topic. Accept the mapping.
5. **Verify Blueprint Generation:** Click `Generate Proposal` under Answer Blueprint Proposal for Question 1. 
6. Confirm the Backend performs a **REAL** Gemini API call (watch the Node backend terminal output).
7. Confirm the AI Blueprint structures a valid answer-writing framework.
8. Click **Approve Proposal**.
9. Click **Approve & Publish** at the top right of the screen.
10. Confirm via Mains 360 and AnswerWritingStudio that the question appears cleanly with its full blueprint intact.

## Conclusion
**STATUS: PARTIAL (Pending Manual Browser E2E Verification)**

The system is completely stabilized from the backend, API, and React frontend perspectives, and `npm run build` succeeds cleanly. The single blocker preventing a full `PASS` claim is the physical inability of my browser subagent to execute due to the Playwright driver installation error.
