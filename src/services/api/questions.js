import fetchClient from './client';
import { PYQ_QUESTIONS } from '../../data/pyqData';

/**
 * Fetch Questions from the existing backend.
 * Includes a graceful fallback to static data if the backend is down.
 */
export const getQuestions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/questions?${queryParams}` : '/questions';
    
    const response = await fetchClient(endpoint);
    
    if (response && response.success && response.data) {
      // Map Backend fields to Frontend fields
      return response.data.map(q => ({
        id: q.id || `pyq-${q.sourceYear}`,
        paper_id: q.examId || 'unknown',
        paper_code: q.sourceName || 'Unknown Paper',
        topic_id: q.topicId || 'unknown-topic',
        topic_title: 'Mapped from Backend',
        year: q.sourceYear || new Date().getFullYear(),
        marks: q.provenance?.marks || 10,
        word_limit: q.provenance?.word_limit || 150,
        time_limit_mins: q.provenance?.time_limit_mins || 7,
        directive: q.provenance?.directive || 'Discuss',
        directive_tip: q.provenance?.directive_tip || '',
        question_en: q.questionText || '',
        question_hi: q.provenance?.question_hi || '',
        model_framework: q.provenance?.model_framework || {},
        sample_submission: q.provenance?.sample_submission || null
      }));
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('Backend API unavailable. Falling back to static PYQ data.', error);
    // Development Fallback: Filter static data based on query filters if necessary
    let staticData = [...PYQ_QUESTIONS];
    if (filters.year) staticData = staticData.filter(q => q.year.toString() === filters.year.toString());
    if (filters.paper) staticData = staticData.filter(q => q.paper_code === filters.paper);
    return staticData;
  }
};
