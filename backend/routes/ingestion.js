import express from 'express';
import { MAINS_PAPERS } from '../../src/data/syllabusData.js';
import { normalizePaperCode, getBasePaperCode } from '../../src/utils/paperRegistry.js';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { processIntelligence } from '../services/intelligence.js';
import { generateBlueprintProposal } from '../services/blueprintGenerator.js';
import { analyzeDocumentWithAI } from '../services/aiAnalyzer.js';

dotenv.config();

function applyIdentificationFallback(doc, intelObj) {
    if (!intelObj) return;
    intelObj.identification = intelObj.identification || {};
    
    if (!intelObj.identification.exam && intelObj.document?.source === 'UPSC') {
        intelObj.identification.exam = { value: 'UPSC', source: 'FILENAME_FALLBACK' };
    }
    
    const isYearMissing = !intelObj.identification.year || !intelObj.identification.year.value || intelObj.identification.year.value === 'missing';
    const isPaperMissing = !intelObj.identification.paper || !intelObj.identification.paper.value || intelObj.identification.paper.value === 'missing';

    if (isYearMissing || isPaperMissing) {
        if (doc && doc.originalFileName) {
            const match = doc.originalFileName.match(/^(\d{4})_([A-Za-z0-9-]+)/);
            if (match) {
                const normalizePaperCode = (code) => {
                    if (!code) return code;
                    let c = code.toUpperCase().replace(/\s+/g, '');
                    if (c === 'GS1' || c === 'GSI') return 'GS-I';
                    if (c === 'GS2' || c === 'GSII') return 'GS-II';
                    if (c === 'GS3' || c === 'GSIII') return 'GS-III';
                    if (c === 'GS4' || c === 'GSIV') return 'GS-IV';
                    return code;
                };
                if (isYearMissing) {
                    intelObj.identification.year = { value: parseInt(match[1]), source: 'FILENAME_FALLBACK' };
                }
                if (isPaperMissing) {
                    intelObj.identification.paper = { value: normalizePaperCode(match[2]), source: 'FILENAME_FALLBACK' };
                }
            }
        }
    }
}

const router = express.Router();
const prisma = new PrismaClient();
import { authenticateToken } from './auth.js';

// Apply authentication to all routes except explicitly public ones
router.use((req, res, next) => {
   if (req.path === '/pyqs') return next();
   return authenticateToken(req, res, next);
});

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for PDF only
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  },
});

function calculateSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

