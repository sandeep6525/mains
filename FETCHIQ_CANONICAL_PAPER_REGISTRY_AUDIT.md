# FetchIQ Canonical Paper Registry & Paper-Code Audit

## 1. Executive Summary
This audit reviews the paper-code registry across the entire YuktiPrep Mains 360 FetchIQ pipeline. We identified severe fragmentation in how paper identities are represented, normalized, and mapped. A single paper (e.g., General Studies 1) is currently represented as `GS1` by OCR, `GS-I` in the database, and `PAPER-II (GS-I)` in the static metadata. The publish logic relies on brittle string-matching (e.g., `.includes()`) to bridge these gaps. We propose a unified, canonical paper-code contract that resolves these ambiguities without altering OCR scripts, database schemas, or Prisma structures.

## 2. Current Paper Types
The system currently ingests and supports:
- General Studies (GS I - IV)
- Essay
- 15 Optional Subjects (Paper 1 & 2)
- Qualifying Languages (Hindi & English)

## 3. Complete Paper-Code Inventory
| Category | Display Name | Current Code in DB/UI | Canonical Candidate | Paper Part | Example Year | Source File | Used By | Potential Conflict |
|---|---|---|---|---|---|---|---|---|
| GENERAL STUDIES | General Studies I | `GS-I` / `GS1` / `PAPER-II (GS-I)` | `GS-I` | N/A | 2026 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `GS1` vs `GS-I` |
| GENERAL STUDIES | General Studies II | `GS-II` / `GS2` / `PAPER-III (GS-II)` | `GS-II` | N/A | 2026 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `GS2` vs `GS-II` |
| GENERAL STUDIES | General Studies III | `GS-III` / `GS3` / `PAPER-IV (GS-III)` | `GS-III` | N/A | 2026 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `GS3` vs `GS-III` |
| GENERAL STUDIES | General Studies IV | `GS-IV` / `GS4` / `PAPER-V (GS-IV)` | `GS-IV` | N/A | 2026 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `GS4` vs `GS-IV` |
| ESSAY | Essay | `ESSAY` / `PAPER-I` | `ESSAY` | N/A | 2026 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `ESSAY` vs `PAPER-I` |
| QUALIFYING | Qualifying Hindi | `PAPER-A` | `PAPER-A` | N/A | 2026 | `syllabusData.js` | Metadata | None |
| QUALIFYING | Qualifying English | `PAPER-B` | `PAPER-B` | N/A | 2026 | `syllabusData.js` | Metadata | None |
| OPTIONALS | Economics | `OPT-ECON` / `OPT-ECON-P1` | `OPT-ECON` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `OPT-ECON` vs `OPT-ECON-P1` |
| OPTIONALS | PSIR | `OPT-PSIR` / `OPT-PSIR-P1` | `OPT-PSIR` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `OPT-PSIR` vs `OPT-PSIR-P1` |
| OPTIONALS | Sociology | `OPT-SOCIO` / `OPT-SOCIO-P1` | `OPT-SOCIO` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `OPT-SOC` vs `OPT-SOCIO` |
| OPTIONALS | Philosophy | `OPT-PHIL` / `OPT-PHIL-P1` | `OPT-PHIL` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Law | `OPT-LAW` / `OPT-LAW-P1` | `OPT-LAW` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Pub Administration | `OPT-PUBAD` / `OPT-PUBAD-P1` | `OPT-PUBAD` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Geography | `OPT-GEO` / `OPT-GEO-P1` | `OPT-GEO` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | History | `OPT-HIST` / `OPT-HIST-P1` | `OPT-HIST` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Anthropology | `OPT-ANTHRO` / `OPT-ANTHRO-P1` | `OPT-ANTHRO` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Commerce | `OPT-COMM` / `OPT-COMM-P1` | `OPT-COMM` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | `OPT-COMMERCE` vs `OPT-COMM` |
| OPTIONALS | Psychology | `OPT-PSYCH` / `OPT-PSYCH-P1` | `OPT-PSYCH` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Agriculture | `OPT-AGRI` / `OPT-AGRI-P1` | `OPT-AGRI` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Mathematics | `OPT-MATH` / `OPT-MATH-P1` | `OPT-MATH` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Management | `OPT-MGMT` / `OPT-MGMT-P1` | `OPT-MGMT` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |
| OPTIONALS | Hindi Literature | `OPT-HINDI-LIT` / `OPT-HINDI-LIT-P1` | `OPT-HINDI-LIT` | 1 / 2 | 2024 | `syllabusData.js` | `PYQVault`, `AnswerStudio` | None |

