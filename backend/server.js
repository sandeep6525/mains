import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import ingestionRoutes from './routes/ingestion.js';
import simulatorRoutes from './routes/simulator.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

import directAiIngestionRoutes from './routes/directAiIngestion.js';

// Routes
app.use('/api/fetchiq/auth', authRoutes);
app.use('/api/fetchiq/ingestion', (req, res, next) => {
  console.log(`[FETCHIQ HTTP] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/fetchiq/ingestion', ingestionRoutes);
app.use('/api/fetchiq/v2', directAiIngestionRoutes);
app.use('/api/fetchiq/simulator', simulatorRoutes);

// Dashboard stats endpoint
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

import { authenticateToken } from './routes/auth.js';

app.get('/api/fetchiq/dashboard', authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.ingestionDocument.findMany({
      select: {
        status: true,
        jobs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: { status: true }
        }
      }
    });

    const total = documents.length;
    let processing = 0;
    let failed = 0;
    let completed = 0;

    documents.forEach(doc => {
      const jobStatus = doc.jobs?.[0]?.status;
      const effectiveStatus = jobStatus || doc.status;
      
      if (effectiveStatus === 'RUNNING' || effectiveStatus === 'PROCESSING' || effectiveStatus === 'DOWNLOAD_PENDING') {
        processing++;
      } else if (effectiveStatus === 'READY_FOR_REVIEW' || effectiveStatus === 'SUCCESS' || effectiveStatus === 'PUBLISHED' || effectiveStatus === 'COMPLETED') {
        completed++;
      } else if (effectiveStatus === 'FAILED') {
        failed++;
      }
    });

    const recentDocsRaw = await prisma.ingestionDocument.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { jobs: { orderBy: { startedAt: 'desc' }, take: 1 } }
    });

    // Map 'jobs' to 'IngestionJob' for frontend compatibility
    const recentDocuments = recentDocsRaw.map(doc => ({
      ...doc,
      IngestionJob: doc.jobs
    }));

    res.json({ total, processing, failed, completed, recentDocuments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

import { runScraperCycle } from './services/scraper.js';

const FETCHIQ_STALE_JOB_TIMEOUT_MINUTES = 30;

async function recoverStaleJobs() {
  const staleThreshold = new Date(Date.now() - FETCHIQ_STALE_JOB_TIMEOUT_MINUTES * 60 * 1000);
  
  try {
    const staleJobs = await prisma.ingestionJob.findMany({
      where: {
        status: 'RUNNING',
        startedAt: { lte: staleThreshold }
      }
    });

    if (staleJobs.length > 0) {
      console.log(`[RECOVERY] Found ${staleJobs.length} stale RUNNING jobs older than ${FETCHIQ_STALE_JOB_TIMEOUT_MINUTES} minutes.`);
      for (const job of staleJobs) {
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            errorMessage: 'STALE_RUNNING_JOB_RECOVERED'
          }
        });
        
        // Also update the document status if it's currently PROCESSING
        await prisma.ingestionDocument.updateMany({
          where: { id: job.documentId, status: 'PROCESSING' },
          data: { status: 'FAILED' }
        });
      }
      console.log('[RECOVERY] Stale jobs recovered successfully.');
    }
  } catch (error) {
    console.error('[RECOVERY] Failed to recover stale jobs:', error);
  }
}

// Run recovery on startup
recoverStaleJobs();

app.listen(port, async () => {
  try {
    await prisma.$connect();
    console.log('\n==================================================');
    console.log('FETCHIQ BACKEND');
    console.log('==================================================');
    console.log('[SERVER] Starting FetchIQ API');
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[SERVER] API: http://localhost:${port}`);
    console.log(`[SERVER] Auto Discovery: ${process.env.ENABLE_SCRAPER ? 'ENABLED' : 'DISABLED'}`);
    const path = await import('path');
    console.log(`[SERVER] Upload directory: ${path.join(process.cwd(), 'uploads')}`);
    console.log('[SERVER] Database: connected');
    console.log('==================================================\n');
  } catch(e) {
    console.error('\n[SERVER ERROR] Database connection failed');
    console.error(`[SERVER ERROR] ${e.message}\n`);
  }
  
  // Phase 4: Native Scheduler via setInterval (Idempotent via DB lock)
  // Runs every 1 hour (3600000 ms)
  setInterval(() => {
    runScraperCycle();
  }, 3600000);
});
