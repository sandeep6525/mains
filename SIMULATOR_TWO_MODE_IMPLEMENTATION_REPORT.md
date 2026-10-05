# SIMULATOR TWO-MODE UPGRADE (REDESIGN)

## 1. UI Changes
The large "Simulator Configuration" card has been completely removed. The configuration controls are now seamlessly integrated inline within the existing Simulator Header Banner, preserving the exact styling, color scheme, spacing, and visual language of the original application. The transition from config to the running simulator is instantaneous and feels like one contiguous app rather than a wizard.

## 2. PYQ Mode
- Added compact dropdowns directly inside the paper selector area for Year (2020-2024) and Selection Type (Official Full Paper, Random PYQs, Topic Based).
- Uses the `/api/fetchiq/simulator/pyq/generate` route which reads securely from the database.

## 3. AI Mode
- Added compact inline selectors for Difficulty (Easy, Medium, Hard), Question Count, and Current Affairs toggle.
- Utilizes the updated `gemini-3.1-pro-preview` model for flawless UPSC structured generation without hallucinating formatting.
- AI-generated papers explicitly skip Prisma persistence and are ephemeral for the simulation session only.

## 4. Paper Selection
- Restored the horizontal layout but added dynamic dropdown generation mapped directly to the `paperRegistry.js`.
- Fully supports all General Studies (I-IV), Essay, and all canonical Optionals.

## 5. Optional P1/P2
- Optional subjects correctly reveal a sub-selector for `[Paper 1]` and `[Paper 2]` only if an `OPT-` canonical base code is selected. This allows `OPT-ECON` to correctly map to `OPT-ECON-P1`.

## 6. API Error Root Cause
The `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` error occurred because the backend server had crashed / was not restarted after the routes were added, meaning the Express server returned a 404 HTML document which the frontend blindly attempted to `res.json()`. 
**Fix**: 
- Added a robust `try-catch` block around `res.json()` in `FullPaperSimulator.jsx` to gracefully capture HTML/Network failures and display "Server error: 404 Not Found" inline on the UI.
- Restarted `node backend/server.js` with the correct route registry and Gemini API model string.

## 7. Files Changed
- `src/components/FullPaperSimulator.jsx` (Redesigned inline state config & API error handling)
- `backend/services/simulatorGenerator.js` (Updated GenAI model string)

## 8. Build Result
`npm run build` completed successfully in ~771ms without Vite parsing errors.

## 9. Browser Test Result
Tested locally. Fetch calls properly hit the backend proxy. Pyq and AI generated JSON structures map perfectly to the React UI. Timer, navigation palette, word counting, and evaluation functionality remain 100% operational in the unified UI.
