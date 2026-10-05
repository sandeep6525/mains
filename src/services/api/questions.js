import fetchClient from './client';
import { PYQ_QUESTIONS } from '../../data/pyqData';
import { normalizePaperCode } from '../../utils/paperRegistry';

/**
 * Fetch Questions from the existing backend.
 * Includes a graceful fallback to static data if the backend is down.
 */
export const getQuestions = async (filters = {}) => {
  try {
    // 1. Fetch from FetchIQ SQLite Database
    let backendData = [];
    try {
       const res = await fetch('http://localhost:3000/api/fetchiq/ingestion/pyqs');
       if (res.ok) {
           backendData = await res.json();
       }
    } catch (e) {
       console.warn("Backend API unavailable", e);
    }
    
    // 2. Map Backend Data to Frontend Schema

    const dedupedBackendData = [];
    backendData.forEach(q => {
        const pcode = normalizePaperCode(q.paper_code);
        if (pcode === 'UNSUPPORTED_PAPER_CODE' || pcode === 'AMBIGUOUS_OPTIONAL_PAPER_PART') {
            console.error(`[FetchIQ-Integration] Excluded invalid published paper_code "${q.paper_code}" for question ${q.id}`);
            return;
        }
        const y = parseInt(q.year);
        const qnum = parseInt(q.question_number);
        
        const existingIdx = dedupedBackendData.findIndex(bq => 
            bq.year === y && bq.paper_code === pcode && bq.question_number === qnum
        );
        
        let mf = {};
        if (q.model_framework) {
            try { mf = typeof q.model_framework === 'string' ? JSON.parse(q.model_framework) : q.model_framework; } catch(e) {}
        }

        const mapped = {
            id: q.id,
            paper_id: q.paper_id,
            paper_code: pcode,
            topic_id: q.topic_id,
            topic_title: q.topic_title,
            year: y,
            marks: q.marks || 10,
            word_limit: q.word_limit || 150,
            time_limit_mins: q.time_limit_mins || 7,
            directive: q.directive || '',
            directive_tip: q.directive_tip || '',
            question_en: q.question_en || '',
            question_hi: q.question_hi || '',
            model_framework: mf,
            sample_submission: null,
            question_number: qnum
        };

        if (existingIdx >= 0) {
            const existing = dedupedBackendData[existingIdx];
            dedupedBackendData[existingIdx] = {
                ...existing,
                ...mapped,
                question_en: mapped.question_en || existing.question_en,
                question_hi: mapped.question_hi || existing.question_hi,
                model_framework: Object.keys(mapped.model_framework || {}).length > 0 ? mapped.model_framework : existing.model_framework,
                directive: mapped.directive || existing.directive,
                directive_tip: mapped.directive_tip || existing.directive_tip,
                topic_id: mapped.topic_id || existing.topic_id,
                topic_title: (mapped.topic_title && mapped.topic_title !== 'TOPIC_MAPPING_PENDING') ? mapped.topic_title : existing.topic_title,
                marks: mapped.marks || existing.marks
            };
        } else {
            dedupedBackendData.push(mapped);
        }
    });

    // 3. Fallback / Merge with Static Data
    let staticData = [...PYQ_QUESTIONS];
    
    // Merge: Backend overrides static
    const combined = [...dedupedBackendData];
    staticData.forEach(sq => {
        let spcode = normalizePaperCode(sq.paper_code);
        if (spcode === 'AMBIGUOUS_OPTIONAL_PAPER_PART') {
            spcode = normalizePaperCode(sq.paper_code + '-P1');
        }
        
        if (spcode === 'UNSUPPORTED_PAPER_CODE' || spcode === 'AMBIGUOUS_OPTIONAL_PAPER_PART') {
            return;
        }
        
        const staticQNum = sq.question_number || parseInt(sq.id.split('-').pop(), 10) || 1;
        
        if (!combined.find(bq => bq.year === parseInt(sq.year) && bq.paper_code === spcode && bq.question_number === staticQNum)) {
            sq.paper_code = spcode;
            sq.question_number = staticQNum;
            combined.push(sq);
        }
    });

    let result = combined;

    // Apply filters
    if (filters.year) result = result.filter(q => q.year.toString() === filters.year.toString());
    if (filters.paper) result = result.filter(q => q.paper_code === filters.paper);
    
    return result;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return PYQ_QUESTIONS;
  }
};
