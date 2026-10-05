# FetchIQ Extraction Architecture Audit

## 1. Existing Extraction Scripts Overview
The repository contains a robust set of modular Python extraction scripts designed to handle various UPSC paper layouts.

1. `test_question_parser.py` (2-Column Bilingual Layout)
2. `extract_page_by_page.py` (Alternating Pages Layout)
3. `extract_upside_downside.py` (Stacked Vertical Layout)
4. `extract_pdf_rapidocr.py` (Digital Text & Block OCR Fallback)
5. `ingest_upsc_paper.py` (The Orchestrator)

---

## 2. Detailed Script Analysis

### `test_question_parser.py`
- **Purpose**: Parses documents formatted in a 2-column layout (e.g., left column English, right column Hindi, or vice-versa).
- **OCR Engine**: PaddleOCR (`lang="hi"`)
- **Input**: Image or PDF path.
- **Process**: Splits each page vertically at the midpoint. Uses Devanagari character counting to identify which column is Hindi.
- **Output**: JSON containing structured questions (`english` and `hindi` pairs with options).
- **Strengths**: Accurately pairs bilingual questions when placed side-by-side.

### `extract_page_by_page.py`
- **Purpose**: Parses documents where English and Hindi translations are placed on entirely separate pages (e.g., Page 1 English, Page 2 Hindi).
- **OCR Engine**: PaddleOCR (`lang="hi"`)
- **Input**: Two images, or a PDF.
- **Process**: Matches Q1 on Page 1 with Q1 on Page 2. Uses Devanagari character counting at the page level.
- **Output**: JSON containing paired structured questions.
- **Strengths**: Perfect for older UPSC papers or state service papers that isolate languages by page.

### `extract_upside_downside.py`
- **Purpose**: Parses documents where the English text is immediately followed by the Hindi translation stacked vertically in the same column/page.
- **OCR Engine**: PaddleOCR (`lang="hi"`)
- **Input**: Image or PDF.
- **Process**: Extracts all text blocks, isolates question numbering, and splits the subsequent text block into English and Hindi based on Devanagari detection. Also specifically extracts marks/word limit metadata.
- **Output**: JSON containing paired structured questions with metadata.
- **Strengths**: Handles complex subparts (`(a)`, `(b)`) very well.

### `extract_pdf_rapidocr.py`
- **Purpose**: A fast text extractor that attempts digital text extraction first, falling back to RapidOCR for layout-preserving block extraction.
- **OCR Engine**: RapidOCR (ONNX)
- **Input**: PDF.
- **Process**: Uses PyMuPDF/pypdf for native text. If missing, runs RapidOCR and stitches columns into a reading-order text string.
- **Output**: Plain Text string (not structured JSON).
- **Strengths**: Extremely fast and handles digitally generated PDFs without expensive PaddleOCR inference.
- **Limitations**: Does not structure data into individual questions.

---

## 3. Current Orchestration
- **`ingest_upsc_paper.py`** is the entry point.
- **Current Usage**: It currently hard-codes an import to `test_question_parser.py` (the 2-column parser).
- **Problem**: If a user uploads a paper with a stacked layout, the 2-column parser will fail to align the data properly.

---

## 4. Architecture Recommendations for FetchIQ

1. **Primary Implementation**: `ingest_upsc_paper.py` should remain the orchestrator.
2. **Strategy**: FetchIQ should not run one hardcoded parser. Instead, it should use a heuristic or allow the Admin to select the layout type (2-column, stacked, separate pages) in the UI, passing this choice to `ingest_upsc_paper.py`.
3. **Normalized Output**: The orchestrator is already successfully producing a normalized output schema (`output/upsc_ingestion/<name>_normalized.json`), which the Node.js backend can directly ingest.
4. **Fallback**: `extract_pdf_rapidocr.py` should be used specifically when we only need the raw text to perform AI classification (Exam, Year, Subject) *before* attempting the heavy PaddleOCR question extraction.

### Next Step
We are ready to proceed with **STEP 3 (Verify Prisma/npm runtime)** and **STEP 4 (Verify backend startup)**.
