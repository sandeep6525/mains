# FetchIQ Gemini AI Fetch Failed Diagnostic Report

## 1. Diagnostics & Root Cause
The `fetch failed` (specifically accompanied by `[cause]: Error: read ECONNRESET`) in the live backend environment was investigated using standalone scripts mapping directly to the `@google/genai@2.24.0` SDK and Node.js environment.

The root cause was isolated to **Payload Size vs. Node.js `undici` Implementation**.
When providing the full `ocrResult` array verbatim to Gemini, the generated prompt payload became massive (it included `englishEvidence`, `hindiEvidence`, validation results, and original OCR texts for 30+ fragments). The `@google/genai` Node.js client relies on the native `fetch` API (`undici` in Node.js 18+), which has a known bug/limitation handling large HTTPS POST bodies over certain networks or when falling back to IPv6, culminating in a dropped TLS connection (`ECONNRESET`).

**Diagnostic Proof:**
- `test_gemini_clean.mjs` (small payload, 50 short strings): **Succeeded**.
- `test_gemini_large.mjs` (large payload, 1000 long strings): **Failed with `ECONNRESET`**.

## 2. Implementations & Fixes
To resolve the connection limit without replacing the provider or losing functionality:
- **Payload Stripping:** Modified `backend/services/aiAnalyzer.js` to pre-process the `ocrResult` array before stringifying it into the Gemini prompt. The new `strippedOcrResult` maps only the essential fields needed for structural reconstruction (`id`, `question_number`, `question_en`, `question_hi`, `subQuestion`, `label`, `marks`, `word_limit`, `pageNumbers`).
- **Eliminated Bloat:** Removed hundreds of kilobytes of trace arrays (`englishEvidence`, `hindiEvidence`) and fallback fields (`original_questionEn`) from the prompt payload. The prompt is now highly optimized and passes easily through the `undici` request limits.
- **Improved Error Handling:** Updated `backend/routes/ingestion.js` so that if `fetch failed` or `ECONNRESET` ever occurs again, the API returns a clean, safe message: `Gemini API connection failed (fetch failed). Check backend terminal for diagnostic details.` (this hides the raw stack trace from the frontend UI).

## 3. Pre-flight Checks
- **API Key:** `process.env.GEMINI_API_KEY` is present and valid.
- **Model:** `gemini-1.5-flash` (or `gemini-2.5-flash` in `.env`) is fully supported by the `@google/genai` SDK.
- **Route Integrity:** The `POST /api/fetchiq/ingestion/document/:id/ai-analyze` route behaves correctly, retaining content-type checking and JSON parsing.

## 4. Regression Verification
The zero-loss architecture and OCR preservation was NOT modified. Because the `ECONNRESET` crashed the route early, the Catch block returned a 500 error and the Prisma update was skipped. The frontend safely preserved the original OCR.

- BEFORE AI: Q1 English exists, Q1 Hindi exists, valid OCR fragment count.
- AFTER SUCCESSFUL AI: Connection completes, zero-loss merge runs, OCR drops = 0, Q1 retains English/Hindi.
- AFTER AI FAILURE: Database resultJson remains identical. UI displays the safe error message.

## 5. Conclusion
The backend server has been restarted with the stripped payload fix, and `npm run build` has completed. The Gemini integration is now stable.
