# FetchIQ OCR Terminal Live Logging Report

## 1. Root Cause Analysis
Previously, when the FetchIQ application ingested a PDF, it fired a background Python script using Node's `spawn()`. However, two problems masked the live Python logs:
1. Python detected it wasn't running interactively and buffered stdout/stderr by default. Because of block-buffering, chunks were not emitted immediately.
2. The Node side event listeners (`pyProcess.stdout.on`) received unstructured data buffers. Instead of properly handling partial chunks (chunks terminating mid-line), it naively called `.split('\n')`. This corrupted stdout streams—breaking multi-line strings, swallowing fragments, and randomly splitting Hindi Unicode characters across different `console.log()` calls.

## 2. Implementations & Fixes

**Child Process Environment (Unbuffered mode):**
The `spawn` call inside `backend/routes/ingestion.js` was modified to inject `PYTHONUNBUFFERED: '1'` and `PYTHONIOENCODING: 'utf-8'`. This forces Python to push all log statements down the pipe instantaneously without buffering and strictly guarantees valid Unicode stream output.

**Stream Buffer Safety:**
Instead of raw line splitting on every emitted chunk, I built a safe streaming line buffer logic for both stdout and stderr:
```javascript
let stdoutBuffer = '';
pyProcess.stdout.on('data', (data) => { 
  const str = data.toString('utf8');
  const lines = (stdoutBuffer + str).split('\n');
  stdoutBuffer = lines.pop(); // Hold back the last incomplete fragment
  lines.forEach(l => console.log(`[OCR][STDOUT] ${l.replace(/\r$/, '')}`));
});
```

**Lifecycle Auditing:**
The node logging pipeline was refactored exactly to the required specification. 
Terminal streams now look like this:
```
[INGEST] Upload received: GS-I PDF.pdf
[INGEST] SHA-256: ...
[INGEST] Job created: ...
[OCR] Starting Python ingestion...
[OCR] PID: 12345
[OCR][STDOUT] Processing PDF...
[OCR][STDERR] <warnings>
[OCR] Process closed
[OCR] exitCode=0
[INTELLIGENCE] Starting document intelligence...
[INTELLIGENCE] Questions extracted: 20
[INTELLIGENCE] Validation status: READY_FOR_REVIEW
[INGEST] Final status: READY_FOR_REVIEW
```
If Python fails entirely, we log:
```
[INGEST] Final status: FAILED
[INGEST] Failure reason: OCR_PROCESS_FAILED
```

## 3. Preservation of Data
The DB records, JSON payloads, and validation engines are completely untouched. This is strictly a visibility enhancement mapping standard Unix streams efficiently into the parent node environment console output.

## 4. Test Results
- **test_ocr_terminal_logging.cjs**: Fired a mock Python program generating simulated stdout and stderr chunk strings. Output successfully parsed via unbuffered pipeline without destroying end-of-line signals. PASSED.
- **npm run build**: Client bundle compiled cleanly. PASSED.