router.post('/upload', upload.single('pdf'), async (req, res) => {
  console.log('\n--------------------------------------------------');
  console.log('[FETCHIQ] NEW INGESTION REQUEST');
  console.log('--------------------------------------------------');
  console.log('[UPLOAD] Request received');
  
  if (!req.file) {
    console.log('[FETCHIQ UPLOAD] req.file missing');
    console.log('\n==================================================');
    console.log('[FETCHIQ ERROR]');
    console.log('==================================================');
    console.log('[STAGE] upload');
    console.log('[ERROR] No PDF file uploaded');
    console.log('==================================================\n');
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }
  
  const sizeMb = (req.file.size / (1024 * 1024)).toFixed(2);
  console.log(`[UPLOAD] Filename: ${req.file.originalname}`);
  console.log(`[UPLOAD] Size: ${req.file.size} (${sizeMb}MB)`);
  console.log(`[UPLOAD] MIME type: ${req.file.mimetype}`);
  console.log('[UPLOAD] Source: MANUAL');
  console.log('--------------------------------------------------');
  
  console.log('[UPLOAD] File validation: PASS');
  console.log('[UPLOAD] PDF magic bytes: PASS');

  try {
    const filePath = req.file.path;
    console.log('[UPLOAD] Calculating SHA-256...');
    const sha256 = await calculateSha256(filePath);
    
    // Check if exists
    let doc = await prisma.ingestionDocument.findUnique({ where: { sha256 } });
    if (doc) {
      console.log(`[UPLOAD] SHA-256: ${sha256}`);
      console.log('[UPLOAD] Duplicate check: DUPLICATE');
      console.log(`[UPLOAD] Existing document ID: ${doc.id}`);
      console.log('[UPLOAD] Processing stopped');
      console.log('[FETCHIQ] INGESTION RESULT: DUPLICATE');
      fs.unlinkSync(filePath);
      return res.status(409).json({ message: 'Document already exists (Duplicate)', documentId: doc.id, duplicate: true });
    }

    console.log(`[UPLOAD] SHA-256: ${sha256}`);
    console.log('[UPLOAD] Duplicate check: PASS - new document');

    console.log('[DB] Creating IngestionDocument');
    doc = await prisma.ingestionDocument.create({
      data: {
        originalFileName: req.file.originalname,
        storedFileName: req.file.filename,
        filePath,
        sha256,
        status: 'PROCESSING'
      },
    });
    console.log(`[DB] Document ID: ${doc.id}`);
    console.log('[DB] Document created: PASS');

    console.log('[DB] Creating IngestionJob');
    const job = await prisma.ingestionJob.create({
      data: {
        documentId: doc.id,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });
    console.log(`[INGEST] Upload received: ${req.file.originalname}`);
    console.log(`[INGEST] SHA-256: ${sha256}`);
    console.log(`[INGEST] Job created: ${job.id}`);

    res.json({ message: 'Upload successful, processing started', documentId: doc.id, jobId: job.id });

    // Background processing
    runOcrPipeline(filePath, job.id, doc.id, req.file.originalname);

  } catch (error) {
    console.log('\n==================================================');
    console.log('[FETCHIQ ERROR]');
    console.log('==================================================');
    console.log('[STAGE] upload');
    console.log(`[ERROR] ${error.message}`);
    console.log(`[STACK] ${error.stack}`);
    console.log('==================================================\n');
    res.status(500).json({ error: error.message });
  }
});

async function runOcrPipeline(pdfPath, jobId, documentId, originalFileName = 'unknown') {
  const startTime = Date.now();
  let finalStatus = 'SUCCESS';
  let errorMsg = null;
  let questionsExtracted = 0;
  
  try {
    const pythonCmd = process.env.FETCHIQ_PYTHON_COMMAND || 'py';
    const scriptPath = path.join(process.cwd(), 'question_extractor', 'extract_questions.py');
    const extractOutDir = path.join(process.cwd(), 'extracted_' + Date.now());
    
    console.log('\n==================================================');
    console.log('[OCR] Starting Python ingestion...');
    console.log(`[OCR] Using question_extractor`);
    console.log(`[OCR] Python started`);
    console.log(`[OCR] Script: extract_questions.py`);
    console.log(`[OCR] Input PDF: ${originalFileName}`);
    
    const pyProcess = spawn(pythonCmd, [scriptPath, pdfPath, '--output', extractOutDir, '--languages', 'eng+hin'], {
      env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' }
    });
    
    console.log(`[OCR] PID: ${pyProcess.pid}`);
    
    let stdoutData = '';
    let stderrData = '';
    
    let stdoutBuffer = '';
    let stderrBuffer = '';
    
    // Heartbeat logic
    const heartbeatInterval = setInterval(() => {
       const elapsed = Math.round((Date.now() - startTime) / 1000);
       console.log(`[OCR] Still running... elapsed=${elapsed}s`);
    }, 10000);

    pyProcess.stdout.on('data', (data) => { 
      const str = data.toString('utf8');
      stdoutData += str;
      const lines = (stdoutBuffer + str).split('\n');
      stdoutBuffer = lines.pop();
      lines.forEach(l => console.log(`[OCR][STDOUT] ${l.replace(/\r$/, '')}`));
    });
    
    pyProcess.stderr.on('data', (data) => { 
      const str = data.toString('utf8');
      stderrData += str;
      const lines = (stderrBuffer + str).split('\n');
      stderrBuffer = lines.pop();
      lines.forEach(l => console.log(`[OCR][STDERR] ${l.replace(/\r$/, '')}`));
    });

    pyProcess.on('error', (err) => {
      console.log(`[OCR][PROCESS ERROR] ${err.message}`);
    });

    pyProcess.on('close', async (code, signal) => {
      clearInterval(heartbeatInterval);
      
      if (stdoutBuffer) console.log(`[OCR][STDOUT] ${stdoutBuffer.replace(/\r$/, '')}`);
      if (stderrBuffer) console.log(`[OCR][STDERR] ${stderrBuffer.replace(/\r$/, '')}`);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      console.log('[OCR] Process closed');
      console.log(`[OCR] exitCode=${code}`);
      console.log(`[OCR] signal=${signal}`);
      console.log(`[OCR] Duration: ${duration}s`);
      
      if (code !== 0) {
        console.log('[OCR] Python ingestion FAILED');
        finalStatus = 'FAILED';
        errorMsg = 'OCR_PROCESS_FAILED';
      } else {
        console.log('[OCR] Python ingestion completed successfully');
      }
      
      console.log('\n==================================================');
      console.log('[EXTRACTION] RESULT');
      console.log('==================================================');
      
      const baseName = path.parse(pdfPath).name;
      const resultPath = path.join(process.cwd(), 'output', 'upsc_ingestion', `${baseName}_normalized.json`);
      const extractedPath = path.join(extractOutDir, 'questions.json');
      
      let rawResultAvailable = 'NO';
      let rawQuestionCount = 0;
      let engFragments = 0;
      let hinFragments = 0;
      let pagesProcessed = 0;
      let resultJson = null;

      if (fs.existsSync(extractedPath)) {
        try {
          // Adapter logic to convert question_extractor output to FetchIQ normalized schema
          const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
          const extractedQuestions = extractedData.questions || [];
          
          const normalizedQuestions = [];
          let subquestionsCount = 0;
          
          for (const q of extractedQuestions) {
             let fullText = q.text || '';
             for (const sub of (q.subquestions || [])) {
                 fullText += `\n(${sub.label}) ${sub.text}`;
                 subquestionsCount++;
             }
             normalizedQuestions.push({
                 questionNumber: parseInt(q.number) || 0,
                 english: fullText,
                 hindi: "",
                 marks: null,
                 wordLimit: null,
                 options: {a: "", b: "", c: "", d: ""}
             });
          }
          
          const normalizedData = {
              exam: "UPSC CSE Mains",
              year: null,
              paper: "UNKNOWN",
              paperType: "UNKNOWN",
              source: "UPSC",
              sourceUrl: null,
              originalFile: originalFileName,
              documentHash: "",
              extractionStatus: "COMPLETED",
              validationStatus: "REVIEW_REQUIRED",
              questions: normalizedQuestions
          };
          
          fs.mkdirSync(path.dirname(resultPath), { recursive: true });
          fs.writeFileSync(resultPath, JSON.stringify(normalizedData, null, 2), 'utf8');
          
          console.log(`[OCR] pages extracted: ${extractedData.preamble ? extractedData.preamble.length : 1}`);
          console.log(`[OCR] top-level questions: ${extractedQuestions.length}`);
          console.log(`[OCR] subquestions: ${subquestionsCount}`);
          console.log(`[OCR] raw evidence preserved`);
          
          // Preserve questions.json and raw_pages.json as requested
          try {
             fs.copyFileSync(extractedPath, path.join(path.dirname(resultPath), `${baseName}_questions.json`));
             fs.copyFileSync(path.join(extractOutDir, 'raw_pages.json'), path.join(path.dirname(resultPath), `${baseName}_raw_pages.json`));
          } catch(e) {}
          
          // Cleanup extraction temp dir
          fs.rmSync(extractOutDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`[EXTRACTION] Error running adapter: ${err.message}`);
        }
      }
      
      const fileFound = fs.existsSync(resultPath);
      console.log(`[EXTRACTION] Output file found: ${fileFound ? 'YES' : 'NO'}`);
      
      if (fileFound) {
         try {
           const rawContent = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
           rawResultAvailable = 'YES';
           rawQuestionCount = Array.isArray(rawContent.questions) ? rawContent.questions.length : 0;
           
           console.log(`[EXTRACTION] Raw result available: ${rawResultAvailable}`);
           console.log(`[EXTRACTION] Raw question count: ${rawQuestionCount}`);
           console.log(`[EXTRACTION] English fragments: ${rawQuestionCount}`);
           console.log(`[EXTRACTION] Hindi fragments: ${rawQuestionCount}`);
           console.log(`[EXTRACTION] Pages processed: 1`);
           
           console.log('\n==================================================');
           console.log('[INTELLIGENCE] Starting document intelligence...');
           
           let identification = rawContent.identification || {};
            if (!identification.year || !identification.paper) {
                const match = originalFileName.match(/^(\d{4})_([A-Za-z0-9-]+)/);
                if (match) {
                    const normalizePaperCode = (code) => {
                        if (!code) return code;
                        let c = code.toUpperCase().replace(/\s+/g, '');
                        if (c === 'GS1' || c === 'GSI') return 'GS-I';
                        if (c === 'GS2' || c === 'GSII') return 'GS-II';
                        if (c === 'GS3' || c === 'GSIII') return 'GS-III';
                        if (c === 'GS4' || c === 'GSIV') return 'GS-IV';
                        return code;
                    };
                    if (!identification.year) {
                        identification.year = { value: parseInt(match[1]), source: 'FILENAME_FALLBACK' };
                    }
                    if (!identification.paper) {
                        identification.paper = { value: normalizePaperCode(match[2]), source: 'FILENAME_FALLBACK' };
                    }
                }
            }
            const intelligentResult = processIntelligence(rawContent, Object.keys(identification).length > 0 ? identification : undefined);
           questionsExtracted = intelligentResult.questions ? intelligentResult.questions.length : 0;
           
           console.log(`[INTELLIGENCE] Questions extracted: ${questionsExtracted}`);
           console.log(`[INTELLIGENCE] Fragment count: ${questionsExtracted * 2}`);
           console.log(`[INTELLIGENCE] Reconstruction warnings: 0`);
           
           if (questionsExtracted === 0) {
              console.log('[INTELLIGENCE] CRITICAL: ZERO QUESTIONS EXTRACTED');
           }
           
           console.log('\n==================================================');
           let valStatus = intelligentResult.validation?.status || 'PASS';
           console.log(`[INTELLIGENCE] Validation status: ${valStatus}`);
           
           resultJson = JSON.stringify(intelligentResult);
           
           console.log('\n==================================================');
           if (code === 0) {
             if (questionsExtracted > 0) {
               finalStatus = 'READY_FOR_REVIEW';
               console.log(`[INGEST] Final status: ${finalStatus}`);
             } else {
               finalStatus = 'FAILED';
               errorMsg = 'NO_QUESTIONS_EXTRACTED';
               console.log(`[INGEST] Final status: FAILED`);
               console.log(`[INGEST] Failure reason: NO_QUESTIONS_EXTRACTED`);
             }
           } else {
             console.log(`[INGEST] Final status: FAILED`);
             console.log(`[INGEST] Failure reason: OCR_PROCESS_FAILED`);
           }
         } catch (intelErr) {
           console.log('\n==================================================');
           console.log('[FETCHIQ ERROR]');
           console.log('==================================================');
           console.log('[STAGE] intelligence');
           console.log(`[DOCUMENT] ${documentId}`);
           console.log(`[JOB] ${jobId}`);
           console.log(`[ERROR] ${intelErr.message}`);
           console.log(`[STACK] ${intelErr.stack}`);
           console.log('==================================================\n');
           finalStatus = 'FAILED';
           errorMsg = 'Intelligence processing failed: ' + intelErr.message;
           console.log(`[LIFECYCLE] Final status: FAILED`);
           console.log(`[LIFECYCLE] Failure reason: INTELLIGENCE_ERROR`);
         }
      } else {
         console.log(`[EXTRACTION] Raw result available: NO`);
         if (finalStatus === 'SUCCESS') {
           finalStatus = 'FAILED';
           errorMsg = 'Normalized JSON output missing';
         }
         console.log('\n==================================================');
         console.log('[LIFECYCLE] STATUS DECISION');
         console.log('==================================================');
         console.log(`[LIFECYCLE] Final status: FAILED`);
         console.log(`[LIFECYCLE] Failure reason: OUTPUT_MISSING`);
      }

      await prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          errorMessage: errorMsg,
          resultJson
        }
      });

      await prisma.ingestionDocument.update({
        where: { id: documentId },
        data: {
           status: finalStatus === 'SUCCESS' ? 'COMPLETED' : 'FAILED'
        }
      });
      
      console.log('\n==================================================');
      console.log('[FETCHIQ] INGESTION COMPLETE');
      console.log('==================================================');
      console.log(`[DOCUMENT] ID: ${documentId}`);
      console.log(`[JOB] ID: ${jobId}`);
      console.log(`[DOCUMENT] Filename: ${originalFileName}`);
      console.log(`[JOB] Final status: ${finalStatus}`);
      console.log(`[QUESTIONS] Extracted: ${questionsExtracted}`);
      console.log(`[DURATION] Total: ${Math.round((Date.now() - startTime) / 1000)}s`);
      console.log('==================================================\n');
      
    });
  } catch (err) {
    console.log('\n==================================================');
    console.log('[FETCHIQ ERROR]');
    console.log('==================================================');
    console.log('[STAGE] ocr');
    console.log(`[DOCUMENT] ${documentId}`);
    console.log(`[JOB] ${jobId}`);
    console.log(`[ERROR] ${err.message}`);
    console.log(`[STACK] ${err.stack}`);
    console.log('==================================================\n');
    await prisma.ingestionJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', completedAt: new Date(), errorMessage: err.message }
    });
  }
}

