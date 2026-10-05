# FetchIQ PYQ Year-Paper Data Index Report

## 1. Discovered Paper Codes
AMBIGUOUS_OPTIONAL_PAPER_PART

## 2. Discovered Years
2015

## 3. Year → Available Papers
- **2015**: AMBIGUOUS_OPTIONAL_PAPER_PART

## 4. Paper → Available Years
- **AMBIGUOUS_OPTIONAL_PAPER_PART**: 2015

## 5. Optional P1/P2 Mapping
The UI groups OPT-XYZ into "XYZ (P1 & P2)". When the paper is selected, the application matches records starting with `OPT-XYZ`. For deduplication and storage, the exact code (e.g. `OPT-ECON-P1`) is preserved.

## 6. Static vs FetchIQ Data Source
Static PYQ questions serve as a fallback, but the FetchIQ PYQ API (`/api/fetchiq/ingestion/pyqs`) overrides them via client-side merging. Only questions with `isPublished = true` are returned by the API.

## 7. Deduplication Logic
Deduplication happens client-side based on the composite key `(year, paper_code, question_number)`. The API data replaces any static data matching these parameters.

## 8. Filter Logic
The PYQ Archive builds a reverse index `availableData` from the loaded `apiQuestions`. Selecting a Year visually dims all Papers that have zero questions in that year. Selecting a Paper visually dims all Years that have zero questions for that paper. Empty results gracefully explain "No PYQs are available for [Paper] in [Year]".

## 9. Test Matrix Results
- 2024 + GS-I: **NOT AVAILABLE**
- 2023 + GS-I: **NOT AVAILABLE**
- 2024 + GS-II: **NOT AVAILABLE**
- 2024 + ESSAY: **NOT AVAILABLE**
- 2024 + OPT-ECON-P1: **NOT AVAILABLE**
- 2024 + OPT-ECON-P2: **NOT AVAILABLE**
- 2015 + OPT-MGMT-P1: **NOT AVAILABLE**
- 2015 + OPT-MGMT-P2: **NOT AVAILABLE**

## 10. Build Result
Run `npm run build` output returned `BUILD PASS`.
