import { mapFragmentsToQuestion } from './backend/services/directPdfAiAnalyzer.js';
import dotenv from 'dotenv';
dotenv.config();

const fragments = [
  { id: "frag_1", label: "1", text: "Write short notes on the following in about 150 words each:", english: "Write short notes on the following in about 150 words each:", hindi: "" },
  { id: "frag_2", label: "2", text: "10x5=50", english: "10x5=50", hindi: "" },
  { id: "frag_3", label: "3", text: "Structure and functions of parathyroid gland.", english: "Structure and functions of parathyroid gland.", hindi: "" },
  { id: "frag_4", label: "4", text: "Retrogressive metamorphosis in Herdmania.", english: "Retrogressive metamorphosis in Herdmania.", hindi: "" },
  { id: "frag_5", label: "5", text: "Locomotion in echinoderms.", english: "Locomotion in echinoderms.", hindi: "" },
  { id: "frag_6", label: "6", text: "Mechanism of parental care in reptiles.", english: "Mechanism of parental care in reptiles.", hindi: "" },
  { id: "frag_7", label: "7", text: "KVMS-P-ZOY 4", english: "KVMS-P-ZOY 4", hindi: "" }
];

async function runTest() {
  try {
    const parsed = await mapFragmentsToQuestion(null, 1, fragments);
    console.log(JSON.stringify(parsed, null, 2));
    
    // Zero-loss validation simulation
    let duplicateAssignments = 0;
    let unknownFragmentIds = 0;
    const allAssignedFragments = new Set();
    const mappedFragments = parsed.sourceFragmentIds || [];
    const metaFragments = (parsed.metadataFragments || []).map(m => m.fragmentId);
    const subQFragments = (parsed.subQuestions || []).flatMap(sq => sq.sourceFragmentIds || []);
    const instructionFragments = parsed.instructionFragmentIds || [];
    const questionFragments = parsed.questionFragmentIds || [];

    const questionUniqueFragments = new Set([...mappedFragments, ...metaFragments, ...subQFragments, ...instructionFragments, ...questionFragments]);

    questionUniqueFragments.forEach((fragId) => {
        if (allAssignedFragments.has(fragId)) {
            // Note: In real app, we check if it's meta only to avoid duplicate
        }
        allAssignedFragments.add(fragId);
        
        if (!fragments.find(f => f.id === fragId)) {
            unknownFragmentIds++;
        }
    });
    
    let unmappedFragments = 0;
    fragments.forEach(f => {
        if (!allAssignedFragments.has(f.id)) unmappedFragments++;
    });

    console.log('\n--- VALIDATION ---');
    console.log(`originalFragments: ${fragments.length}`);
    console.log(`mappedFragments: ${allAssignedFragments.size}`);
    console.log(`unmappedFragments: ${unmappedFragments}`);
    console.log(`unknownFragmentIds: ${unknownFragmentIds}`);
    
    if (unmappedFragments === 0 && unknownFragmentIds === 0) {
        console.log('STATUS: PASS');
    } else {
        console.log('STATUS: FAILED');
    }
  } catch(e) {
    console.error(e);
  }
}

runTest();
