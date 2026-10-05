import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export async function generateSimulatorPaper({
    paperCode,
    config,
    difficulty,
    count,
    marks,
    includeCurrentAffairs,
    useHistoricalPattern
}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Validate inputs
    const validCount = Math.min(Math.max(1, parseInt(count) || 20), 30);
    
    // Distribution logic (roughly 10M vs 15M based on typical UPSC)
    const tenMarkers = Math.ceil(validCount / 2);
    const fifteenMarkers = validCount - tenMarkers;

    const prompt = `You are an expert UPSC examiner and AI agent.
Generate a structured simulated question paper for UPSC Mains.

Requirements:
- Subject/Paper: ${config.displayName}
- Paper Code: ${paperCode}
- Difficulty: ${difficulty}
- Total Questions: ${validCount} (${tenMarkers} of 10 Marks/150 words, ${fifteenMarkers} of 15 Marks/250 words)
- Include Current Affairs: ${includeCurrentAffairs}
- Use Historical Pattern: ${useHistoricalPattern}

For each question, provide:
1. "id": A sequential number (1 to ${validCount})
2. "section": "A" (for 10M) or "B" (for 15M)
3. "marks": The marks for the question (either 10 or 15)
4. "word_limit": The word limit (150 for 10M, 250 for 15M)
5. "text": The complete question statement in English.
6. "directive": The primary directive used (e.g., Discuss, Analyze, Critically Evaluate).
7. "target_mins": Target time to answer (7 for 10M, 11 for 15M).

Generate the response ONLY as a valid JSON array of objects.
Do NOT wrap it in markdown block quotes.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
                temperature: difficulty === 'Hard' ? 0.7 : 0.5,
                responseMimeType: "application/json"
            }
        });
        
        const responseText = response.text || '';
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
        }
        
        let questions = JSON.parse(jsonStr);
        if (!Array.isArray(questions)) {
            if (questions.questions) questions = questions.questions;
            else questions = [questions];
        }

        // Add additional required simulator fields
        questions = questions.map((q, idx) => ({
            id: q.id || (idx + 1),
            section: q.section || (idx < tenMarkers ? "A" : "B"),
            marks: q.marks || (idx < tenMarkers ? 10 : 15),
            word_limit: q.word_limit || (idx < tenMarkers ? 150 : 250),
            text: q.text || "Question text generation failed.",
            directive: q.directive || "Discuss",
            target_mins: q.target_mins || (idx < tenMarkers ? 7 : 11),
            source: 'AI_GENERATED',
            model_hints: `Focus on: 1. Core definition/context. 2. Addressing the specific directive (${q.directive || 'Discuss'}). 3. Structured arguments (pro/con or multi-dimensional). 4. Conclusion with relevant current affair/SDG.`
        }));

        const totalGeneratedMarks = questions.reduce((sum, q) => sum + parseInt(q.marks), 0);
        
        return {
            id: `ai-sim-${Date.now()}`,
            code: paperCode,
            title: `AI Generated Practice Paper - ${config.displayName} (${difficulty})`,
            duration_minutes: config.durationMinutes,
            total_marks: totalGeneratedMarks,
            instructions: config.instructions,
            questions: questions
        };
    } catch (e) {
        console.error('AI Generation Error:', e);
        throw new Error('Failed to generate AI paper: ' + e.message);
    }
}
