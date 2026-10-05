import express from 'express';
import { generateSimulatorPaper } from '../services/simulatorGenerator.js';
import pkg from '@prisma/client';
import { getPaperConfig } from '../../src/config/simulatorConfig.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

router.post('/ai/generate', async (req, res) => {
    try {
        const { paperCode, difficulty, count, marks, includeCurrentAffairs, useHistoricalPattern } = req.body;
        
        if (!paperCode) {
            return res.status(400).json({ error: 'paperCode is required' });
        }

        const config = getPaperConfig(paperCode);

        const paper = await generateSimulatorPaper({
            paperCode,
            config,
            difficulty: difficulty || 'Medium',
            count: count || config.questionCount,
            marks: marks || config.totalMarks,
            includeCurrentAffairs: !!includeCurrentAffairs,
            useHistoricalPattern: !!useHistoricalPattern
        });

        res.json(paper);
    } catch (e) {
        console.error('[SIMULATOR] Error generating AI paper:', e);
        res.status(500).json({ error: e.message || 'Failed to generate AI paper' });
    }
});

// Endpoint to fetch availability for all papers
router.get('/pyq/availability', async (req, res) => {
    try {
        const stats = await prisma.pyqQuestion.groupBy({
            by: ['paper_code'],
            _count: {
                id: true
            },
            where: {
                isPublished: true
            }
        });

        // Format to something useful for frontend
        const availability = stats.map(s => ({
            paper_code: s.paper_code,
            count: s._count.id
        }));

        res.json(availability);
    } catch (e) {
        console.error('[SIMULATOR] Error fetching availability:', e);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Endpoint to fetch available years for a given paper code
router.get('/pyq/years', async (req, res) => {
    try {
        const { paperCode } = req.query;
        let whereClause = {};
        if (paperCode) {
            whereClause.paper_code = paperCode;
        }

        const years = await prisma.pyqQuestion.findMany({
            where: whereClause,
            select: { year: true },
            distinct: ['year'],
            orderBy: { year: 'desc' }
        });

        res.json(years.map(y => y.year).filter(y => y != null));
    } catch (e) {
        console.error('[SIMULATOR] Error fetching years:', e);
        res.status(500).json({ error: 'Failed to fetch available years' });
    }
});

// Endpoint for PYQ based simulator
router.post('/pyq/generate', async (req, res) => {
    try {
        const { paperCode } = req.body;
        
        if (!paperCode) {
            return res.status(400).json({ error: 'paperCode is required' });
        }

        const pyqs = await prisma.pyqQuestion.findMany({
            where: { 
                paper_code: paperCode,
                isPublished: true
            }
        });

        if (!pyqs || pyqs.length === 0) {
            return res.status(404).json({ error: 'No published PYQs found for the given criteria.' });
        }

        const config = getPaperConfig(paperCode);
        const limit = config.questionCount || 20;

        // Shuffle all published questions for this paper and pick up to 20
        let selectedPyqs = pyqs.sort(() => 0.5 - Math.random()).slice(0, limit);

        const totalMarks = selectedPyqs.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
        
        let displayTitle = `Official PYQ Simulator - ${config.displayName}`;

        const paper = {
            id: `pyq-sim-${paperCode}-${Date.now()}`,
            code: paperCode,
            title: displayTitle,
            duration_minutes: config.durationMinutes,
            total_marks: totalMarks || config.totalMarks,
            instructions: config.instructions,
            questions: selectedPyqs.map((q, idx) => ({
                id: idx + 1,
                original_id: q.id,
                section: (parseInt(q.marks) === 10 || idx < 10) ? "A" : "B",
                marks: parseInt(q.marks) || 10,
                word_limit: parseInt(q.word_limit) || 150,
                text: q.question_en || "Missing Question Text",
                directive: q.directive || "Discuss",
                target_mins: parseInt(q.marks) === 15 ? 11 : 7,
                source: 'PYQ',
                model_hints: `Topic: ${q.topic_path || 'General'} | Year: ${q.year}`
            }))
        };

        res.json(paper);
    } catch (e) {
        console.error('[SIMULATOR] Error generating PYQ paper:', e);
        res.status(500).json({ error: e.message || 'Failed to generate PYQ paper' });
    }
});

export default router;
