# FETCHIQ DIRECT AI V2: JSON & LANGUAGE FORENSIC REPORT

## 1. Phase 1 & 2: Forensic JSON Failure & Safe Handling
The `Unterminated string in JSON at position 8889` crash was caused by Gemini exceeding the strict `maxOutputTokens: 2048` limit set in `directPdfAiAnalyzer.js`. Because `responseSchema` forces Gemini to output structured JSON, generating a large array of mapped fragment IDs pushed the response beyond 2048 tokens, truncating the JSON payload mid-string.

**Resolution:** 
- The `maxOutputTokens` has been increased to 8192 (Gemini 1.5 Flash limit).
- A robust parser has been implemented that aggressively trims and sanitizes Markdown fences (e.g., ` ```json ... ``` `) before `JSON.parse()`.
- Added diagnostic logging to trace length, truncation, and snippet dumps before the parse step for complete visibility.

## 2. Phase 3 & 4: Zero-Loss Validation & Enforcement
Direct AI V2 has now been upgraded with absolute deterministic validation prior to replacing the `latestJob.resultJson` source of truth.

The following checks are now stringently enforced in `backend/routes/directAiIngestion.js`:
- `questionNumber` must be a valid positive integer.
- The mapping response must be a valid array of `fragmentIds`.
- Every `fragmentId` must exist in the ORIGINAL OCR evidence (`unknownFragmentIds == 0`).
- No fragment can be assigned to multiple top-level parents (`duplicateAssignments == 0`).
- No fragment can be dropped/unassigned (`droppedFragmentCount == 0`).
- The final absolute reconstructed character count (English + Hindi) MUST exactly equal the total original character count (`lossPercentage == 0%`).

If any metric deviates from zero loss, the save will abort with an explicit `AI_ANALYSIS_REJECTED` code.

## 3. Phase 5: Language Separation (Q3 Contamination)
**Source of Contamination:** **A. OCR itself has Hindi inside English field (actually inside the Hindi field)**

Upon reading the raw output directly from `output/upsc_ingestion/1790931140790-950775708_normalized.json`, the precise OCR evidence for Q3 is:

```json
{
  "questionNumber": 3,
  "english": "",
  "hindi": "गाँधीवादी आंदोलनों का महत्च उनके द्वारा संगठित जनसमूहों में निहित था। स्प्टकीजिए। The significance of the Gandhian movements lay in the masses they mobilized. Elucidate."
}
```

The Python PaddleOCR script mistakenly placed the entire English text inside the Hindi field.

Because the previous iteration of V2 failed on validation, the Review UI silently fell back to the V1 AI mapping (`job_1_result.json`), where `aiAnalyzer.js` had attempted to arbitrarily split this string into `questionEn` and `questionHi`, hallucinating Hindi text into the English field.

With the new deterministic Direct AI V2 fix, Q3 will securely pull the original fragment. The final V2 reconstruction will leave `questionEn` as `null/empty` and deterministically reconstruct the entirety of the mixed text strictly into `questionHi`. The `SOURCE_TEXT_LOSS_DETECTED` metric will successfully pass, preserving the evidence EXACTLY as OCR found it for Admin review.

## 4. Phase 6 & 7: Top-Level Optional Paper Rule
Gemini is now fully constrained: it only returns `fragmentId -> parentQuestionNumber`. 
Sub-questions like `1(a)` and `1(b)` will not become their own database records. They are mathematically concatenated together during the backend reconstruction phase based strictly on Gemini's parent grouping mappings, preserving original character lengths.
