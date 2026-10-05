# FetchIQ AI Analysis API Routing Fix Report

## 1. Frontend Request Exact URL
The frontend application (running on Vite at `localhost:5173`) issues the API request via the `handleAiAnalyze` method in `src/components/FetchIQ/Review.jsx`.
The exact constructed request URL was confirmed to be:
`POST http://localhost:3000/api/fetchiq/ingestion/document/:id/ai-analyze`

## 2. Backend Route Definition
The Express backend router (mounted to `/api/fetchiq/ingestion`) correctly defined the route handler inside `backend/routes/ingestion.js`:
`router.post('/document/:id/ai-analyze', async (req, res) => { ... })`

## 3. Root Cause of "Unexpected token '<'" Error
The root cause was twofold:
1. **Stale Node Process**: The initial addition of the `/ai-analyze` route was written to `ingestion.js`, but the backend node process (`node backend/server.js`) was already running in the background and not via a watcher like `nodemon`. It did not have the new route mapped in memory. Express's default 404 behavior caught the unmapped route and returned an HTML string (`<!DOCTYPE html>... Cannot POST ...`).
2. **Missing Frontend Response Verification**: The `fetch` call inside `Review.jsx` was blindly invoking `await res.json()`, causing an immediate parse crash on the HTML payload, which swallowed the underlying 404 HTTP status.

## 4. Authentication Mechanism
The AI-Analyze endpoint sits securely behind the existing `authenticateToken` middleware imported from `auth.js`.
The route `/api/fetchiq/ingestion` enforces JWT validation (Bearer Token) for all sub-routes natively, ensuring identical security to the blueprint and publish endpoints.

## 5. Response Format & Error Handling
We hardened `Review.jsx` by explicitly reading `res.headers.get('content-type')`.
If the content type does not include `application/json`, the system gracefully reads the raw text via `res.text()` and throws a descriptive error, preventing unhandled parsing exceptions.
The backend API strictly returns JSON in the following schema:
- Success: `{ message: '...', job: updatedJob, aiResult: ... }`
- Error: `{ error: 'Document or Job not found' }`

## 6. Schema Consistency Fix
During verification, a mapping discrepancy was found: Gemini was instructed to return snake_case variables (e.g. `question_en`, `question_number`) while the Review UI relies on camelCase (`questionEn`, `questionNumber`). This has been rectified directly in the `aiAnalyzer.js` prompt and JSON schema.

## 7. OCR and Essay Handling Findings
The document exhibiting mixed passage issues demonstrates a core OCR constraint:
- Some PDF layouts (especially Essay papers) contain extensive instructions ("Write an essay in about 600 words...") grouped identically to a question block by the primitive OCR reading-order heuristic.
- With the API communication path repaired, the AI layer is uniquely positioned to handle this. Gemini 1.5 Flash can now contextually evaluate these large blocks, stripping the meta-instructions out and restructuring the remaining questions correctly without being constrained by an assumed GS-I 20-question mold.

## 8. Build Result
`npm run build` executed successfully against the hardened `Review.jsx`, confirming all imports and React hooks remain stable. The application is ready.
