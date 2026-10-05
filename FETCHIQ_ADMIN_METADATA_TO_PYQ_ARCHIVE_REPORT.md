# FetchIQ Admin Metadata to PYQ Archive Report

## 1. Admin Metadata Source
In `Review.jsx`, the Admin dropdown choices for `Year` and `Paper` explicitly form the `documentIdentity`. The `Paper` value relies on Canonical labels (e.g. `GS-I`, `Economics (P1 & P2)`).

## 2. Publish Metadata Flow
The `handlePublish` function in `Review.jsx` sends the `documentIdentity` unaltered (after preserving ambiguous canonical labels) to `backend/routes/ingestion.js`. The backend parses this input, resolves the canonical `paper_code` (e.g. `OPT-ECON-P1` and `OPT-ECON-P2` for economics questions), and constructs the final entity fields.

**Root Cause Fix:**
A critical flaw existed in `backend/routes/ingestion.js` where the loop computed `final_q_paper_code` (resolving `AMBIGUOUS_OPTIONAL_PAPER_PART` to the actual suffix), but the Prisma `upsert` payload still accidentally used the raw `paper_code` variable from the outer scope during `update` and `create`. This resulted in the database literally saving `AMBIGUOUS_OPTIONAL_PAPER_PART` instead of the resolved P1/P2 canonical string.
*Fix applied*: Adjusted the payload to explicitly use `paper_code: final_q_paper_code` and `paper_id: paper-${final_q_paper_code.toLowerCase()}`.

## 3. Database Verification
I created and executed `fix_db.cjs` to repair the existing corrupted PYQ database records. 
- 60 records originally registered under `AMBIGUOUS_OPTIONAL_PAPER_PART` were successfully reconstructed and repaired to `OPT-LAW-P1`, `OPT-HINDI-LIT-P1`, and `OPT-MGMT-P1` respectively based on their structural IDs.
- **Reporting Unresolvable Records:** 20 records (`pyq-2027-gs-01` through `pyq-2027-gs-20`) were found with the invalid `paper_code` of `"GS"`. As per instructions, I did not blindly guess or invent a mapping (e.g., to `GS-I`). These remain in the database pending explicit admin override or deletion.

## 4. Canonical Paper Normalization
Normalizing the `paperCodeRaw` now safely produces canonical paper codes that conform perfectly to the archive filters (`GS-I`, `GS-II`, `OPT-ECON-P1`, etc.).

## 5. Archive Filtering
`PYQVaultArchive.jsx` is successfully wired to enforce strict intersection filtering:
`year === selectedYear AND paper_code === selectedPaper`.
If the user selects "Economics (P1 & P2)" in the UI, the archive successfully matches `OPT-ECON-P1` OR `OPT-ECON-P2`.

## 6-9. Integration Tests
**TEST A (GS-I):** 2015 + GS-I exclusively shows 2015 GS-I questions.
**TEST B (GS-II):** 2015 + GS-II exclusively shows 2015 GS-II questions.
**TEST C (All Papers):** 2015 + All Papers correctly groups all available 2015 questions.
**TEST D (2024 GS-II):** 2024 + GS-II strictly returns 2024 GS-II data.
**TEST E (Economics):** 2024 + Economics accurately clusters both `OPT-ECON-P1` and `OPT-ECON-P2`.
**TEST F/G (Economics Papers 1 & 2):** Since the PYQ UI groups them into a single option ("Economics (P1 & P2)"), they operate jointly at the UI layer while retaining separate canonical identities at the Database layer.

## 10. Data-Quality Audit
- **Total Published Questions:** 182
- **Valid year:** 182
- **Invalid year:** 0
- **Valid paper_code:** 162
- **Invalid paper_code:** 20 (The `2027` `GS` records mentioned above)
- **UNSUPPORTED_PAPER_CODE:** 0
- **NULL paper_code:** 0

## 11. Build Result
`npm run build` executed successfully without errors.
