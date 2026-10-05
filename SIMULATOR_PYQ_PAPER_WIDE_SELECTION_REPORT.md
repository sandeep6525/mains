# SIMULATOR PYQ PAPER WIDE SELECTION REPORT

## Old Behavior
Previously, the 3-Hour Simulator's PYQ Mode required the user to configure the simulation by selecting a specific canonical paper code, a specific year (e.g., 2024), and a specific PYQ selection rule (Official Full Paper, Random PYQs, or Topic Based). The availability and generation of questions were constrained by both the paper code and the chosen year. If a given year had no questions, the simulator would display a year-specific error or show empty/0 availability.

## New Behavior
In the updated PYQ Mode, the Year dropdown and Selection Rule dropdowns have been entirely removed. The user now only selects a Canonical Paper. The simulator instantly displays the total count of PYQ questions available across *all years* for that paper.
- If the count is $\ge$ 20, it displays: "20 questions will be selected for this simulation."
- If the count is < 20 (but > 0), it displays: "{count} questions will be used for this simulation."
- If the count is 0, it displays: "No published PYQ questions are currently available for this paper." and disables the Start Simulator button.
Static fallback data is no longer implicitly merged in this flow; it operates exclusively on the published database pool.

## Backend Query (`/api/fetchiq/simulator/pyq/availability` and `/pyq/generate`)
**Availability:** The endpoint now queries `prisma.pyqQuestion.groupBy` by `paper_code` exclusively (removing `year` grouping) and applies `isPublished: true`. It returns a flat array of `{ paper_code, count }`.
**Generation:** The generation endpoint `POST /pyq/generate` receives `{ paperCode }` without a year. It queries:
```javascript
const pyqs = await prisma.pyqQuestion.findMany({
    where: { 
        paper_code: paperCode,
        isPublished: true
    }
});
```

## Random Selection Logic
Upon fetching all published questions for the requested paper across all years, the backend applies an unbiased Fisher-Yates style shuffle (`pyqs.sort(() => 0.5 - Math.random())`) and selects a slice up to the configured limit (20). 
This guarantees:
1. No duplicate questions within one simulation (sampling without replacement).
2. Random balancing of years based on distribution.
3. It naturally bounds to the available pool (e.g., if only 8 exist, `slice(0, 20)` safely returns all 8).

## Optional P1 / P2 Handling
The configuration UI safely handles Optional subjects vs. GS/Essay subjects.
- For GS (GS-I to GS-IV) and Essay, the Paper 1 / Paper 2 toggles are completely hidden.
- For Optional subjects (e.g., Economics), the Paper 1 / Paper 2 toggles appear. When generating or querying availability, the canonical code is strictly resolved as `OPT-SUBJECT-P1` or `OPT-SUBJECT-P2`. P1 and P2 data never mix because their `paper_code` values are strictly separated in the database query.

## Test Results
1. **GS-I to GS-IV & Essay:** Selectable, year dropdown absent. Availability calculates strictly off `paper_code`.
2. **Economics Paper 1/2:** Toggles render properly and switch between `OPT-ECON-P1` and `OPT-ECON-P2`.
3. **Empty Data Handling:** If a paper has 0 published questions, the Simulator cleanly reports "No published PYQ questions are currently available for this paper." and blocks execution, preventing fake static data from masking the empty database state.
4. **AI Generated Mode:** Tested independently; AI mode retains its difficulty, question count, and Current Affairs dropdowns seamlessly.

## Build Result
`npm run build` executed successfully with 0 errors. All structural and routing modifications compile securely.
