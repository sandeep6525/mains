import fs from 'fs';
import path from 'path';

// Using simple regex or dynamic import to read the data
async function validateData() {
  const problems = [];
  try {
    const pyqData = await import('./src/data/pyqData.js');
    const fullPaper = await import('./src/data/fullPaperData.js');
    const syllabus = await import('./src/data/syllabusData.js');
    const ca = await import('./src/data/currentAffairsData.js');
    const optionals = await import('./src/data/optionalsData.js');
    const tenYears = await import('./src/data/tenYearsPyqData.js');

    const checkDuplicates = (array, name) => {
      if(!array) return;
      const ids = new Set();
      array.forEach(item => {
        if (!item.id) problems.push(`${name}: Missing ID`);
        else if (ids.has(item.id)) problems.push(`${name}: Duplicate ID ${item.id}`);
        ids.add(item.id);
      });
    };

    if(pyqData.PYQ_QUESTIONS) checkDuplicates(pyqData.PYQ_QUESTIONS, 'PYQ_QUESTIONS');
    if(fullPaper.FULL_MOCK_PAPERS) checkDuplicates(fullPaper.FULL_MOCK_PAPERS, 'FULL_MOCK_PAPERS');
    if(syllabus.MAINS_PAPERS) checkDuplicates(syllabus.MAINS_PAPERS, 'MAINS_PAPERS');
    if(ca.CURRENT_AFFAIRS_MAINS_MATRIX) checkDuplicates(ca.CURRENT_AFFAIRS_MAINS_MATRIX, 'CURRENT_AFFAIRS_MAINS_MATRIX');
    if(optionals.OPTIONAL_SUBJECTS) checkDuplicates(optionals.OPTIONAL_SUBJECTS, 'OPTIONAL_SUBJECTS');
    if(tenYears.TEN_YEARS_PYQ_DATA) checkDuplicates(tenYears.TEN_YEARS_PYQ_DATA, 'TEN_YEARS_PYQ_DATA');

  } catch(e) {
    problems.push(`Data Load Error: ${e.message}`);
  }
  
  console.log(JSON.stringify({ problems }, null, 2));
}

validateData();
