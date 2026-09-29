import { MAINS_PAPERS } from '../../data/syllabusData';

/**
 * Normalizes backend subjects/topics data to match the expected MAINS_PAPERS schema.
 * It merges missing metadata (Hindi translations, marks, codes) from the static fallback data.
 * @param {Array} apiMatrix 
 */
export const normalizeSyllabusMatrix = (apiMatrix) => {
  if (!apiMatrix || apiMatrix.length === 0) return [];

  return apiMatrix.map((apiSubject) => {
    // Find matching static paper to merge metadata
    const staticPaper = MAINS_PAPERS.find(p => p.id === apiSubject.slug || p.slug === apiSubject.slug);

    return {
      id: apiSubject.id,
      code: staticPaper ? staticPaper.code : apiSubject.slug,
      title: apiSubject.name,
      title_hi: staticPaper ? staticPaper.title_hi : null,
      marks: staticPaper ? staticPaper.marks : null,
      duration_hours: staticPaper ? staticPaper.duration_hours : null,
      status: apiSubject.isActive ? "Live" : "Draft",
      status_label: apiSubject.isActive ? "Active & Verified" : "Draft",
      category: staticPaper ? staticPaper.category : "Unknown",
      description: apiSubject.description || (staticPaper ? staticPaper.description : ""),
      micro_topics: (apiSubject.topics || []).map((apiTopic) => {
        // Find matching static topic for metadata
        const staticTopic = staticPaper 
          ? staticPaper.micro_topics.find(t => t.id === apiTopic.slug || t.slug === apiTopic.slug)
          : null;

        return {
          id: apiTopic.id,
          code: staticTopic ? staticTopic.code : apiTopic.slug,
          name: apiTopic.name,
          name_hi: staticTopic ? staticTopic.name_hi : null,
          count_pyq: staticTopic ? staticTopic.count_pyq : 0,
        };
      })
    };
  });
};
