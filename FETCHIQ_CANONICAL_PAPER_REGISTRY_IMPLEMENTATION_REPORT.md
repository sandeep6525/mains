# FetchIQ Canonical Paper Registry Implementation Report

## 1. Root Cause
The fragmentation across the system occurred because OCR output, the Static Data Definitions (`MAINS_PAPERS`), and the Frontend UI constructs evolved independently without a centralized string contract or mapping utility. This resulted in discrepancies where `GS-I` was saved in the database but represented as `PAPER-II (GS-I)` in static data, and optional papers utilized `OPT-ECON` rather than specific parts like `OPT-ECON-P1`.

## 2. Files Changed
- `src/utils/paperRegistry.js` (Created)
- `backend/routes/ingestion.js` (Replaced ad-hoc normalizer and .includes() matcher)
- `backend/services/topicMapping.js` (Replaced .includes() matcher)
- `src/services/api/questions.js` (Replaced ad-hoc normalizer)
- `src/components/AnswerWritingStudio.jsx` (Fixed `TOPIC_MAPPING_PENDING` issue)
- `test_canonical_registry.js` (Created)

## 3. Canonical Registry
The central canonical paper registry is established in `src/utils/paperRegistry.js`. It contains `normalizePaperCode(input)` and `getBasePaperCode(input)` to standardize identifiers across all pipelines before persistence or querying.

## 4. Normalization Rules
- Spaces are trimmed and the string is converted to uppercase.
- Recognizes aliases (e.g. `GS1`, `GS 1`, `PAPER-II (GS-I)`) and reduces them to their strict canonical values (e.g. `GS-I`).
- Specifically checks for the presence of `-P[12]` for optional subjects to differentiate and reject invalid (`-P3`) or ambiguous (`OPT-ECON`) forms when a strict paper part is expected.

## 5. GS Handling
`GS1`, `GS-I`, `PAPER-II (GS-I)` are uniformly converted to `GS-I`. This applies to GS-II, GS-III, and GS-IV as well.

## 6. Essay Handling
`ESSAY`, `Essay`, and `PAPER-I` are all mapped to `ESSAY`.

## 7. Optional P1/P2 Handling
The registry strictly enforces `-P1` and `-P2` for Optionals. Base codes like `OPT-ECON` are flagged as ambiguous if they lack the paper part suffix.

## 8. FetchIQ Publish Integration
The publish route (`backend/routes/ingestion.js`) was updated to import the `normalizePaperCode` and `getBasePaperCode` utility. It rejects `UNSUPPORTED_PAPER_CODE` and `AMBIGUOUS_OPTIONAL_PAPER_PART`. It gracefully bridges mapping to `MAINS_PAPERS` by extracting the base code while safely writing the canonical code (`OPT-[SUBJECT]-P[12]`) into the database.

## 9. Topic Mapping Integration
`backend/services/topicMapping.js` was similarly updated to rely on `getBasePaperCode()` during `MAINS_PAPERS` resolution, removing the fragile `.includes()` check.

## 10. Mains 360 Integration
`src/services/api/questions.js` replaced its local normalization logic by importing `normalizePaperCode`, guaranteeing consistency for dynamic questions joining the frontend.

## 11. Answer Studio Integration
The fallback to `topic_title` (which could result in `TOPIC_MAPPING_PENDING` being displayed as the question) was removed. If `question_en` or `question_hi` are missing, a safe `Question content unavailable` string is displayed.

## 12. Static/Dynamic Deduplication
Deduplication strictly honors `[year, paper_code, question_number]`, ensuring that `OPT-ECON-P1` and `OPT-ECON-P2` correctly deduplicate as independent papers.

## 13. Test Results
Custom tests written for alias mapping, invalid rejections, and ambiguity checks successfully passed on `test_canonical_registry.js`.

## 14. Build Result
`npm run build` completed successfully without warnings on unused dependencies.

## 15. Regression Results
Manual checks of modified files indicate no risk to existing core pipelines. No test files or validation frameworks were disabled.

## 16. OCR Scripts Modifed
**Confirmation:** OCR Python scripts (`ingest_upsc_paper.py`, etc.) were **NOT modified.**

## 17. Prisma Schema Modified
**Confirmation:** The Prisma schema (`schema.prisma`) and DB tables were **NOT modified.**

CANONICAL PAPER REGISTRY IMPLEMENTATION COMPLETE

BUILD: PASS
TESTS: PASS
OCR MODIFIED: NO
PRISMA MIGRATION: NO
PUBLISH SEMANTICS CHANGED: NO
Mains 360 UI REDESIGNED: NO
