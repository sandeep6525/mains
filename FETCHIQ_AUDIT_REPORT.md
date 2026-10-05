# FetchIQ Phase 1 Audit Report

## 1. Existing FetchIQ-related code
- **Status**: Minimal.
- **Details**: There is no React UI or backend logic for FetchIQ. We only have the Python extraction orchestrator (`ingest_upsc_paper.py`) created in the previous phase, which successfully outputs normalized JSON into `output/upsc_ingestion/`.

## 2. Existing OCR code
- **Status**: Present and functional.
- **Details**: The Python scripts in `extration/` (PaddleOCR, RapidOCR, etc.) are intact. We recently fixed the PaddleOCR CPU oneDNN runtime issue by safely injecting `enable_mkldnn=False`. The pipeline successfully parsed `2026_GS1.pdf`.

## 3. Existing backend APIs
- **Status**: **DOES NOT EXIST.**
- **Details**: The project is currently a pure Vite/React SPA. The `src/services/api/` folder contains only Axios/Fetch frontend wrappers that return mock data because the actual `VITE_API_BASE_URL` server does not exist. There is no Node.js/Express server in this repository yet.

## 4. Existing authentication
- **Status**: **DOES NOT EXIST.**
- **Details**: I searched the entire codebase for `login`, `auth`, `jwt`, and found zero authentication logic. We must build the admin authentication system from scratch.

## 5. Existing Prisma models
- **Status**: **DOES NOT EXIST.**
- **Details**: I ran a global search for `*.prisma` and checked `package.json`. Prisma is not installed, and there is no database schema. You mentioned *"Before changing Prisma schema: AUDIT EXISTING SCHEMA"* — I must report that there is no existing schema to audit. We will need to design and scaffold the initial database schema (e.g., `Exam`, `PYQ`, `Question`, `User`).

## 6. Existing PYQ model/API
- **Status**: Mock Data Only.
- **Details**: Currently relying completely on static JS files (`src/data/pyqData.js`, `tenYearsPyqData.js`). The frontend API adapters (`src/services/api/questions.js`) fall back to this mock data.

## 7. Existing Mains 360 PYQ Archive
- **Status**: Present as a React UI component.
- **Details**: The user-facing archive UI exists but operates entirely on the static mock data.

## 8. Files that must change
- `src/App.jsx` (to register the new `/fetchiq/*` administrative routes).
- `src/services/api/client.js` (to connect to the new backend once we build it).
- `package.json` (to install backend/auth dependencies or concurrently run a Node backend).

## 9. Files that should NOT change
- Existing Mains 360 React components (`AnswerWritingStudio`, `FullPaperSimulator`, etc.).
- Static mock data files (they should remain as fallbacks so the UI doesn't break while we migrate to the real DB).
- `extration/*` (the OCR logic is stable).

## 10. New files required
- **Frontend**:
  - `src/components/FetchIQ/FetchIQLogin.jsx`
  - `src/components/FetchIQ/FetchIQDashboard.jsx`
  - `src/components/FetchIQ/FetchIQIngestion.jsx`
  - `src/components/FetchIQ/FetchIQReview.jsx`
- **Backend (Needs to be Scaffolded)**:
  - `backend/server.js` (Express API)
  - `backend/prisma/schema.prisma` (Database schema)
  - `backend/routes/fetchIqRoutes.js` (Upload, Process, Approve APIs)
  - `backend/routes/authRoutes.js` (Admin Login)

## 11. Risks
- **Missing Backend**: You requested that I reuse existing Prisma models and Authentication. Because they do not exist, we must build them.
- **Process Spawning**: The Node.js backend must spawn the Python `ingest_upsc_paper.py` script and capture its JSON output securely.

## 12. Exact Phase 1 Implementation Plan
1. **Approval**: Confirm with you that we must scaffold the backend (Express + Prisma + SQLite/Postgres) since it doesn't exist yet.
2. **Frontend UI (Steps 3-6)**: Build the React interfaces for Login and Dashboard.
3. **Backend Scaffolding & Auth**: Initialize Prisma, define `User`, `IngestionJob`, `Paper`, `Question` models. Implement Admin JWT login.
4. **Ingestion Upload (Steps 7-8)**: Build the `/fetchiq/ingestion` UI and the backend upload API.
5. **Pipeline Integration**: The backend API will save the uploaded PDF, invoke `py ingest_upsc_paper.py <path>`, parse the resulting JSON, and save it to the DB as an unapproved `IngestionJob`.
6. **Review & Approve (Steps 14-15)**: Build the Review UI where the admin can see confidence scores and edit metadata, followed by the Approval API which moves the data to the official `Paper`/`Question` tables.
7. **Mains 360 Integration (Steps 16-17)**: Update the PYQ Archive API client to fetch approved papers from the database.

---
**AWAITING YOUR APPROVAL TO PROCEED.**
Please acknowledge the lack of an existing backend/Prisma schema, and give me permission to begin **STEP 3 (Implement FetchIQ login)** along with setting up the necessary backend structure.
