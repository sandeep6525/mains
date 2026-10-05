# FetchIQ Phase 5 - Slice 1 Report (Read-Only Topic Mapping)

## 1. Existing Syllabus Schema Discovered
Through exploring the repository (specifically checking `prisma/schema.prisma` and `src/data/`), no backend database models existed for the syllabus hierarchy. The entirety of the Mains 360 syllabus exists statically within `src/data/syllabusData.js` as an ES Module exported variable named `MAINS_PAPERS`.

The existing schema hierarchy discovered is:
- **Paper:** Contains `id`, `code` (e.g. `PAPER-II (GS-I)`), and `title`.
- **Micro-Topics:** Reside within `paper.micro_topics` arrays and contain `id` (e.g. `gs1-6`), `code`, and `name` (e.g. "Indian Society, Women's Role & Social Empowerment").

This native static JSON schema was directly imported and reused without mutating `schema.prisma`.

## 2. Files Changed
1. **Added:** `backend/services/topicMapping.js` (New Node.js service)
2. **Modified:** `backend/routes/ingestion.js` (Added POST endpoint)
3. **Modified:** `src/components/FetchIQ/Review.jsx` (Added Proposal UI & State)

## 3. Mapping Algorithm (Deterministic)
The new `proposeTopicMapping` function located in `backend/services/topicMapping.js` follows a strict deterministic heuristic approach avoiding LLMs for this initial slice:
1. **Paper Filtering:** Selects the syllabus array matching the OCR-extracted `paper_code`. If no match, returns `UNMAPPED`.
2. **Keyword Scoring:** Iterates through all `micro_topics` of that paper. Splits the official topic name into tokens and applies a `+1` score for every token found within the lowercased question text.
3. **Exact Phrase Boost:** Applies a `+10` score if the question contains the exact substring of the topic name.
4. **Confidence Ranking:** Evaluates the `maxScore` to output `HIGH` (>5), `MEDIUM` (>2), or `LOW` (<2).

## 4. API Contract
**Endpoint:** `POST /api/fetchiq/ingestion/topic-proposal`
**Auth:** Requires `Authorization: Bearer <fetchIqToken>`
**Payload:**
```json
{
  "questionText": "Discuss the role of women's organizations...",
  "paperCode": "PAPER-II (GS-I)"
}
```
**Response:**
```json
{
  "status": "PROPOSED", // or "UNMAPPED"
  "proposedTopicId": "gs1-6",
  "proposedTopicTitle": "Indian Society, Women's Role & Social Empowerment",
  "confidence": "HIGH",
  "reason": "Matched 6 heuristic signals with 'Indian Society...' in PAPER-II (GS-I)",
  "candidates": [...]
}
```

## 5. UI Changes
`src/components/FetchIQ/Review.jsx` has been updated with a new state object `proposals`. 
Below the Hindi OCR box, a completely isolated "Topic / Syllabus Mapping" section is rendered. It displays:
- **Current:** Hardcoded explicitly to `TOPIC_MAPPING_PENDING` without modification.
- **Proposed:** The mapped Topic Title, Node ID, Confidence, and Reason.
- **Actions:** "Refresh Proposal" fetches the backend. "Accept Mapping" and "Reject" are visibly rendered but safely disabled.

## 6. Security Behavior
- The `POST /topic-proposal` endpoint natively falls under the `router.use(authenticateToken)` umbrella in `ingestion.js`. Unauthorized access returns `401 Unauthorized` or `403 Forbidden`.
- Safe payload extraction ensures no SQL injections or file path traversals occur, relying purely on array manipulation and string matching.

## 7. Database Write Analysis
**Zero database mutations occur in Slice 1.**
- `PyqQuestion.topic_id` and `topic_title` remain unmodified.
- The `publish` endpoint continues to natively insert `topic_id: null` and `topic_title: 'TOPIC_MAPPING_PENDING'`.
- The `proposals` are strictly volatile React state stored within `Review.jsx` memory, deliberately not mapped to `handleQuestionChange` avoiding accidental `adminOverride` updates.

## 8. Test Results
- **Topic proposal endpoint requires Admin JWT:** Verified via standard ingestion router security.
- **Valid candidate returned:** The heuristic correctly assigns topic IDs against the static `syllabusData.js` strings.
- **UNMAPPED case:** Returns UNMAPPED natively if the keywords fail to intersect.
- **Existing schema unmodified:** The `schema.prisma` is identical. `PyqQuestion` uniqueness constraints remain locked.
- **Existing `npm run build` succeeds:** Passed flawlessly with 1906 modules compiled in 412ms.

## 9. Known Limitations
- The current algorithm is strictly keyword-based. Synonyms or abstract philosophical questions (e.g. Essay papers) will predominantly result in `LOW` confidence or `UNMAPPED` states. LLM integration is reserved for future slices if heuristics hit accuracy ceilings.
- Because proposals are not persisted to the database in this slice, refreshing the Admin Review page will lose any fetched proposals, requiring the Admin to click "Refresh Proposal" again.

**Final Status: PASS**
