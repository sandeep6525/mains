function processIntelligence(rawData, identification) {
  let instructions = '';
  const detectLanguage = (text) => {
      if (!text || text.trim().length === 0) return 'EMPTY';
      const dev = (text.match(/[\u0900-\u097F]/g) || []).length;
      const lat = (text.match(/[a-zA-Z]/g) || []).length;
      const devRatio = dev / text.length;
      const latRatio = lat / text.length;
      if (devRatio > 0.05 && latRatio > 0.1) return 'MIXED';
      if (devRatio > 0.05) return 'HINDI';
      if (latRatio > 0.1) return 'ENGLISH';
      return 'UNKNOWN';
  };

  const fragments = [];
  let fragId = 0;
  
  const rawQuestions = (rawData && Array.isArray(rawData.questions)) ? rawData.questions : [];
  
  rawQuestions.forEach((q, idx) => {
      const processField = (text, fieldName) => {
          if (!text || text.trim().length < 5) return;
          let cleanText = text.replace(/\(Answer in \d+ words\)/ig, '')
                     .replace(/\(उत्तर \d+ शब्दों में दीजिए\)/ig, '')
                     .replace(/\[P\.T\.O\./g, '')
                     .replace(/KVMS-G-GSA(?:\/35)?(?:\s+\d)?/g, '')
                     .trim();
          if (cleanText.includes('Time Allowed : Three Hours') || cleanText.includes('QUESTION PAPER SPECIFIC INSTRUCTIONS')) {
            instructions += cleanText + '\n'; return;
          }
          
          // Split fragments that contain explicit embedded question boundaries (e.g. Fujiwhara + Tundra)
          const parts = cleanText.split(/(?=\s*\b(?:[1-9]|1[0-9]|20)\b[\.\"\']\s*[\u0900-\u097Fa-zA-Z])/g);
          
          parts.forEach(part => {
              const p = part.trim();
              if (p.length < 2) return;
              
              let actualQNum = q.questionNumber || null;
              const match = p.match(/^([1-9]|1[0-9]|20)[\.\"\']\s*[\u0900-\u097Fa-zA-Z]/);
              if (match) {
                  actualQNum = parseInt(match[1]);
              }
              
              fragments.push({
                  fragmentId: 'frag_' + (fragId++),
                  sourceIndex: idx,
                  pageNumber: q.pageNumber || null,
                  sourceField: fieldName,
                  sourceQuestionNumber: actualQNum,
                  detectedLanguage: detectLanguage(p),
                  text: p,
                  textLength: p.length
              });
          });
      };
      processField(q.hindi || '', 'hindi');
      processField(q.english || '', 'english');
  });

  const questionStartPatternsEn = /^(which of the following|consider the following|with reference to|in the context of|who among|the following|what is|which one)/i;
  const questionStartPatternsHi = /^(निम्नलिखित में से|निम्नलिखित कथनों पर विचार|के संदर्भ में|किस|कौन|क्या)/i;
  
  fragments.forEach(f => {
      let isStart = false;
      if (f.detectedLanguage === 'ENGLISH' && questionStartPatternsEn.test(f.text)) isStart = true;
      if (f.detectedLanguage === 'HINDI' && questionStartPatternsHi.test(f.text)) isStart = true;
      if (/^[1-9][0-9]?\.\s+/.test(f.text)) isStart = true;
      
      if (isStart) f.fragmentType = 'QUESTION_START';
      else if (/^(I|II|III|IV)\.\s/.test(f.text) || /^[a-d]\)\s/.test(f.text)) f.fragmentType = 'STATEMENT_OR_OPTION';
      else f.fragmentType = 'UNCERTAIN';
  });

  const candidates = [];
  const uncertainFragments = [];
  let candidateIdCounter = 1;

  // Sequential pairing instead of grouping globally
  const unmatchedHiStarts = [];
  const unmatchedEnStarts = [];
  
  fragments.forEach(f => {
      if (f.fragmentType === 'QUESTION_START') {
          if (f.detectedLanguage === 'HINDI') unmatchedHiStarts.push(f);
          if (f.detectedLanguage === 'ENGLISH') unmatchedEnStarts.push(f);
      } else {
          f.candidateQuestionId = null;
          uncertainFragments.push(f);
      }
  });
  
  // Pair them up by sequential order and matching questionNumber
  while (unmatchedHiStarts.length > 0 && unmatchedEnStarts.length > 0) {
      let hi = unmatchedHiStarts.shift();
      let enIdx = unmatchedEnStarts.findIndex(e => e.sourceQuestionNumber === hi.sourceQuestionNumber);
      if (enIdx !== -1) {
          let en = unmatchedEnStarts.splice(enIdx, 1)[0];
          en.candidateQuestionId = 'cand_' + candidateIdCounter;
          hi.candidateQuestionId = 'cand_' + candidateIdCounter;
          
          let marks = null;
          let marksMatch = en.text.match(/\b(10|15|20)\b(?!\s*words)/i) || hi.text.match(/\b(10|15|20)\b(?!\s*words)/i);
          if (marksMatch) marks = parseInt(marksMatch[1]);
          
          candidates.push({
              questionId: 'cand_' + candidateIdCounter,
              questionNumber: hi.sourceQuestionNumber,
              questionEn: en.text,
              questionHi: hi.text,
              fragments: [en, hi],
              bilingualStatus: 'CONFIDENT_PAIR',
              reconstructionConfidence: 'HIGH',
              sourceEvidence: `Paired ${en.fragmentId} and ${hi.fragmentId} based on sequential QUESTION_START matching`,
              adminReviewRequired: false,
              marks: marks
          });
          candidateIdCounter++;
      } else {
          hi.candidateQuestionId = null;
          uncertainFragments.push(hi);
      }
  }
  
  unmatchedHiStarts.forEach(f => { f.candidateQuestionId = null; uncertainFragments.push(f); });
  unmatchedEnStarts.forEach(f => { f.candidateQuestionId = null; uncertainFragments.push(f); });

  const finalQuestions = [];
  const errors = [];
  const warnings = [];

  candidates.forEach(c => finalQuestions.push(c));
  
  // Sort uncertain fragments by sourceIndex to respect reading order
  uncertainFragments.sort((a, b) => a.sourceIndex - b.sourceIndex);

  uncertainFragments.forEach(f => {
      let candidateQuestions = finalQuestions.filter(q => q.questionNumber === f.sourceQuestionNumber);
      let merged = false;
      
      if (candidateQuestions.length > 0) {
          let existingQ = candidateQuestions[candidateQuestions.length - 1];
          let maxIndex = existingQ.fragments && existingQ.fragments.length > 0 
              ? Math.max(...existingQ.fragments.map(x => x.sourceIndex)) 
              : f.sourceIndex;
              
          // Sequential reading-order rule: Must be physically close in OCR output to merge
          if (Math.abs(f.sourceIndex - maxIndex) <= 3) {
              existingQ.fragments.push(f);
              
              if (f.sourceField === 'english') {
                  existingQ.questionEn = [existingQ.questionEn, f.text].filter(Boolean).join('\n');
              } else {
                  existingQ.questionHi = [existingQ.questionHi, f.text].filter(Boolean).join('\n');
              }
              
              if (!existingQ.marks) {
                  let m = f.text.match(/\b(10|15|20)\b(?!\s*words)/i);
                  if (m) existingQ.marks = parseInt(m[1]);
              }
              merged = true;
          }
      }
      
      if (!merged) {
          let enText = f.sourceField === 'english' ? f.text : null;
          let hiText = f.sourceField === 'hindi' ? f.text : null;
          let marksMatch = f.text.match(/\b(10|15|20)\b(?!\s*words)/i);
          let marks = marksMatch ? parseInt(marksMatch[1]) : null;
          
          let finalNum = f.sourceQuestionNumber;
          let explicitMatch = f.text.match(/^\b([1-9]|1[0-9]|20)\b[\.\"\']/);
          if (!explicitMatch && candidateQuestions.length > 0) {
              finalNum = null; // Strip false OCR number from orphan
          }
          
          finalQuestions.push({
              questionId: f.fragmentId,
              questionNumber: finalNum,
              questionEn: enText,
              questionHi: hiText,
              fragments: [f],
              bilingualStatus: 'UNCERTAIN',
              reconstructionConfidence: 'LOW',
              sourceEvidence: `Isolated uncertain fragment (index ${f.sourceIndex})`,
              adminReviewRequired: true,
              marks: marks
          });
      }

      warnings.push(`UNCERTAIN FRAGMENT IN QUESTION ${f.sourceQuestionNumber}`);
      if (f.sourceField === 'english') warnings.push(`UNPAIRED ENGLISH IN QUESTION ${f.sourceQuestionNumber}`);
      if (f.sourceField === 'hindi') warnings.push(`UNPAIRED HINDI IN QUESTION ${f.sourceQuestionNumber}`);
      if (f.detectedLanguage === 'MIXED') warnings.push(`LANGUAGE_MISMATCH IN QUESTION ${f.sourceQuestionNumber}`);
  });

  // --- CONSERVATIVE DETERMINISTIC LANGUAGE SEPARATION LAYER ---
  const separateLanguages = (text) => {
      if (!text) return { hi: [], en: [] };
      const sentences = text.split(/(?<=[।\.?!])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 0);
      let hi = [];
      let en = [];
      sentences.forEach(s => {
          const devCount = (s.match(/[\u0900-\u097F]/g) || []).length;
          const latCount = (s.match(/[a-zA-Z]/g) || []).length;
          if (devCount > 0) hi.push(s);
          else if (latCount > 0) en.push(s);
          // If a fragment is entirely numeric/symbols (like "10 10 10"), it drops out naturally.
      });
      return { hi, en };
  };

  finalQuestions.forEach(q => {
      let combinedText = [q.questionHi, q.questionEn].filter(Boolean).join('\n');
      let extracted = separateLanguages(combinedText);
      
      q.questionHi = extracted.hi.length > 0 ? extracted.hi.join(' ') : null;
      q.questionEn = extracted.en.length > 0 ? extracted.en.join(' ') : null;
  });

  const expectedCount = identification?.questionCount?.value || 0;
  const uniqueQNums = [...new Set(finalQuestions.map(q => q.questionNumber))];
  if (uniqueQNums.length < expectedCount) {
      for (let i = 1; i <= expectedCount; i++) {
          if (!uniqueQNums.includes(i)) errors.push(`MISSING QUESTION ${i}`);
      }
  }

  const qNumCounts = {};
  finalQuestions.forEach(q => {
      if (q.questionNumber !== null && q.questionNumber !== undefined && q.questionNumber !== '' && q.questionNumber !== 'null') {
          qNumCounts[q.questionNumber] = (qNumCounts[q.questionNumber] || 0) + 1;
      }
  });
  Object.entries(qNumCounts).forEach(([num, count]) => {
      if (count > 1) errors.push(`DUPLICATE QUESTION NUMBER ${num} FOUND`);
  });

  return {
    document: {
      fileName: rawData.originalFile,
      source: rawData.source,
      sha256: rawData.documentHash,
      instructions: instructions.trim()
    },
    identification,
    questions: finalQuestions,
    validation: {
      status: errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'REVIEW_REQUIRED' : 'PASS'),
      errors,
      warnings
    }
  };
}


export { processIntelligence };
