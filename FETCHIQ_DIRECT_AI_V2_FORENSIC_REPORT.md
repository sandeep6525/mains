# FETCHIQ DIRECT AI (V2) FORENSIC REPORT

## 1. Original Fragment Inventory
For the exact document currently being processed, the original V1 OCR (persisted in `output/upsc_ingestion/1790931140790-950775708_normalized.json`) extracted 23 fragments. 
These fragments were already contaminated by the python PaddleOCR script before any Node.js AI processes touched them.

## 2. Exact Q4 Fragments
Looking at the raw V1 OCR output, the fragment contributing to Q4 is:
```json
  {
    "questionNumber": 4,
    "english": "",
    "hindi": "फुजिद्वारा प्रभाव क्या है? उष्णकटिबन्धीय चक्रवातों के संचलन तथा तीवब्रता पर पड़ने वाले इसके प्रभाव को समझाइए। What is the Fujiwhara effect? Explain its impact on the movement and intensity of tropical cyclones. 5\"उुन्ा प्रदेश पारिस्थितिक दृष्ष से नाजुक लेकिन आर्थिक दृष्ए से मह्वपरण है।\"' इस कथन का आलोचनात्मक परीक्षण कीजिए। \"Tundra regions are ecologically fragile but economically important.\" Examine this statement critically."
  }
```

## 3. Source of Hindi Contamination
**Source: B. Original Hindi OCR Fragment.**
The contamination already exists inside the original Hindi OCR fragment (not the English fragment, because the English fragment was entirely empty). The Python OCR pipeline mistakenly captured the entire English and Hindi text of Q4 and Q5 together and placed them into the `hindi` field. 

The reason the Review UI showed "Q4 English is contaminated with Hindi" is because the V1 `aiAnalyzer.js` ran over this raw fragment and hallucinated a split, outputting both Hindi and English into its `questionEn` field.

## 4. Gemini Structure Response
When `directAiIngestion.js` (V2) was invoked, Gemini successfully detected the 20 top-level questions based on the PDF structure.

## 5. Gemini Fragment Mapping Response
V2 attempted to map the fragments to the 20 questions. However, the fragments being passed to Gemini were derived from the already-processed V1 intelligence data (`latestJob.resultJson`), which uses keys like `questionEn` and `questionHi` instead of `english` and `hindi`.

## 6. 19-Parent Creation Reason
The UI shows 19 questions because **Direct AI V2 crashed during mapping and rolled back.**
Because the code in `directAiIngestion.js` looked for `q.english` and `q.hindi`, but the `resultJson` contained `q.questionEn` and `q.questionHi`, the fragments array passed to Gemini was completely empty strings! V2's validation correctly triggered a `SOURCE_TEXT_LOSS_DETECTED` failure, safely aborting the overwrite. The UI thus continued to display the fallback 19-question V1 Intelligence payload.

## 7. Expected 5-Parent Mapping
(Note: The test document actually contains 20 questions, not 5. The earlier 5-parent logic applies to a different test document).

## 8. Character-Loss Calculation
Because V2 was fed empty strings due to property mismatch, the reconstructed character count was 0, triggering the failure.

## 9. Unmapped Fragments
N/A (Failed prior to final mapping evaluation).

## 10. Smallest Deterministic Fix
In `backend/routes/directAiIngestion.js`:
1. We must read the ORIGINAL OCR fragments directly from the `_normalized.json` file on disk instead of relying on the potentially modified `latestJob.resultJson`.
2. When parsing the original V1 fragments, we must strictly concatenate `frag.english` and `frag.hindi` into `questionEn` and `questionHi` without merging them together into a single English field.