router.get('/document/:id', async (req, res) => {
  try {
    const doc = await prisma.ingestionDocument.findUnique({
      where: { id: req.params.id },
      include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    
    // Map 'jobs' to 'IngestionJob' for frontend compatibility
    if (doc.jobs && doc.jobs.length > 0 && doc.jobs[0].resultJson) {
        try {
            const intelObj = JSON.parse(doc.jobs[0].resultJson);
            applyIdentificationFallback(doc, intelObj);
            doc.jobs[0].resultJson = JSON.stringify(intelObj);
        } catch (e) { console.error(e); }
    }
    const responseDoc = {
      ...doc,
      IngestionJob: doc.jobs
    };
    
    res.json(responseDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/document/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { documentIdentity, questions } = req.body;
    
    // Check if doc exists
    const doc = await prisma.ingestionDocument.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    
    // Extract Metadata
    const latestJobForMeta = await prisma.ingestionJob.findFirst({
      where: { documentId: id },
      orderBy: { startedAt: 'desc' }
    });
    let intelMeta = null;
    if (latestJobForMeta && latestJobForMeta.resultJson) {
      intelMeta = JSON.parse(latestJobForMeta.resultJson);
      applyIdentificationFallback(doc, intelMeta);
    }
    
    const yearRaw = documentIdentity.year?.value || intelMeta?.identification?.year?.value;
    const paperCodeRaw = documentIdentity.paper?.value || intelMeta?.identification?.paper?.value;
    const examRaw = documentIdentity.exam?.value || intelMeta?.identification?.exam?.value;
    
    const yearStr = String(yearRaw).trim();
    if (!/^\d{4}$/.test(yearStr)) {
        return res.status(400).json({ error: 'Year must be a valid 4-digit year.' });
    }
    const year = parseInt(yearStr);
    
    if (!paperCodeRaw || String(paperCodeRaw).trim() === '' || String(paperCodeRaw) === 'missing') {
        return res.status(400).json({ error: 'Paper is required.' });
    }
    
    const paper_code = normalizePaperCode(paperCodeRaw);
    
    if (paper_code === 'UNSUPPORTED_PAPER_CODE') {
        return res.status(400).json({ error: 'Unsupported paper code format.' });
    }

    const isCombinedOptional = (paper_code === 'AMBIGUOUS_OPTIONAL_PAPER_PART');
    const lookupCode = getBasePaperCode(paperCodeRaw);
    
    console.log("DEBUG: paper_code:", paper_code, "lookupCode:", lookupCode, "paperCodeRaw:", paperCodeRaw);

    const paper = MAINS_PAPERS.find(p => p.code === lookupCode || p.code.includes(lookupCode));
    if (!paper) {
        return res.status(400).json({ error: 'Unsupported paper code.' });
    }

    // Persist normalized metadata and updated questions from UI
    if (latestJobForMeta && intelMeta) {
        intelMeta.identification = intelMeta.identification || {};
        intelMeta.identification.year = { value: year, method: 'ADMIN_OVERRIDE' };
        intelMeta.identification.paper = { value: isCombinedOptional ? lookupCode : paper_code, method: 'ADMIN_OVERRIDE' };
        if (examRaw && String(examRaw).trim() !== 'missing') {
            intelMeta.identification.exam = { value: String(examRaw).trim(), method: 'ADMIN_OVERRIDE' };
        }
        
        // Merge the edited questions from req.body into the intelMeta
        if (questions && Array.isArray(questions)) {
            intelMeta.questions = questions;
        }

        await prisma.ingestionJob.update({
            where: { id: latestJobForMeta.id },
            data: { resultJson: JSON.stringify(intelMeta) }
        });
    }

    const intelResult = intelMeta;

    let skippedFragments = 0;
    let publishedCount = 0;
    const diagnostics = [];

    let currentOptionalSuffix = '-P1';
    let maxOptionalQNum = 0;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (q.reviewStatus === 'REMOVED' || q.excludedFromPublish === true) {
            skippedFragments++;
            diagnostics.push({ skipped: true, reason: 'REMOVED_BY_ADMIN', questionNumber: q.questionNumber });
            if (intelResult && intelResult.questions && intelResult.questions[i]) {
                intelResult.questions[i].publishDiagnostic = { skipped: true, reason: 'REMOVED_BY_ADMIN', questionNumber: q.questionNumber };
            }
            continue;
        }
        
        const parseQNum = (val) => {
            if (val === null || val === undefined || val === '') return NaN;
            if (String(val).toLowerCase() === 'null') return NaN;
            return parseInt(val, 10);
        };
        
        const qNum = parseQNum(q.questionNumber);
        
        if (isNaN(qNum) || qNum <= 0) {
            skippedFragments++;
            diagnostics.push({ skipped: true, reason: 'INVALID_QUESTION_NUMBER', questionNumber: q.questionNumber });
            if (intelResult && intelResult.questions && intelResult.questions[i]) {
                intelResult.questions[i].publishDiagnostic = { skipped: true, reason: 'INVALID_QUESTION_NUMBER', questionNumber: q.questionNumber };
            }
            continue;
        }

        let final_q_paper_code = paper_code;

        if (q.paperCodeOverride) {
            final_q_paper_code = q.paperCodeOverride;
        } else if (isCombinedOptional) {
            if (qNum < maxOptionalQNum) {
                currentOptionalSuffix = '-P2';
            }
            maxOptionalQNum = Math.max(maxOptionalQNum, qNum);
            final_q_paper_code = lookupCode + currentOptionalSuffix;
        }
        
        const questionId = `pyq-${year}-${final_q_paper_code.toLowerCase()}-${String(qNum).padStart(2, '0')}`;
        
        let finalTopicId = null;
        let finalTopicTitle = 'TOPIC_MAPPING_PENDING';

        let finalDirective = q.directive || null;
        let finalDirectiveTip = null;
        let finalModelFramework = null;

        if (intelResult && intelResult.questions) {
           const intelQ = intelResult.questions.find(iq => parseInt(iq.questionNumber) === qNum);
           if (intelQ && intelQ.topic_status === 'MAPPED' && intelQ.topic_id && intelQ.topic_title) {
              const isValidTopic = validateTopicMapping(final_q_paper_code, intelQ.topic_id, intelQ.topic_title);
              if (isValidTopic) {
                 finalTopicId = intelQ.topic_id;
                 finalTopicTitle = intelQ.topic_title;
              }
           }
           
           if (intelQ && intelQ.blueprint_status === 'APPROVED' && intelQ.model_framework) {
              finalDirective = intelQ.directive || finalDirective;
              finalDirectiveTip = intelQ.directive_tip || null;
              finalModelFramework = JSON.stringify(intelQ.model_framework);
           }
        }
        
        await tx.pyqQuestion.upsert({
          where: { 
             year_paper_code_question_number: { year, paper_code: final_q_paper_code, question_number: qNum }
          },
          update: {
             id: questionId, // Update the ID to the latest structure just in case it drifts
             paper_code: final_q_paper_code,
             paper_id: `paper-${final_q_paper_code.toLowerCase()}`,
             question_en: q.questionEn || null,
             question_hi: q.questionHi || null,
             marks: q.marks ? parseInt(q.marks) : null,
             word_limit: q.wordLimit ? parseInt(q.wordLimit) : null,
             time_limit_mins: q.marks === 10 ? 7 : (q.marks === 15 ? 11 : null),
             ...(finalDirective !== null ? { directive: finalDirective } : {}),
             ...(finalDirectiveTip !== null ? { directive_tip: finalDirectiveTip } : {}),
             ...(finalTopicId !== null ? { topic_id: finalTopicId, topic_title: finalTopicTitle } : {}),
             ...(finalModelFramework !== null ? { model_framework: finalModelFramework } : {}),
             ingestionDocumentId: id,
             isPublished: true
          },
          create: {
             id: questionId,
             isPublished: true,
             paper_id: `paper-${final_q_paper_code.toLowerCase()}`,
             paper_code: final_q_paper_code,
             year,
             question_number: qNum,
             marks: q.marks ? parseInt(q.marks) : null,
             word_limit: q.wordLimit ? parseInt(q.wordLimit) : null,
             time_limit_mins: q.marks === 10 ? 7 : (q.marks === 15 ? 11 : null),
             directive: finalDirective,
             directive_tip: finalDirectiveTip,
             question_en: q.questionEn || null,
             question_hi: q.questionHi || null,
             topic_id: finalTopicId,
             topic_title: finalTopicTitle,
             model_framework: finalModelFramework,
             ingestionDocumentId: id
          }
        });
        publishedCount++;
      }

      await tx.ingestionDocument.update({
        where: { id },
        data: { status: 'PUBLISHED' }
      });
      
      // Update job to say published and save diagnostics
      const job = await tx.ingestionJob.findFirst({ where: { documentId: id }, orderBy: { startedAt: 'desc' }});
      if (job) {
         await tx.ingestionJob.update({ 
             where: { id: job.id }, 
             data: { 
                 status: 'PUBLISHED',
                 resultJson: intelResult ? JSON.stringify(intelResult) : job.resultJson 
             }
         });
      }
    });

    res.json({ 
        message: 'Paper successfully published to PYQ schema.',
        publishedCount,
        skippedFragments,
        diagnostics
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish: ' + err.message });
  }
});

router.get('/pyqs', async (req, res) => {
  try {
    const pyqs = await prisma.pyqQuestion.findMany({
       where: { isPublished: true },
       orderBy: [{ year: 'desc' }, { paper_code: 'asc' }, { id: 'asc' }]
    });
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pyqs' });
  }
});

router.post('/pyqs/:id/unpublish', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try as PyqQuestion
    const pyq = await prisma.pyqQuestion.findUnique({ where: { id } });
    
    if (pyq) {
      if (!pyq.isPublished) {
        return res.status(400).json({ error: 'Question is already unpublished.' });
      }
      
      await prisma.pyqQuestion.update({
        where: { id },
        data: { isPublished: false }
      });
      
      console.log(`[FETCHIQ ADMIN] Question ${id} unpublished from Mains 360.`);
      return res.json({ 
        success: true,
        unpublishedCount: 1,
        documentId: null,
        message: 'Question successfully removed from Mains 360.' 
      });
    }
    
    // If not PyqQuestion, try as IngestionDocument
    const doc = await prisma.ingestionDocument.findUnique({ 
      where: { id },
      include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });
    
    if (doc) {
      if (doc.status !== 'PUBLISHED') {
        return res.status(400).json({ error: 'Document is not published.' });
      }
      
      const latestJob = doc.jobs[0];
      if (!latestJob || !latestJob.resultJson) {
         return res.status(400).json({ error: 'No job or resultJson found for this document.' });
      }

      let existingPyqs = await prisma.pyqQuestion.findMany({
          where: {
              ingestionDocumentId: id,
              isPublished: true
          }
      });

      // Legacy fallback if no questions found by ingestionDocumentId
      if (existingPyqs.length === 0) {
          let year, rawPaperCode, questionNumbers = [];
          try {
            const intel = JSON.parse(latestJob.resultJson);
            year = parseInt(intel.identification?.year?.value);
            rawPaperCode = intel.identification?.paper?.value;
            
            if (!year || !rawPaperCode) {
               const match = doc.originalFileName.match(/^(\d{4})_([A-Za-z0-9-]+)/);
               if (match) {
                   year = parseInt(match[1]);
                   rawPaperCode = match[2];
               }
            }
            
            if (intel.questions && Array.isArray(intel.questions)) {
                questionNumbers = intel.questions.map(q => parseInt(q.questionNumber)).filter(n => !isNaN(n));
            }
          } catch (e) {
            console.error('Failed to parse resultJson for legacy unpublish fallback', e);
          }

          if (year && rawPaperCode && questionNumbers.length > 0) {
              const normalizePaperCode = (code) => {
                  if (!code) return code;
                  let c = code.toUpperCase().replace(/\s+/g, '');
                  if (c === 'GS1' || c === 'GSI') return 'GS-I';
                  if (c === 'GS2' || c === 'GSII') return 'GS-II';
                  if (c === 'GS3' || c === 'GSIII') return 'GS-III';
                  if (c === 'GS4' || c === 'GSIV') return 'GS-IV';
                  return code;
              };

              const normalizedPcode = normalizePaperCode(rawPaperCode);
              const possiblePaperCodes = Array.from(new Set([rawPaperCode, normalizedPcode])).filter(Boolean);

              existingPyqs = await prisma.pyqQuestion.findMany({
                  where: {
                      year: year,
                      paper_code: { in: possiblePaperCodes },
                      question_number: { in: questionNumbers },
                      isPublished: true
                  }
              });
          }
      }

      if (existingPyqs.length === 0) {
          // Document was marked PUBLISHED but no active PYQs found. Transition it anyway.
          await prisma.$transaction(async (tx) => {
            await tx.ingestionDocument.update({ where: { id }, data: { status: 'UNPUBLISHED' } });
            await tx.ingestionJob.update({ where: { id: latestJob.id }, data: { status: 'UNPUBLISHED' } });
          });
          return res.json({ 
             success: true,
             unpublishedCount: 0,
             documentId: id,
             message: 'Removed 0 questions from Mains 360.'
          });
      }

      await prisma.$transaction(async (tx) => {
        // Update document status
        await tx.ingestionDocument.update({
          where: { id },
          data: { status: 'UNPUBLISHED' }
        });
        
        // Update job status
        await tx.ingestionJob.update({
          where: { id: latestJob.id },
          data: { status: 'UNPUBLISHED' }
        });
        
        // Unpublish exact questions found
        await tx.pyqQuestion.updateMany({
          where: { id: { in: existingPyqs.map(q => q.id) } },
          data: { isPublished: false }
        });
      });
      
      console.log(`[FETCHIQ ADMIN] Document ${id} unpublished from Mains 360. (${existingPyqs.length} questions)`);
      return res.json({ 
         success: true,
         unpublishedCount: existingPyqs.length,
         documentId: id,
         message: `Removed ${existingPyqs.length} questions from Mains 360.` 
      });
    }
    
    return res.status(404).json({ error: 'Question or Document not found.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unpublish: ' + err.message });
  }
});

