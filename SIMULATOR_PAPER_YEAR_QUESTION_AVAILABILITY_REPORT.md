# 3-Hour Simulator: Paper, Year, and Question Availability Report

## 1. Current Problem and Root Cause
**Problem:** The simulator's configuration screen was presenting hard-coded years (2020-2024), offering paper selections regardless of actual database availability, and maintaining mismatched selections when users swapped between modes or papers. Furthermore, the UI allowed invalid configurations like `Economics` without a Paper 1 / Paper 2 specifier, and `AI Generated` mode was not robustly mapping selected optional subjects to its underlying prompt structure.
**Root Cause:** The `FullPaperSimulator.jsx` UI was completely decoupled from the actual `PyqQuestion` database state. The configuration controls statically rendered all options instead of being data-driven by the existing `isPublished = true` constraints, leading to false promises of "Official Full Papers" that were empty or incomplete.

## 2. API Added / Updated
To fix this, a new backend endpoint was created to serve as the source of truth for simulator configuration availability:
- **`GET /api/fetchiq/simulator/pyq/availability`**
  - Uses `prisma.pyqQuestion.groupBy` to efficiently compute exact question counts for every `[paper_code, year]` combination where `isPublished: true`.
  - The returned `availabilityData` dictionary is loaded globally by `FullPaperSimulator.jsx` on mount.

## 3. Database Query
The new endpoint executes the following core Prisma query:
```javascript
const stats = await prisma.pyqQuestion.groupBy({
    by: ['paper_code', 'year'],
    _count: { id: true },
    where: { isPublished: true }
});
```
This guarantees that only fully processed, valid, and published questions affect the simulator's configuration options.

## 4. Paper and Year Availability Handling
- **Dynamic Papers:** The `General Studies` and `Optional` dropdown lists are now strictly filtered. If `sourceMode === 'PYQ'`, a paper is only shown if it exists as a key in the `availabilityData` object.
- **Dynamic Years:** When a valid paper is selected, the Year dropdown is immediately populated by extracting the corresponding available years from `availabilityData`. Hardcoded years have been completely removed from this UI flow.
- **Auto-Correction:** If the user changes their Paper selection and their previously selected Year is invalid for the new Paper, the system immediately clears the invalid year and defaults to the most recent valid year available.

## 5. Optional P1/P2 Handling
- The `Paper 1 / Paper 2` toggle buttons exclusively appear for `OPT-` subjects.
- For PYQ mode, if `OPT-ECON-P1` has questions but `OPT-ECON-P2` does not, the `Paper 2` button is dynamically hidden.
- The `getSelectedCanonicalCode()` explicitly stitches the base code and the paper part together (e.g., `OPT-ECON-P1`) to ensure the backend only queries or generates against the correct canonical code.

## 6. Question Selection Modes
- **Official Full Paper:** We now compute `currentAvailableQuestionsCount` and compare it against `requiredQuestionsCount` (defined in `simulatorConfig.js`, usually 20). If there are insufficient questions to form a complete official paper, the `Start Simulator` button is disabled, and an inline error ("Official full paper is not available for this year") is shown.
- **Random PYQs & Topic Based:** The generation endpoint now explicitly filters by the selected `year` and `paper_code` across all modes to ensure questions do not leak across papers or years.

## 7. AI Mode Robustness
AI mode leverages the same unified `simulatorConfig.js` service to extract the correct `displayName` and structural instructions. When a user requests `AI Generated + Economics + P1`, the Gemini prompt is explicitly fed `Subject/Paper: Economics - Paper 1` and `Paper Code: OPT-ECON-P1`, guaranteeing structurally accurate simulation without polluting the context with generic GS directives.

## 8. Test Results and Build Verification
- **Build Status:** `npm run build` completed successfully with 0 errors.
- **Frontend Validations:**
  - `GS-I` + `2024` accurately displays availability (e.g., "20 Questions Available") and permits starting.
  - Optional `P1 / P2` toggles function precisely and format the payload accurately.
  - UI strictly prohibits starting Official Full Papers for incomplete data.
- **Backend Validations:**
  - Error catching correctly logs technical DB/JSON errors via `console.error` while surfacing a clean `Unable to generate the paper. Please check the server and try again.` message to the user.
  - Query bounds enforce `paper_code` matches exclusively.

## 9. Files Changed
- `src/components/FullPaperSimulator.jsx` (Redesigned config UI to be data-driven)
- `backend/routes/simulator.js` (Added `/pyq/availability` endpoint and enforced year filtering)
- `backend/services/simulatorGenerator.js` (Passed `config` to Gemini payload for AI mode)
- `src/config/simulatorConfig.js` (Created unified paper configurations)
