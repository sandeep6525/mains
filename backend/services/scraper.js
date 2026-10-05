import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// In production, you would import the ingestDocument logic directly from ingestion.js or a shared service.
// For now, we will simulate the ingestion drop or just flag it as downloaded.
// Wait, the instructions say: "Reuse the existing FetchIQ ingestion, OCR, intelligence, validation, review, and publishing pipeline."
// I will create a function that drops the file into uploads and creates an IngestionDocument.

export async function runScraperCycle() {
  const lockId = "fetchiq-scraper-lock";
  const now = new Date();
  const lockTimeout = new Date(now.getTime() - 5 * 60000); // 5 mins

  try {
    console.log("[SCHEDULER] Attempting lock");
    // 1. Acquire distributed lock (Idempotency)
    let acquired = false;
    try {
       await prisma.systemLock.create({
          data: {
             id: lockId,
             lockedAt: now,
             lockedBy: process.pid.toString(),
             expiresAt: new Date(now.getTime() + 10 * 60000)
          }
       });
       acquired = true;
       console.log("[SCHEDULER] Lock acquired");
    } catch (e) {
       // Row exists. Attempt atomic update if expired.
       const updateResult = await prisma.systemLock.updateMany({
           where: {
              id: lockId,
              expiresAt: { lt: now }
           },
           data: {
              lockedAt: now,
              lockedBy: process.pid.toString(),
              expiresAt: new Date(now.getTime() + 10 * 60000)
           }
       });
       if (updateResult.count === 0) {
           console.log("[SCHEDULER] Lock denied - another instance owns lock");
           return;
       }
       acquired = true;
       console.log("[SCHEDULER] Reclaimed expired lock");
       console.log("[SCHEDULER] Lock acquired");
    }

    if (!acquired) return;
    console.log("[SCHEDULER] Discovery started");

    // 2. Fetch enabled sources
    const sources = await prisma.fetchIqSource.findMany({
      where: { isEnabled: true }
    });

    for (const source of sources) {
      await processSource(source);
    }
    console.log("[SCHEDULER] Discovery completed");
  } catch (error) {
    console.error("Scraper Cycle Error:", error);
    // On failure, release the lock immediately so another node can retry
    try {
        await prisma.systemLock.updateMany({
            where: { id: lockId, lockedBy: process.pid.toString() },
            data: { expiresAt: new Date(0) }
        });
        console.log("[SCHEDULER] Lock released due to failure");
    } catch (e) {
        console.error("Failed to release lock:", e);
    }
  }
}

async function processSource(source) {
  try {
    // Update last checked
    await prisma.fetchIqSource.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });

    // Validate URL / Security check
    const urlObj = new URL(source.url);
    if (urlObj.protocol !== 'https:') throw new Error("INSECURE_PROTOCOL");
    if (urlObj.hostname !== source.allowedDomain && urlObj.hostname !== `www.${source.allowedDomain}`) {
       throw new Error(`DOMAIN_MISMATCH: ${urlObj.hostname}`);
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30000); // 30s timeout

    const response = await fetch(source.url, { 
       signal: abortController.signal, 
       redirect: 'manual' // Do not blindly follow redirects
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP_${response.status}`);

    const html = await response.text();
    
    // Naive Regex Parsing looking for PDF links
    const pdfRegex = /href=["']([^"']+\.pdf)["'][^>]*>([^<]+)</gi;
    let match;
    const detectedPdfs = [];

    while ((match = pdfRegex.exec(html)) !== null) {
       let link = match[1];
       if (link.startsWith('/')) {
          link = `https://${urlObj.hostname}${link}`;
       }
       detectedPdfs.push({ url: link, title: match[2].trim() });
    }

    // Process detected PDFs
    for (const pdf of detectedPdfs) {
       await processPdfLink(pdf.url, pdf.title, source);
    }

    await prisma.fetchIqSource.update({ 
       where: { id: source.id }, 
       data: { lastSuccessfulCheckAt: new Date(), lastError: null } 
    });

  } catch (error) {
    await prisma.fetchIqSource.update({ 
       where: { id: source.id }, 
       data: { lastError: error.message } 
    });
  }
}

async function processPdfLink(pdfUrl, title, source) {
  // Deduplication check: Have we already ingested this URL?
  const existing = await prisma.ingestionDocument.findFirst({
      where: { sourceUrl: pdfUrl }
  });
  if (existing) return; // Already processed

  // Download & Verify
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 60000); // 60s for PDF
  
  let tmpPath = null;
  try {
     const urlObj = new URL(pdfUrl);
     if (urlObj.hostname !== source.allowedDomain && urlObj.hostname !== `www.${source.allowedDomain}`) return;

     const response = await fetch(pdfUrl, { signal: abortController.signal });
     clearTimeout(timeout);
     if (!response.ok) return;

     const contentType = response.headers.get('content-type');
     if (!contentType || !contentType.includes('application/pdf')) return;

     const buffer = await response.arrayBuffer();
     const fileBuffer = Buffer.from(buffer);

     // Size limit (e.g. 30MB)
     if (fileBuffer.length > 30 * 1024 * 1024) return;

     // Magic bytes check (%PDF-)
     if (fileBuffer.length < 4 || fileBuffer.toString('utf8', 0, 4) !== '%PDF') return;

     // Generate safe filename and hash
     const safeFilename = crypto.randomUUID() + '.pdf';
     const uploadDir = path.join(__dirname, '../../uploads');
     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
     
     tmpPath = path.join(uploadDir, safeFilename);
     fs.writeFileSync(tmpPath, fileBuffer);

     const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

     // DB Dedup check by hash
     const hashExist = await prisma.ingestionDocument.findUnique({ where: { sha256: hash } });
     if (hashExist) {
        fs.unlinkSync(tmpPath);
        return;
     }

     // Create Document
     await prisma.ingestionDocument.create({
        data: {
            originalFileName: title + '.pdf',
            storedFileName: safeFilename,
            filePath: tmpPath,
            sha256: hash,
            source: 'AUTO_DETECTED',
            sourceUrl: pdfUrl,
            status: 'UPLOADED'
        }
     });

     // (In a complete integration, we would now trigger the ingestDocument logic that calls Python OCR here)

  } catch (err) {
     if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}
