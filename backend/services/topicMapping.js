import { MAINS_PAPERS } from '../../src/data/syllabusData.js';
import { getBasePaperCode } from '../../src/utils/paperRegistry.js';

export function proposeTopicMapping(questionText, paperCode) {
  // If paperCode is unknown or not provided, we return UNMAPPED
  if (!paperCode) {
    return { status: "UNMAPPED", reason: "Missing paper code" };
  }

  // Find the relevant paper in the static syllabus array
  const baseCode = getBasePaperCode(paperCode);
  const paper = MAINS_PAPERS.find(p => p.code === baseCode || p.code.includes(baseCode));
  if (!paper) {
    return { status: "UNMAPPED", reason: `Paper code ${paperCode} (Base: ${baseCode}) not found in syllabus definition` };
  }

  // Very basic deterministic keyword matching based on existing topic titles
  let bestMatch = null;
  let maxScore = 0;
  
  const textLower = (questionText || '').toLowerCase();
  
  if (!textLower) {
    return { status: "UNMAPPED", reason: "Question text is empty" };
  }

  for (const topic of paper.micro_topics) {
    const topicKeywords = topic.name.toLowerCase().split(/[\s,&()]+/);
    let score = 0;
    
    for (const kw of topicKeywords) {
      if (kw.length > 3 && textLower.includes(kw)) {
        score++;
      }
    }
    
    // Explicit boosts for known exact phrases
    if (textLower.includes(topic.name.toLowerCase())) {
       score += 10;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = topic;
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      status: "PROPOSED",
      proposedTopicId: bestMatch.id,
      proposedTopicTitle: bestMatch.name,
      confidence: maxScore > 5 ? 'HIGH' : (maxScore > 2 ? 'MEDIUM' : 'LOW'),
      reason: `Matched ${maxScore} heuristic signals with '${bestMatch.name}' in ${paperCode}`,
      candidates: paper.micro_topics.map(t => ({ id: t.id, title: t.name }))
    };
  }

  return { 
    status: "UNMAPPED", 
    reason: `No strong keyword match found within ${paperCode}`,
    candidates: paper.micro_topics.map(t => ({ id: t.id, title: t.name }))
  };
}

export function validateTopicMapping(paperCode, topicId, topicTitle) {
  if (!paperCode || !topicId || !topicTitle) return false;
  const baseCode = getBasePaperCode(paperCode);
  const paper = MAINS_PAPERS.find(p => p.code === baseCode || p.code.includes(baseCode));
  if (!paper || !paper.micro_topics) return false;
  return paper.micro_topics.some(t => t.id === topicId && t.name === topicTitle);
}