## 4. File-by-File Definitions
- `src/data/syllabusData.js`: Central metadata registry (`MAINS_PAPERS`).
- `backend/routes/ingestion.js`: Ad-hoc `normalizePaperCode` and `MAINS_PAPERS` string-matching for `/publish`.
- `src/services/api/questions.js`: Ad-hoc `normalizePaperCode` mapping for GS codes, merging DB + Static PYQs.
- `src/components/PYQVaultArchive.jsx`: Contains frontend fallback logic mapping `ESSAY` and `OPT-*` to static labels.
- `src/components/AnswerWritingStudio.jsx`: Contains frontend fallback logic mapping `ESSAY` and `OPT-*` to static labels.

## 5. Paper-Code Conflicts
- **GS1 vs GS-I**: OCR produces `GS1`, DB expects `GS-I`. Normalized ad-hoc.
- **ESSAY vs PAPER-I**: OCR/Frontend produce `ESSAY`, `MAINS_PAPERS` defines `PAPER-I`. No active normalization exists, relying on loose `includes()` matching which fails.
- **OPT-ECON-P1 vs OPT-ECON**: DB stores `OPT-ECON-P1`, but `MAINS_PAPERS` defines `OPT-ECON`. `ingestion.js` regex slices the suffix to prevent "Unsupported paper code" errors.
- **OPT-SOC vs OPT-SOCIO**: Both exist in UI code as fallbacks.
- **PAPER-II (GS-I) vs GS-I**: Database saves `GS-I`. `MAINS_PAPERS` defines `PAPER-II (GS-I)`. 

## 6. Database Identity Audit
The `PyqQuestion` model enforces a `@@unique([year, paper_code, question_number])` constraint.
This correctly supports suffix identities (e.g. `OPT-ECON-P1` vs `OPT-ECON-P2`) because the DB constraint treats them as distinct papers. No schema migration is required to enforce this.

## 7. FetchIQ Publish Audit
1. **Entry**: Code enters via `documentIdentity.paper.value`.
2. **Normalization**: Ad-hoc `normalizePaperCode` forces `GS1` -> `GS-I`.
3. **Validation**: It matches `MAINS_PAPERS` using `p.code.includes(lookupCode)`.
4. **P1/P2 Handling**: A regex `/^(OPT-[A-Z-]+)-P[12]$/` isolates the base code (`OPT-ECON`) for `MAINS_PAPERS` validation.
5. **Canonical Write**: Publish accurately persists the suffixed version (`OPT-ECON-P1`) to the DB. Re-publishing UPSERTs the record gracefully without duplicates.

## 8. Mains 360 Integration Audit
The `getQuestions()` function locally normalizes `GS1 -> GS-I`, merges `backendData` with `PYQ_QUESTIONS`, and returns the payload. The data securely propagates through the API.

## 9. Static/Dynamic Deduplication Audit
`src/services/api/questions.js` effectively blocks duplication. It maps `year`, `paper_code` (normalized), and `question_number`. If a backend `isPublished` question overlaps with a static question, the backend heavily overwrites it but retains empty static fields.

## 10. Optional P1/P2 Audit
Fully supported by the Database and Frontend. `PYQVaultArchive.jsx` recently implemented regex suffix stripping to correctly aggregate P1 and P2 under the single Optional filter.