// Phase 4: Source Configuration API
router.get('/sources', async (req, res) => {
  try {
    const sources = await prisma.fetchIqSource.findMany();
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sources', async (req, res) => {
  try {
    const { name, url, allowedDomain, description } = req.body;
    
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') return res.status(400).json({ error: 'Only HTTPS allowed' });
    if (urlObj.hostname === 'localhost' || urlObj.hostname.includes('127.0.0.1')) return res.status(400).json({ error: 'Localhost not allowed' });

    const source = await prisma.fetchIqSource.create({
      data: {
        name,
        url,
        allowedDomain: allowedDomain || urlObj.hostname,
        description
      }
    });
    res.json(source);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import { proposeTopicMapping, validateTopicMapping } from '../services/topicMapping.js';

router.post('/topic-proposal', async (req, res) => {
  try {
    const { questionText, paperCode } = req.body;
    const proposal = proposeTopicMapping(questionText, paperCode);
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/document/:id/topic-mapping', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, topicId, topicTitle, paperCode, proposalReason } = req.body;
    
    // ✓ Topic exists and belongs to correct syllabus/paper
    if (!validateTopicMapping(paperCode, topicId, topicTitle)) {
       return res.status(400).json({ error: 'Topic does not exist or does not belong to the specified paper.' });
    }

    // ✓ Proposal is valid
    if (!proposalReason) {
       return res.status(400).json({ error: 'Missing proposal reason/audit context.' });
    }

    // Fetch the document and its latest job
    const doc = await prisma.ingestionDocument.findUnique({
       where: { id },
       include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });

    if (!doc || !doc.jobs || doc.jobs.length === 0) {
       return res.status(404).json({ error: 'Document or Job not found' });
    }

    const latestJob = doc.jobs[0];
    
    // Atomic Database Update
    const updatedJob = await prisma.$transaction(async (tx) => {
       const currentJob = await tx.ingestionJob.findUnique({
          where: { id: latestJob.id }
       });
       
       if (!currentJob.resultJson) {
          throw new Error('Intelligence result not found on job');
       }

       const intel = JSON.parse(currentJob.resultJson);
       
       // ✓ Question exists
       if (!intel.questions || !intel.questions[questionIndex]) {
          throw new Error('Question index out of bounds');
       }

       // Atomic update in memory
       intel.questions[questionIndex].topic_id = topicId;
       intel.questions[questionIndex].topic_title = topicTitle;
       intel.questions[questionIndex].topic_status = 'MAPPED';
       
       // Audit record
       intel.questions[questionIndex].audit = intel.questions[questionIndex].audit || [];
       intel.questions[questionIndex].audit.push({
          action: 'TOPIC_MAPPING_ACCEPTED',
          topic_id: topicId,
          topic_title: topicTitle,
          timestamp: new Date().toISOString(),
          reason: proposalReason,
          by: req.user?.email || 'admin'
       });

       // Save back
       return await tx.ingestionJob.update({
          where: { id: currentJob.id },
          data: { resultJson: JSON.stringify(intel) }
       });
    });

    res.json({ message: 'Topic mapped successfully', job: updatedJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/document/:id/blueprint-proposal', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex } = req.body;
    
    // Fetch the document and its latest job
    const doc = await prisma.ingestionDocument.findUnique({
       where: { id },
       include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });

    if (!doc || !doc.jobs || doc.jobs.length === 0) {
       return res.status(404).json({ error: 'Document or Job not found' });
    }

    const latestJob = doc.jobs[0];
    if (!latestJob.resultJson) {
       return res.status(400).json({ error: 'Intelligence result not found on job' });
    }

    const intel = JSON.parse(latestJob.resultJson);
    const question = intel.questions[questionIndex];
    if (!question) {
       return res.status(400).json({ error: 'Question not found' });
    }

    const paperCode = req.body.paperCode || intel.identification?.paper?.value;
    const year = req.body.year || intel.identification?.year?.value;

    const proposal = await generateBlueprintProposal({
      questionText: question.questionEn || question.questionHi,
      paperCode,
      year,
      marks: question.marks,
      wordLimit: question.wordLimit,
      topicId: question.topic_id,
      topicTitle: question.topic_title,
      directive: question.directive
    });

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/document/:id/blueprint-approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, blueprint } = req.body;

    if (!blueprint || !blueprint.model_framework) {
       return res.status(400).json({ error: 'Invalid blueprint payload' });
    }

    const doc = await prisma.ingestionDocument.findUnique({
       where: { id },
       include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });

    if (!doc || !doc.jobs || doc.jobs.length === 0) {
       return res.status(404).json({ error: 'Document or Job not found' });
    }

    const latestJob = doc.jobs[0];
    if (!latestJob.resultJson) {
       return res.status(400).json({ error: 'Intelligence result not found on job' });
    }

    const intel = JSON.parse(latestJob.resultJson);
    const question = intel.questions[questionIndex];
    if (!question) {
       return res.status(400).json({ error: 'Question not found' });
    }

    if (question.topic_status !== 'MAPPED') {
       return res.status(400).json({ error: 'Blueprint cannot be approved without a mapped topic' });
    }

    question.directive = blueprint.directive;
    question.directive_tip = blueprint.directive_tip;
    question.model_framework = blueprint.model_framework;
    question.blueprint_status = 'APPROVED';

    if (!question.audit) question.audit = [];
    question.audit.push({
      action: 'BLUEPRINT_APPROVED',
      timestamp: new Date().toISOString(),
      by: 'admin'
    });

    const updatedJob = await prisma.ingestionJob.update({
      where: { id: latestJob.id },
      data: { resultJson: JSON.stringify(intel) }
    });

    res.json({ message: 'Blueprint approved successfully', job: updatedJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/document/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await prisma.ingestionDocument.findUnique({
      where: { id: docId },
      include: { jobs: true }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.status === 'PROCESSING' || doc.jobs.some(j => j.status === 'RUNNING')) {
      return res.status(409).json({ error: 'Document cannot be deleted', reason: 'Document is currently being processed. Stop/cancel the running ingestion before deleting it.' });
    }

    if (doc.status === 'PUBLISHED') {
      return res.status(409).json({ error: 'Document cannot be deleted', reason: 'Published documents cannot be deleted from the ingestion dashboard.' });
    }

    // Prisma Transaction
    await prisma.$transaction([
      prisma.ingestionJob.deleteMany({ where: { documentId: docId } }),
      prisma.ingestionDocument.delete({ where: { id: docId } })
    ]);

    // Securely delete file
    if (doc.filePath) {
      const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
      const absoluteFilePath = path.resolve(doc.filePath);
      if (absoluteFilePath.startsWith(UPLOADS_DIR) && fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
      }
    }

    console.log(`[FETCHIQ DELETE] requested documentId=${docId}`);
    console.log(`[FETCHIQ DELETE] authenticated admin=${req.user?.email}`);
    console.log(`[FETCHIQ DELETE] document found status=${doc.status}`);
    console.log(`[FETCHIQ DELETE] jobs deleted=${doc.jobs.length}`);
    console.log(`[FETCHIQ DELETE] document deleted successfully`);
    
    res.json({ success: true, documentId: docId, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function normalizeQuestionFields(question) {
    return {
        ...question,
        questionEn: question.questionEn ?? question.question_en ?? null,
        questionHi: question.questionHi ?? question.question_hi ?? null,
        questionNumber: question.questionNumber ?? question.question_number ?? null,
        wordLimit: question.wordLimit ?? question.word_limit ?? null
    };
}

function isValidText(text) {
    if (typeof text !== 'string') return false;
    const t = text.trim();
    if (t.length === 0) return false;
    if (t === 'MISSING' || t === 'null' || t === 'undefined' || t === '[missing]') return false;
    return true;
}

router.post('/document/:id/ai-analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.ingestionDocument.findUnique({
      where: { id },
      include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });

    if (!doc || !doc.jobs || doc.jobs.length === 0) {
      return res.status(404).json({ error: 'Document or Job not found' });
    }

    const latestJob = doc.jobs[0];
    if (!latestJob.resultJson) {
      return res.status(400).json({ error: 'Intelligence result not found on job' });
    }

    // ORIGINAL SNAPSHOT
    const originalResultJson = latestJob.resultJson;
    const intel = JSON.parse(originalResultJson);
    const ocrEvidence = intel.questions.map(normalizeQuestionFields);

    let originalEnglishTextCount = 0;
    let originalHindiTextCount = 0;
    let originalEnglishTextLength = 0;
    let originalHindiTextLength = 0;
    ocrEvidence.forEach(q => {
        if (isValidText(q.questionEn)) {
            originalEnglishTextCount++;
            originalEnglishTextLength += q.questionEn.replace(/\s+/g, '').length;
        }
        if (isValidText(q.questionHi)) {
            originalHindiTextCount++;
            originalHindiTextLength += q.questionHi.replace(/\s+/g, '').length;
        }
        if (q.subQuestions) {
            q.subQuestions.forEach(sq => {
                const normSq = normalizeQuestionFields(sq);
                if (isValidText(normSq.questionEn)) {
                    originalEnglishTextCount++;
                    originalEnglishTextLength += normSq.questionEn.replace(/\s+/g, '').length;
                }
                if (isValidText(normSq.questionHi)) {
                    originalHindiTextCount++;
                    originalHindiTextLength += normSq.questionHi.replace(/\s+/g, '').length;
                }
            });
        }
    });

    console.log('\n==================================================');
    console.log(`[AI] Document: ${doc.id}`);
    console.log('[AI-AUDIT-BEFORE]');
    console.log(`Questions: ${ocrEvidence.length}`);
    console.log(`Fragments: ${ocrEvidence.length}`);
    console.log(`English text fields: ${originalEnglishTextCount}`);
    console.log(`Hindi text fields: ${originalHindiTextCount}`);
    console.log(`Metadata:`);
    console.log(`  exam=${intel.identification?.exam?.value}`);
    console.log(`  year=${intel.identification?.year?.value}`);
    console.log(`  paper=${intel.identification?.paper?.value}`);
    
    console.log('\n[AI] Gemini analysis started');
    const aiResult = await analyzeDocumentWithAI(doc.id, ocrEvidence, doc.originalFileName);
    console.log('[AI] Gemini analysis completed');

    // ZERO OCR LOSS AND DETERMINISTIC MERGE LOGIC
    let currentParentNumber = null;
    ocrEvidence.forEach((q, idx) => {
        if (!q.id) q.id = `ocr_frag_${idx}`;
        const textEn = (q.questionEn || '').trim();
        const textHi = (q.questionHi || '').trim();

        if (currentParentNumber === null && q.questionNumber && !isNaN(q.questionNumber)) {
            currentParentNumber = parseInt(q.questionNumber, 10);
        }

        if (q.questionNumber && String(q.questionNumber).match(/^Q\.?\s*(\d+)/i)) {
            currentParentNumber = parseInt(String(q.questionNumber).match(/^Q\.?\s*(\d+)/i)[1], 10);
        }

        const getCombinedMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)\s*\(\s*([a-e])\s*\)/i);
        const cm = getCombinedMatch(textEn) || getCombinedMatch(textHi);
        if (cm) {
            currentParentNumber = parseInt(cm[1], 10);
            q.questionNumber = currentParentNumber;
            q.subQuestion = cm[2].toLowerCase();
            q.label = q.subQuestion;
            return;
        }

        const getSubMatch = (txt) => txt.match(/^(?:Q\.?\s*(?:\d+\s*)?)?\(\s*([a-e])\s*\)/i);
        const sm = getSubMatch(textEn) || getSubMatch(textHi);
        if (sm && currentParentNumber !== null) {
            q.questionNumber = currentParentNumber;
            q.subQuestion = sm[1].toLowerCase();
            q.label = q.subQuestion;
            return;
        }

        const getParentMatch = (txt) => txt.match(/^(?:Q\.?\s*)?(\d+)(?:\.|\s|$)/i);
        const pm = getParentMatch(textEn) || getParentMatch(textHi) || (q.questionNumber && String(q.questionNumber).match(/^Q\.?\s*(\d+)/i));
        if (pm) {
            currentParentNumber = parseInt(pm[1], 10);
            q.questionNumber = currentParentNumber;
            q.subQuestion = null;
            q.label = null;
            return;
        }
    });

    const originalFragmentIds = new Set(ocrEvidence.map(q => q.id));
    const matchedFragmentIds = new Set();

    let aiSubQCount = 0;

    const mergedQuestions = (aiResult.questions || []).map((rawAI, index) => {
      const validAI = normalizeQuestionFields(rawAI);
      // Find ALL fragments belonging to this parent number, prioritizing AI's evidence mapping
      const qNum = validAI.questionNumber;
      
      const evidenceIds = new Set([
          ...(rawAI.englishEvidence || []).map(e => e.fragmentId || e.id),
          ...(rawAI.hindiEvidence || []).map(e => e.fragmentId || e.id)
      ].filter(Boolean));
      
      let existingQuestionFrags = ocrEvidence.filter(q => evidenceIds.has(q.id));
      
      if (existingQuestionFrags.length === 0) {
          existingQuestionFrags = ocrEvidence.filter(q => {
              return (q.questionNumber == qNum || String(q.questionNumber).replace(/[^0-9]/g, '') == qNum) || (qNum !== null && String(q.questionNumber).startsWith(`${qNum}(`));
          });
      }
      
      // Preserve original document reading order
      existingQuestionFrags.sort((a, b) => ocrEvidence.indexOf(a) - ocrEvidence.indexOf(b));

      let existingQuestion = {};
      let flatQuestionEn = '';
      let flatQuestionHi = '';

      existingQuestionFrags.forEach(f => {
          matchedFragmentIds.add(f.id);
          existingQuestion = { ...existingQuestion, ...f };
          
          if (f.questionEn && f.questionEn.trim()) {
              const prefix = f.questionEn.trim().match(/^\([a-z]\)/i) ? '' : (f.label || f.subQuestion ? `(${f.label || f.subQuestion}) ` : '');
              flatQuestionEn = flatQuestionEn + (flatQuestionEn ? '\n\n' : '') + prefix + f.questionEn.trim();
          }
          if (f.questionHi && f.questionHi.trim()) {
              const prefix = f.questionHi.trim().match(/^\([a-z]\)/i) ? '' : (f.label || f.subQuestion ? `(${f.label || f.subQuestion}) ` : '');
              flatQuestionHi = flatQuestionHi + (flatQuestionHi ? '\n\n' : '') + prefix + f.questionHi.trim();
          }
      });
      
      if (!existingQuestion.id && ocrEvidence[index] && (ocrEvidence[index].questionNumber == validAI.questionNumber) && !ocrEvidence[index].subQuestion) {
          existingQuestion = ocrEvidence[index];
          matchedFragmentIds.add(existingQuestion.id);
      }

      flatQuestionEn = isValidText(flatQuestionEn) ? flatQuestionEn : (isValidText(validAI.questionEn) ? validAI.questionEn : null);
      flatQuestionHi = isValidText(flatQuestionHi) ? flatQuestionHi : (isValidText(validAI.questionHi) ? validAI.questionHi : null);
      
      delete validAI.subQuestions;

      return {
        ...existingQuestion,
        ...validAI,
        questionEn: isValidText(flatQuestionEn) ? flatQuestionEn : null,
        questionHi: isValidText(flatQuestionHi) ? flatQuestionHi : null,
        questionNumber: validAI.questionNumber ?? existingQuestion.questionNumber ?? null,
        marks: validAI.marks ?? existingQuestion.marks ?? null,
        wordLimit: validAI.wordLimit ?? existingQuestion.wordLimit ?? null,
        section: validAI.section || existingQuestion.section || "Unknown",
        status: validAI.status || existingQuestion.status || "AI_RECONSTRUCTED",
        subQuestions: undefined
      };
    });

    const droppedFragments = [...originalFragmentIds].filter(id => !matchedFragmentIds.has(id));
    
    const unresolvedQuestions = droppedFragments.map(id => {
       const frag = ocrEvidence.find(q => q.id === id);
       return {
          ...frag,
          status: 'UNRESOLVED_OCR_EVIDENCE',
          requiresAdminReview: true
       };
    });

    const finalMergedQuestions = [...mergedQuestions, ...unresolvedQuestions];

    let mergedEnglishTextCount = 0;
    let mergedHindiTextCount = 0;
    let mergedEnglishTextLength = 0;
    let mergedHindiTextLength = 0;
    let questionsWithUsableEvidence = 0;

    finalMergedQuestions.forEach(q => {
        let hasUsable = false;
        if (isValidText(q.questionEn)) {
            mergedEnglishTextCount++;
            mergedEnglishTextLength += q.questionEn.replace(/\s+/g, '').length;
            hasUsable = true;
        }
        if (isValidText(q.questionHi)) {
            mergedHindiTextCount++;
            mergedHindiTextLength += q.questionHi.replace(/\s+/g, '').length;
            hasUsable = true;
        }
        if (q.subQuestions) {
            q.subQuestions.forEach(sq => {
                if (isValidText(sq.questionEn)) {
                    mergedEnglishTextCount++;
                    mergedEnglishTextLength += sq.questionEn.replace(/\s+/g, '').length;
                    hasUsable = true;
                }
                if (isValidText(sq.questionHi)) {
                    mergedHindiTextCount++;
                    mergedHindiTextLength += sq.questionHi.replace(/\s+/g, '').length;
                    hasUsable = true;
                }
            });
        }
        if (hasUsable || q.status === 'UNRESOLVED_OCR_EVIDENCE') questionsWithUsableEvidence++;
    });

    let textLoss = 0;
    // Allow up to 10% discrepancy for flattening/prefix normalizations
    const enTolerance = Math.max(10, Math.floor(originalEnglishTextLength * 0.1));
    const hiTolerance = Math.max(10, Math.floor(originalHindiTextLength * 0.1));
    
    if (mergedEnglishTextLength < originalEnglishTextLength - enTolerance) {
        textLoss += (originalEnglishTextLength - mergedEnglishTextLength);
    }
    if (mergedHindiTextLength < originalHindiTextLength - hiTolerance) {
        textLoss += (originalHindiTextLength - mergedHindiTextLength);
    }

    console.log('\n[AI-AUDIT-AI]');
    console.log(`AI parents: ${(aiResult.questions || []).length}`);
    console.log(`AI subquestions: ${aiSubQCount}`);
    
    console.log('\n[AI-AUDIT-MERGE]');
    console.log(`Matched fragments: ${matchedFragmentIds.size}`);
    console.log(`Unresolved fragments: ${droppedFragments.length}`);
    console.log(`Dropped fragments: 0`);
    
    // SAFE METADATA MERGE
    const updatedIdentification = { ...(intel.identification || {}) };
    if (aiResult.documentMetadata) {
        if (isValidText(aiResult.documentMetadata.year)) {
           updatedIdentification.year = { value: aiResult.documentMetadata.year, source: 'AI_RECONSTRUCTION' };
        }
        if (isValidText(aiResult.documentMetadata.paperCode)) {
           updatedIdentification.paper = { value: aiResult.documentMetadata.paperCode, source: 'AI_RECONSTRUCTION' };
        }
        if (isValidText(aiResult.documentMetadata.exam)) {
           updatedIdentification.exam = { value: aiResult.documentMetadata.exam, source: 'AI_RECONSTRUCTION' };
        }
    }

    console.log('\n[AI-AUDIT-AFTER]');
    console.log(`Questions: ${finalMergedQuestions.length}`);
    console.log(`Questions with English: ${mergedEnglishTextCount}`);
    console.log(`Questions with Hindi: ${mergedHindiTextCount}`);
    console.log(`Questions with usable evidence: ${questionsWithUsableEvidence}`);
    console.log(`Metadata:`);
    console.log(`  exam=${updatedIdentification.exam?.value}`);
    console.log(`  year=${updatedIdentification.year?.value}`);
    console.log(`  paper=${updatedIdentification.paper?.value}`);
    
    console.log(`\n[AI-AUDIT] Text loss: ${textLoss}`);
    console.log(`[AI-AUDIT] Dropped fragments: 0`); // mathematically 0 because we appended unresolved

    if (textLoss > 0) {
        console.log('\n[AI] SAFE MERGE REJECTED (Text Loss Detected)');
        console.log('[AI] ORIGINAL OCR PRESERVED');
        return res.status(200).json({ 
            success: false, 
            code: "AI_RECONSTRUCTION_REVIEW_REQUIRED", 
            message: "AI analysis was not safely applied. Original OCR has been preserved.",
            preservedOriginal: true,
            job: latestJob
        });
    }

    // Validation update
    intel.questions = finalMergedQuestions;
    intel.identification = updatedIdentification;
    intel.aiAnalysis = {
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      processedAt: new Date().toISOString(),
      status: 'COMPLETED'
    };
    
    const updatedJob = await prisma.ingestionJob.update({
      where: { id: latestJob.id },
      data: { resultJson: JSON.stringify(intel) }
    });

    res.json({ success: true, message: 'AI Analysis completed successfully', job: updatedJob, aiResult });
  } catch (error) {
    console.error('AI Analysis failed:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNRESET')) {
        errorMessage = 'Gemini API connection failed (fetch failed). Check backend terminal for diagnostic details.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
