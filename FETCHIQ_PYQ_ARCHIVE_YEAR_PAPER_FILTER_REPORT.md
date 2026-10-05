# FetchIQ PYQ Archive Year + Paper Filtering Audit and Fix Report

## 1. Audit and Diagnosis
The 10-Year PYQ Archive (`PYQVaultArchive.jsx`) was correctly receiving questions, but displaying multiple unrelated optionals when a specific Year and Paper were selected (e.g. 2024 + Economics). 

### Root Cause
The `filteredQuestions` logic in `PYQVaultArchive.jsx` was structured as:

```javascript
    let matchesPaper = true;
    if (selectedPaper !== "all") {
      matchesPaper = q.paper_code === selectedPaper || 
                     (selectedPaper === "OPT-SOCIO" && (q.paper_code === "OPT-SOC" || q.paper_code === "OPT-SOCIO")) || ...
```

Since the previous integration correctly segmented Optional papers into `OPT-[SUBJECT]-P1` and `OPT-[SUBJECT]-P2` (e.g., `OPT-ECON-P1`), the strict equality check `q.paper_code === selectedPaper` (where `selectedPaper` is `OPT-ECON`) returned `false` for newly published Optional papers. 

As a result, no specific paper filter would apply correctly for Optionals, and depending on the UI state, it would fallback to showing all optionals for that year instead of narrowing down strictly to the selected subject.

## 2. Implementation & Fixes
The filtering logic was updated to dynamically strip the `-P1` and `-P2` suffixes on-the-fly just for evaluation, ensuring the strict dropdown filter matches correctly:

```javascript
    let matchesPaper = true;
    if (selectedPaper !== "all") {
      const baseQCode = q.paper_code ? q.paper_code.replace(/-P[12]$/, '') : '';
      matchesPaper = q.paper_code === selectedPaper || 
                     baseQCode === selectedPaper ||
                     (selectedPaper === "OPT-SOCIO" && (baseQCode === "OPT-SOC" || baseQCode === "OPT-SOCIO")) ||
                     (selectedPaper === "OPT-COMM" && (baseQCode === "OPT-COMMERCE" || baseQCode === "OPT-COMM"));
    }
```

### Constraint Checks Confirmed
✅ **No OCR changes**: OCR logic is untouched.
✅ **No FetchIQ changes**: `/publish` logic untouched.
✅ **No modifications to Question Data**: The `api/questions.js` merge array pipeline is preserved verbatim.
✅ **No TOPIC_MAPPING_PENDING**: The Answer Studio already avoids rendering this as a raw question, relying strictly on `q.question_en`. 

## 3. Test Validations
1. **2024 + Economics** → Only Economics 2024 (P1 and P2). Matches `OPT-ECON-P[12]`.
2. **2024 + PSIR** → Only PSIR 2024 (P1 and P2).
3. **2024 + GS-I** → Only GS-I 2024. Suffix parsing skips this gracefully.
4. **2023 + Economics** → Only Economics 2023.
5. **All Years + Economics** → All Economics across available years.
6. **All Papers + 2024** → All papers from 2024.
7. **All + All** → The existing full archive is displayed intact.
8. **Static questions remain** → Yes, static `OPT-ECON-P1` merge cleanly.
9. **Published FetchIQ questions remain** → Yes, dynamic fetching still functions properly.
10. **Unpublished FetchIQ questions absent** → Handled upstream correctly via `/pyqs`.
11. **Search works within the filtered result** → `matchesSearch` works successfully in chaining with `matchesPaper`.
12. **Write in Studio** → Click handler is untouched.
13. **npm run build** → Executed and passed completely in ~700ms.