## 11. Year + Paper Filtering Audit
Filtering logic strictly requires exact `paper_code` equality or regex matched equivalence (`baseQCode`). This properly filters year + paper intersect selections.

## 12. Answer Studio Audit
`AnswerWritingStudio.jsx` accurately resolves the suffix encoding, rendering `OPT-ECON-P1` gracefully as `[OPT-ECON] 2024 - Paper 1 - Q1`. It utilizes `q.question_en` preventing `TOPIC_MAPPING_PENDING` pollution.

## 13. Root Causes
The fragmentation occurred because OCR output, Static Data Definitions (`MAINS_PAPERS`), and Frontend UI constructs evolved independently without a centralized string contract or mapping utility.

## 14. Recommended Canonical Paper Registry
The architecture safely supports this unified canonical identity model without migration:
- **GS**: `GS-I`, `GS-II`, `GS-III`, `GS-IV`
- **Essay**: `ESSAY`
- **Optionals**: `OPT-[SUBJECT]-P1`, `OPT-[SUBJECT]-P2`

## 15. Recommended normalizePaperCode() contract
```javascript
function normalizePaperCode(input) {
    if (!input) return null;
    let c = input.toUpperCase().replace(/\s+/g, '');
    
    if (c === 'GS1' || c === 'GSI' || c.includes('PAPER-II(GS-I)')) return 'GS-I';
    if (c === 'GS2' || c === 'GSII' || c.includes('PAPER-III(GS-II)')) return 'GS-II';
    if (c === 'GS3' || c === 'GSIII' || c.includes('PAPER-IV(GS-III)')) return 'GS-III';
    if (c === 'GS4' || c === 'GSIV' || c.includes('PAPER-V(GS-IV)')) return 'GS-IV';
    if (c === 'PAPER-I' || c === 'ESSAY') return 'ESSAY';
    
    // Normalize Optional Typos
    if (c.startsWith('OPT-SOC-')) c = c.replace('OPT-SOC-', 'OPT-SOCIO-');
    if (c.startsWith('OPT-COMMERCE-')) c = c.replace('OPT-COMMERCE-', 'OPT-COMM-');

    // Reject unknown formats
    if (c.startsWith('GS-') || c === 'ESSAY' || /^OPT-[A-Z]+-P[12]$/.test(c)) return c;
    return 'UNSUPPORTED_PAPER_CODE';
}
```

## 16. Minimal implementation plan
1. Create `src/utils/paperRegistry.js` containing `normalizePaperCode` and `getBasePaperCode` (to strip `-P[12]`).
2. Replace all ad-hoc local normalizers in `backend/routes/ingestion.js`, `api/questions.js` with imports.
3. Replace `.includes` logic in publish with rigorous checks against `getBasePaperCode`.

## 17. Files that WOULD need modification
- `src/services/api/questions.js`
- `backend/routes/ingestion.js`
- `backend/services/topicMapping.js`
- `src/components/PYQVaultArchive.jsx` (Cleanup only)

## 18. Files that MUST NOT be modified
- `prisma/schema.prisma`
- OCR Python Scripts (`ingest_upsc_paper.py`, `extract_page_by_page.py`, etc)
- `src/data/syllabusData.js` (`MAINS_PAPERS` array keys)

## 19. Regression risks
- **Static Matching**: Breaking existing static questions by mutating their internal `paper_code` unexpectedly.
- **Publish Rejections**: Failing to accept valid legacy strings (`PAPER-II (GS-I)`) preventing publication.

## 20. Test matrix
- Feed `GS1`, `GS-I`, `PAPER-II (GS-I)` → Output `GS-I`.
- Feed `ESSAY`, `PAPER-I` → Output `ESSAY`.
- Feed `OPT-ECON-P1` → Output `OPT-ECON-P1`.
- Verify POST `/publish` successfully processes GS and Optionals.
- Verify `AnswerWritingStudio` deduplicates static + dynamic entries perfectly.
