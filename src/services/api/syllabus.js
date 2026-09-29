const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Fetches the syllabus matrix containing subjects and topics
 * @param {string} examSlug 
 */
export const fetchSyllabusMatrix = async (examSlug = 'upsc-cse-mains') => {
  try {
    // 1. Fetch Subjects
    const subjectsResponse = await fetch(`${API_BASE_URL}/public/exams/${examSlug}/subjects`);
    if (!subjectsResponse.ok) {
      throw new Error(`Failed to fetch subjects: ${subjectsResponse.statusText}`);
    }
    const subjectsData = await subjectsResponse.json();
    const subjects = subjectsData.data || [];

    // 2. Fetch Topics for each Subject concurrently
    const matrix = await Promise.all(
      subjects.map(async (subject) => {
        try {
          const topicsResponse = await fetch(`${API_BASE_URL}/public/exams/${examSlug}/subjects/${subject.slug}/topics`);
          if (!topicsResponse.ok) {
            return { ...subject, topics: [] }; // Fallback to empty topics if failed
          }
          const topicsData = await topicsResponse.json();
          return {
            ...subject,
            topics: topicsData.data || []
          };
        } catch (err) {
          console.error(`Error fetching topics for subject ${subject.slug}:`, err);
          return { ...subject, topics: [] };
        }
      })
    );

    return matrix;
  } catch (error) {
    console.error("Error in fetchSyllabusMatrix:", error);
    throw error;
  }
};
