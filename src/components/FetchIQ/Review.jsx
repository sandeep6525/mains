import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { CheckCircle2, CheckCircle, Sparkles, XCircle, AlertTriangle, ArrowLeft, Send, Search, BookOpen, Layers, Edit3, Save, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { getCanonicalPaperChoices, normalizePaperCode, getBasePaperCode } from '../../utils/paperRegistry';
import './FetchIQ.css';

const flattenQuestions = (qs) => {
    return qs.map(q => {
        if (!q.subQuestions || q.subQuestions.length === 0) return { ...q, subQuestions: [] };
        
        let flatEn = q.questionEn || '';
        let flatHi = q.questionHi || '';
        
        q.subQuestions.forEach(sq => {
             if (sq.questionEn && sq.questionEn.trim()) {
                  const prefix = sq.questionEn.trim().match(/^\([a-z]\)/i) ? '' : (sq.label ? `(${sq.label}) ` : '');
                  flatEn = flatEn + (flatEn ? '\n' : '') + prefix + sq.questionEn.trim();
             }
             if (sq.questionHi && sq.questionHi.trim()) {
                  const prefix = sq.questionHi.trim().match(/^\([a-z]\)/i) ? '' : (sq.label ? `(${sq.label}) ` : '');
                  flatHi = flatHi + (flatHi ? '\n' : '') + prefix + sq.questionHi.trim();
             }
        });
        
        return {
            ...q,
            questionEn: flatEn || null,
            questionHi: flatHi || null,
            subQuestions: []
        };
    });
};

const Review = () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  
  const navigate = (path) => {
    window.location.href = path;
  };

  const [doc, setDoc] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [proposals, setProposals] = useState({});
  const [fetchingProposals, setFetchingProposals] = useState({});
  const [blueprintProposals, setBlueprintProposals] = useState({});
  const [fetchingBlueprints, setFetchingBlueprints] = useState({});
  const [approvingBlueprints, setApprovingBlueprints] = useState({});

  const [unpublishConfirm, setUnpublishConfirm] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [unpublishedQuestions, setUnpublishedQuestions] = useState({});
  const [publishedApiQuestions, setPublishedApiQuestions] = useState({});

  useEffect(() => {
    if (doc?.status === 'PUBLISHED') {
       fetch('http://localhost:3000/api/fetchiq/ingestion/pyqs')
         .then(res => res.json())
         .then(data => {
            const map = {};
            data.forEach(q => map[q.id] = true);
            setPublishedApiQuestions(map);
         })
         .catch(err => console.error("Failed to fetch published Pyqs", err));
    }
  }, [doc]);

  const fetchProposal = async (idx, questionText, paperCode) => {
    if (!questionText || !paperCode) return;
    setFetchingProposals(prev => ({ ...prev, [idx]: true }));
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch('http://localhost:3000/api/fetchiq/ingestion/topic-proposal', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ questionText, paperCode })
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(prev => ({ ...prev, [idx]: data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingProposals(prev => ({ ...prev, [idx]: false }));
    }
  };

  const fetchBlueprintProposal = async (idx) => {
    setFetchingBlueprints(prev => ({ ...prev, [idx]: true }));
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}/blueprint-proposal`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ questionIndex: idx })
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprintProposals(prev => ({ ...prev, [idx]: data }));
      } else {
        const errData = await res.json();
        setBlueprintProposals(prev => ({ ...prev, [idx]: { status: 'ERROR', reason: errData.error || 'Failed to fetch' } }));
      }
    } catch (err) {
      setBlueprintProposals(prev => ({ ...prev, [idx]: { status: 'ERROR', reason: err.message } }));
    } finally {
      setFetchingBlueprints(prev => ({ ...prev, [idx]: false }));
    }
  };

  const approveBlueprint = async (idx) => {
    const proposal = blueprintProposals[idx];
    if (!proposal || proposal.status !== 'PROPOSED') return;

    setApprovingBlueprints(prev => ({ ...prev, [idx]: true }));
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}/blueprint-approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ questionIndex: idx, blueprint: proposal.proposal })
      });
      if (res.ok) {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, blueprint_status: 'APPROVED', directive: proposal.proposal.directive, directive_tip: proposal.proposal.directive_tip, model_framework: proposal.proposal.model_framework } : q));
        setBlueprintProposals(prev => {
          const newProposals = { ...prev };
          delete newProposals[idx];
          return newProposals;
        });
      }
    } catch (err) {
      console.error('Failed to approve blueprint:', err);
    } finally {
      setApprovingBlueprints(prev => ({ ...prev, [idx]: false }));
    }
  };

  const acceptMapping = async (idx) => {
    const proposal = proposals[idx];
    if (!proposal || proposal.status !== 'PROPOSED') return;
    
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}/topic-mapping`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
           questionIndex: idx,
           topicId: proposal.proposedTopicId,
           topicTitle: proposal.proposedTopicTitle,
           paperCode: intel.identification?.paper?.value,
           proposalReason: proposal.reason
        })
      });
      
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.error || 'Failed to accept mapping');
      }
      
      const { job } = await res.json();
      const rawIntel = JSON.parse(job.resultJson);
      rawIntel.questions = flattenQuestions(rawIntel.questions || []);
      setIntel(rawIntel); // Refresh UI
    } catch (err) {
      alert('Error accepting mapping: ' + err.message);
    }
  };

  useEffect(() => {
    console.log(`[FETCHIQ REVIEW] Loading document=${id}`);
    const fetchDoc = async () => {
      try {
        const token = localStorage.getItem('fetchIqToken');
        const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`[FETCHIQ REVIEW] API status=${res.status}`);
        if (!res.ok) throw new Error('Failed to fetch document');
        const data = await res.json();
        setDoc(data);

        if (data.IngestionJob && data.IngestionJob.length > 0) {
          const job = data.IngestionJob[0];
          if (job.resultJson) {
            try {
              const rawIntel = JSON.parse(job.resultJson);
              
              // Normalize the intel object to prevent missing field errors
              const safeIntel = {
                ...rawIntel,
                identification: rawIntel.identification || {},
                questions: flattenQuestions(rawIntel.questions || []),
                instructions: rawIntel.instructions || [],
                fragments: rawIntel.fragments || [],
                validation: rawIntel.validation || { status: 'UNKNOWN', errors: [], warnings: [] }
              };
              
              safeIntel.validation.errors = safeIntel.validation.errors || [];
              safeIntel.validation.warnings = safeIntel.validation.warnings || [];

              console.log(`[FETCHIQ REVIEW] questions=${safeIntel.questions.length}`);
              console.log(`[FETCHIQ REVIEW] instructions=${safeIntel.instructions.length}`);
              console.log(`[FETCHIQ REVIEW] fragments=${safeIntel.fragments.length}`);
              console.log(`[FETCHIQ REVIEW] identification present=${!!rawIntel.identification}`);

              setIntel(safeIntel);
            } catch (parseErr) {
              console.error('[FETCHIQ REVIEW ERROR]', parseErr.message);
            }
          }
        }
      } catch (err) {
        console.error('[FETCHIQ REVIEW ERROR]', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const runValidation = (currentIntel) => {
    const errors = [];
    const warnings = [];
    const questions = currentIntel?.questions || [];
    const identification = currentIntel?.identification || {};

    if (!identification?.year?.value) errors.push('MISSING YEAR METADATA');
    if (!identification?.paper?.value) errors.push('MISSING PAPER METADATA');

    const expectedCount = parseInt(identification?.questionCount?.value) || 0;
    const uniqueQNums = [...new Set(questions.map(q => q?.questionNumber).filter(n => n !== null && n !== undefined && n !== 'null' && n !== '').map(n => parseInt(n)).filter(n => !isNaN(n)))];

    if (uniqueQNums.length < expectedCount && expectedCount > 0) {
       for (let i = 1; i <= expectedCount; i++) {
          if (!uniqueQNums.includes(i)) errors.push(`MISSING QUESTION ${i}`);
       }
    }

    const questionIdentifiers = new Set();
    let usableQuestionCount = 0;

    questions.forEach((q) => {
       if (q.reviewStatus === 'REMOVED') {
           return; // Skip all validations for explicitly removed questions
       }

       if (q.status === 'UNRESOLVED_OCR_EVIDENCE') {
           errors.push(`UNRESOLVED OCR EVIDENCE REQUIRES REVIEW`);
           return;
       }

       const isNullOrEmpty = q?.questionNumber === null || q?.questionNumber === undefined || q?.questionNumber === 'null' || q?.questionNumber === '';
       if (isNullOrEmpty) return; // Skip question-level validation for detached fragments
       
       usableQuestionCount++;
       const identifier = `${q.questionNumber}`;
       if (questionIdentifiers.has(identifier)) {
           errors.push(`DUPLICATE QUESTION NUMBER: ${identifier}`);
       }
       questionIdentifiers.add(identifier);

       const hasSubQuestions = q.subQuestions && q.subQuestions.length > 0;
       const hasParentText = q.questionEn || q.questionHi;
       
       if (!hasParentText && !hasSubQuestions) {
           errors.push(`EMPTY QUESTION AT NUMBER ${identifier}`);
       }

       if (hasSubQuestions) {
           q.subQuestions.forEach((sub, subIdx) => {
               const subIdentifier = `${identifier}${sub.label || `_sub${subIdx}`}`;
               if (!sub.questionEn && !sub.questionHi) {
                   errors.push(`EMPTY SUBQUESTION TEXT AT ${subIdentifier}`);
               } else if (!sub.questionEn || !sub.questionHi) {
                   warnings.push(`MISSING TRANSLATION PAIR FOR SUBQUESTION ${subIdentifier}`);
               }
           });
       } else {
           if (!q.questionEn || !q.questionHi) warnings.push(`MISSING TRANSLATION PAIR FOR QUESTION ${identifier}`);
       }

       if (!q?.marks && (!hasSubQuestions || !q.subQuestions.some(s => s.marks))) {
           warnings.push(`MISSING MARKS FOR QUESTION ${identifier}`);
       }
    });

    if (usableQuestionCount === 0) {
        errors.push(`DOCUMENT HAS NO USABLE QUESTIONS`);
    }

    const status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'READY_TO_PUBLISH_WITH_WARNINGS' : 'READY_TO_PUBLISH');
    
    return { status, errors, warnings };
  };

  const handleMetadataChange = (field, value) => {
    const updated = { 
        ...intel,
        identification: {
            ...intel.identification,
            [field]: {
                ...intel.identification[field],
                value,
                method: 'ADMIN_OVERRIDE'
            }
        }
    };
    updated.validation = runValidation(updated);
    setIntel(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = { 
        ...intel,
        questions: [...intel.questions]
    };
    const question = { ...updated.questions[index] };
    
    const origField = `original_${field}`;
    if (!(origField in question)) {
        question[origField] = question[field];
    }
    
    question[field] = value;
    question.adminOverride = true;
    question.overrideTimestamp = new Date().toISOString();

    updated.questions[index] = question;
    updated.validation = runValidation(updated);
    setIntel(updated);
  };

  const handleSubQuestionChange = (qIndex, subIndex, field, value) => {
    const updated = { ...intel, questions: [...intel.questions] };
    const question = { ...updated.questions[qIndex] };
    const subQs = [...(question.subQuestions || [])];
    const subQ = { ...subQs[subIndex] };
    
    const origField = `original_${field}`;
    if (!(origField in subQ)) {
        subQ[origField] = subQ[field];
    }
    
    subQ[field] = value;
    subQs[subIndex] = subQ;
    question.subQuestions = subQs;
    question.adminOverride = true;
    
    updated.questions[qIndex] = question;
    updated.validation = runValidation(updated);
    setIntel(updated);
  };

  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const analyzingMessages = [
    "Analyzing PDF...",
    "Analyzing page structure...",
    "Reconstructing questions...",
    "Pairing Hindi/English...",
    "Validating question boundaries..."
  ];

  const handleAiAnalyze = async () => {
    setAnalyzingAi(true);
    let msgIdx = 0;
    const interval = setInterval(() => {
       msgIdx = (msgIdx + 1) % analyzingMessages.length;
       setAiMessageIndex(msgIdx);
    }, 2000);

    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}/ai-analyze`, {
        method: 'POST',
        headers: { 
           'Authorization': `Bearer ${token}`
        }
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         const text = await res.text();
         throw new Error(`AI analysis failed (${res.status}): Expected JSON, got HTML or text. Response snippet: ${text.slice(0, 300)}`);
      }
      
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || 'AI Analysis failed');
      }
      
      const data = await res.json();
      const rawIntel = JSON.parse(data.job.resultJson);
      rawIntel.questions = flattenQuestions(rawIntel.questions || []);
      setIntel(rawIntel);
      if (data.success === false) {
          alert(data.message || 'AI analysis was not safely applied. Original OCR has been preserved.');
      } else {
          alert(data.message || 'AI Analysis completed successfully');
      }
    } catch (err) {
      alert('Error during AI Analysis: ' + err.message);
    } finally {
      clearInterval(interval);
      setAnalyzingAi(false);
    }
  };

  const handleDirectAiAnalyze = async () => {
    setAnalyzingAi(true);
    try {
      const token = localStorage.getItem('fetchIqToken');
      const res = await fetch(`http://localhost:3000/api/fetchiq/v2/document/${id}/direct-ai-analyze`, {
        method: 'POST',
        headers: { 
           'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
         throw new Error(data.error || 'Direct AI Analysis failed');
      }
      
      const rawIntel = JSON.parse(data.job.resultJson);
      setIntel(rawIntel);
      alert(data.message || 'Direct AI Analysis completed successfully');
    } catch (err) {
      alert('Error during Direct AI Analysis: ' + err.message);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const token = localStorage.getItem('fetchIqToken');
      const payloadIdentity = { ...intel.identification };
      if (payloadIdentity.paper && payloadIdentity.paper.value) {
          const norm = normalizePaperCode(payloadIdentity.paper.value);
          payloadIdentity.paper = {
              ...payloadIdentity.paper,
              value: norm !== 'UNSUPPORTED_PAPER_CODE' ? (norm === 'AMBIGUOUS_OPTIONAL_PAPER_PART' ? payloadIdentity.paper.value : norm) : payloadIdentity.paper.value
          };
      }

      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/document/${id}/publish`, {
        method: 'POST',
        headers: { 
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           documentIdentity: payloadIdentity,
           questions: intel.questions
        })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || 'Failed to publish');
      }
      window.location.reload();
    } catch (err) {
      alert('Error publishing: ' + err.message);
      setPublishing(false);
      setShowConfirm(false);
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishConfirm) return;
    setUnpublishing(true);
    try {
      const res = await fetch(`http://localhost:3000/api/fetchiq/ingestion/pyqs/${unpublishConfirm.id}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fetchIqToken')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unpublish');
      
      setUnpublishedQuestions(prev => ({ ...prev, [unpublishConfirm.idx]: true }));
      setUnpublishConfirm(null);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUnpublishing(false);
    }
  };

  if (loading) return <AdminLayout title="Review Queue"><div style={{ padding: '32px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading Intelligence Result...</div></AdminLayout>;
  if (error) return <AdminLayout title="Review Queue"><div style={{ padding: '32px', color: 'var(--rose-500)', textAlign: 'center' }}>Error: {error}</div></AdminLayout>;
  if (!doc) return <AdminLayout title="Review Queue"><div style={{ padding: '32px', color: 'var(--text-muted)', textAlign: 'center' }}>Document not found</div></AdminLayout>;

  const isPublished = doc.status === 'PUBLISHED';
  const canPublish = !isPublished && intel?.validation?.status !== 'FAIL';

  console.log('[FETCHIQ REVIEW] Rendering review workspace');

  return (
    <AdminLayout 
      title="Intelligence Review" 
      subtitle="Review, correct, and publish extracted document structure"
    >
      {/* Header Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--indigo-400)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '16px' }}>
          {canPublish && (
            <>
              <button 
                onClick={handleDirectAiAnalyze}
                disabled={analyzingAi}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.875rem', borderColor: 'var(--indigo-500)', color: 'var(--indigo-300)' }}
              >
                {analyzingAi ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />} 
                Direct AI PDF Analysis (V2)
              </button>
              <button 
                onClick={handleAiAnalyze}
                disabled={analyzingAi}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                {analyzingAi ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />} 
                {analyzingAi ? analyzingMessages[aiMessageIndex] : 'Analyze with AI'}
              </button>
              <button 
                onClick={() => setShowConfirm(true)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                <Send size={16} /> Approve & Publish
              </button>
            </>
          )}
          {isPublished && (
            <div className="badge" style={{ backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-400)', padding: '10px 20px', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} /> PUBLISHED
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <CheckCircle2 size={24} color="var(--emerald-400)" /> Publish Paper?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>This will commit the intelligence extraction to the live database.</p>
            
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'var(--text-muted)' }}>Exam</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{intel.identification.exam?.value}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'var(--text-muted)' }}>Year</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{intel.identification.year?.value}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'var(--text-muted)' }}>Paper</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{intel.identification.paper?.value}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '8px', marginBottom: '8px' }}><span style={{ color: 'var(--text-muted)' }}>Questions</span><span style={{ color: 'var(--indigo-400)', fontWeight: 500 }}>{intel.questions.length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Warnings</span><span style={{ color: 'var(--gold-400)', fontWeight: 500 }}>{intel.validation.warnings.length}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                disabled={publishing}
                onClick={() => setShowConfirm(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                disabled={publishing}
                onClick={handlePublish} 
                className="btn"
                style={{ backgroundColor: 'var(--emerald-600)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                {publishing ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unpublish Confirmation Modal */}
      {unpublishConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <AlertTriangle size={24} color="var(--rose-400)" /> Remove from Mains 360?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
               The question will no longer be visible to students, but the original FetchIQ document, OCR evidence, mapping, and blueprint will be retained.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                disabled={unpublishing}
                onClick={() => setUnpublishConfirm(null)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                disabled={unpublishing}
                onClick={handleUnpublish} 
                className="btn"
                style={{ backgroundColor: 'var(--rose-600)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                {unpublishing ? 'Removing...' : 'Remove from Mains 360'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Question Confirmation Modal */}
      {removeConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Trash2 size={24} color="var(--rose-400)" /> Remove Question?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
               Remove this question from the final paper?
               <br/><br/>
               The original OCR and AI evidence will be preserved for audit. This question will be excluded from publication.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setRemoveConfirm(null)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleQuestionChange(removeConfirm, 'reviewStatus', 'REMOVED');
                  setRemoveConfirm(null);
                }} 
                className="btn"
                style={{ backgroundColor: 'var(--rose-600)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                Remove Question
              </button>
            </div>
          </div>
        </div>
      )}

      {!intel ? (
        <div style={{ padding: '32px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)' }}>
          <AlertTriangle size={20} style={{ marginRight: '8px' }} /> Intelligence results are not available. Job Status: {doc.IngestionJob?.[0]?.status}
        </div>
      ) : (
        <div className="review-layout">
          
          {/* LEFT PANEL: Metadata & Validation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Validation Card */}
            <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid', ...(intel.validation.status.includes('READY') ? { backgroundColor: 'var(--emerald-bg)', borderColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'var(--rose-bg)', borderColor: 'rgba(244, 63, 94, 0.2)' }) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <CheckCircle2 size={16} /> Validation
                </h2>
                <span className="badge" style={intel.validation.status.includes('READY') ? { backgroundColor: 'var(--emerald-600)', color: 'white' } : { backgroundColor: 'var(--rose-600)', color: 'white' }}>
                  {intel.validation.status}
                </span>
              </div>
              
              {intel.validation.errors.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14}/> ERRORS</h3>
                  <ul style={{ fontSize: '0.875rem', color: 'rgba(253, 164, 175, 0.8)', margin: 0, paddingLeft: '20px' }}>
                    {intel.validation.errors.map((e, i) => <li key={i} style={{ marginBottom: '6px' }}>{e}</li>)}
                  </ul>
                </div>
              )}

              {intel.validation.warnings.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14}/> WARNINGS</h3>
                  <ul style={{ fontSize: '0.875rem', color: 'rgba(253, 224, 71, 0.8)', margin: 0, paddingLeft: '20px' }}>
                    {intel.validation.warnings.map((w, i) => <li key={i} style={{ marginBottom: '6px' }}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Metadata Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--indigo-400)" /> Extracted Metadata
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['exam', 'year', 'paper'].map((key) => {
                  const obj = intel.identification[key] || {};
                  return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className="form-label">{key}</label>
                    {key === 'paper' ? (
                        <select 
                            value={(() => {
                                if (!obj.value || obj.value === 'missing') return '';
                                const raw = obj.value;
                                const base = getBasePaperCode(raw);
                                if (getCanonicalPaperChoices().some(c => c.code === base)) {
                                    return base;
                                } else if (getCanonicalPaperChoices().some(c => c.code === normalizePaperCode(raw))) {
                                    return normalizePaperCode(raw);
                                }
                                return raw; // Explicitly return raw so it doesn't silently fall back to '' if the value exists but is invalid
                            })()}
                            disabled={isPublished}
                            onChange={(e) => handleMetadataChange(key, e.target.value)}
                            className="form-input fetchiq-paper-select"
                            style={obj.method === 'ADMIN_OVERRIDE' ? { borderColor: 'rgba(99, 102, 241, 0.5)', color: 'var(--indigo-300)' } : {}}
                        >
                            <option value="" disabled hidden>Select paper...</option>
                            {getCanonicalPaperChoices().map(c => (
                                <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                            {/* If the current value is not in the canonical list, show it so the admin knows exactly what the DB has */}
                            {obj.value && obj.value !== 'missing' && 
                             !getCanonicalPaperChoices().some(c => c.code === getBasePaperCode(obj.value)) &&
                             !getCanonicalPaperChoices().some(c => c.code === normalizePaperCode(obj.value)) && (
                                <option value={obj.value}>{obj.value} (Unknown)</option>
                            )}
                        </select>
                    ) : (
                        <input 
                           type="text" 
                           value={obj.value === 'missing' ? '' : (obj.value || '')} 
                           disabled={isPublished}
                           onChange={(e) => handleMetadataChange(key, e.target.value)}
                           className="form-input"
                           style={obj.method === 'ADMIN_OVERRIDE' ? { borderColor: 'rgba(99, 102, 241, 0.5)', color: 'var(--indigo-300)' } : {}}
                        />
                    )}
                    {obj.evidence && <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '6px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={12}/> Evidence: "{obj.evidence}"</span>}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Questions */}
          <div>
            <div className="glass-card" style={{ padding: '24px', height: 'calc(100vh - 192px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
                 <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                   <BookOpen size={16} color="var(--indigo-400)" /> Questions ({intel.questions.length})
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
                     {intel.questions.filter(q => q.reviewStatus !== 'REMOVED').length} ACTIVE • {intel.questions.filter(q => q.reviewStatus === 'REMOVED').length} REMOVED
                   </span>
                 </h2>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All changes autosave locally</span>
              </div>

              <div className="custom-scrollbar" style={{ overflowY: 'auto', paddingRight: '8px', paddingBottom: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {intel.questions.map((q, idx) => {
                  const isRemoved = q.reviewStatus === 'REMOVED';
                  if (isRemoved) {
                    return (
                      <div key={idx} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(244, 63, 94, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--rose-400)', fontWeight: 700 }}>Q{q.questionNumber || ''}</span>
                          <span className="badge badge-rose">REMOVED FROM PUBLICATION</span>
                        </div>
                        <button 
                          disabled={isPublished}
                          onClick={() => handleQuestionChange(idx, 'reviewStatus', 'ACTIVE')}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Restore
                        </button>
                      </div>
                    );
                  }

                  return (
                  <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', transition: 'border-color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                    
                    {/* Question Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ backgroundColor: q.status === 'UNRESOLVED_OCR_EVIDENCE' ? 'var(--rose-bg)' : 'var(--indigo-bg)', color: q.status === 'UNRESOLVED_OCR_EVIDENCE' ? 'var(--rose-400)' : 'var(--indigo-400)', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: `1px solid ${q.status === 'UNRESOLVED_OCR_EVIDENCE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                           {q.status === 'UNRESOLVED_OCR_EVIDENCE' ? 'UNRESOLVED EVIDENCE' : 'Q.'} 
                           {q.status !== 'UNRESOLVED_OCR_EVIDENCE' && (
                             <input 
                                type="number" 
                                disabled={isPublished}
                                value={q.questionNumber || ''} 
                                onChange={(e) => handleQuestionChange(idx, 'questionNumber', e.target.value)}
                                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '32px', textAlign: 'center', color: 'inherit', fontWeight: 'inherit', font: 'inherit' }}
                             />
                           )}
                         </div>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Section: 
                            <input disabled={isPublished} type="text" value={q.section || ''} onChange={(e) => handleQuestionChange(idx, 'section', e.target.value)} className="form-input" style={{ width: '48px', padding: '4px 8px' }}/>
                         </label>
                         {q.adminOverride && <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: 'var(--gold-bg)', color: 'var(--gold-500)', border: '1px solid rgba(234, 179, 8, 0.2)' }} title="Admin Override Active">EDITED</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                        {(() => {
                            const docPaperCode = normalizePaperCode(intel.identification.paper?.value);
                            const isOptional = docPaperCode && docPaperCode.startsWith('OPT-');
                            const baseCodeMatch = docPaperCode ? docPaperCode.match(/^(OPT-[A-Z-]+)/) : null;
                            const baseCode = baseCodeMatch ? baseCodeMatch[1] : '';
                            return isOptional && baseCode ? (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                   Paper: 
                                   <select disabled={isPublished} value={q.paperCodeOverride || ''} onChange={(e) => handleQuestionChange(idx, 'paperCodeOverride', e.target.value)} className="form-input fetchiq-paper-select" style={{ padding: '4px 8px' }}>
                                       <option value="">Auto</option>
                                       <option value={`${baseCode}-P1`}>P1</option>
                                       <option value={`${baseCode}-P2`}>P2</option>
                                   </select>
                                </label>
                            ) : null;
                        })()}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           Marks: 
                           <input disabled={isPublished} type="number" value={q.marks || ''} onChange={(e) => handleQuestionChange(idx, 'marks', e.target.value)} className="form-input" style={{ width: '48px', padding: '4px 8px' }}/>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           Words: 
                           <input disabled={isPublished} type="number" value={q.wordLimit || ''} onChange={(e) => handleQuestionChange(idx, 'wordLimit', e.target.value)} className="form-input" style={{ width: '48px', padding: '4px 8px' }}/>
                        </label>
                        {isPublished && (() => {
                           const qId = `pyq-${intel.identification.year?.value}-${intel.identification.paper?.value?.toLowerCase()}-${String(q.questionNumber).padStart(2, '0')}`;
                           const isLive = publishedApiQuestions[qId] && !unpublishedQuestions[idx];
                           return isLive ? (
                             <button 
                               onClick={() => setUnpublishConfirm({ idx, id: qId })}
                               className="btn btn-secondary"
                               style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--rose-400)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                             >
                               Remove from Mains 360
                             </button>
                           ) : (
                             <span className="badge badge-rose" style={{ padding: '4px 8px' }}>UNPUBLISHED/REMOVED</span>
                           );
                        })()}
                        {!isPublished && (
                          <button
                             onClick={() => setRemoveConfirm(idx)}
                             className="btn btn-secondary"
                             style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--rose-400)', borderColor: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                             <Trash2 size={12} /> Remove Question
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Confidence & Evidence */}
                    {(q.confidence !== undefined || q.status === 'AI_RECONSTRUCTED' || q.status === 'LOW_CONFIDENCE' || q.status === 'UNRESOLVED_OCR_EVIDENCE' || q.englishEvidence || q.hindiEvidence) && (
                      <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                          <span className="badge" style={{ backgroundColor: (q.status === 'LOW_CONFIDENCE' || q.status === 'UNRESOLVED_OCR_EVIDENCE') ? 'var(--rose-bg)' : 'var(--emerald-bg)', color: (q.status === 'LOW_CONFIDENCE' || q.status === 'UNRESOLVED_OCR_EVIDENCE') ? 'var(--rose-400)' : 'var(--emerald-400)' }}>
                            {q.status === 'LOW_CONFIDENCE' ? '⚠ LOW CONFIDENCE' : q.status === 'UNRESOLVED_OCR_EVIDENCE' ? '⚠ UNRESOLVED OCR EVIDENCE' : 'AI RECONSTRUCTED'}
                          </span>
                          {q.confidence !== undefined && (
                            <>
                              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Confidence:</span>
                              <span style={{ color: q.confidence < 0.6 ? 'var(--rose-400)' : q.confidence > 0.8 ? 'var(--emerald-400)' : 'var(--gold-400)', fontWeight: 600 }}>
                                {(q.confidence * 100).toFixed(0)}%
                              </span>
                            </>
                          )}
                          {q.requiresAdminReview && <span className="badge badge-rose">Admin Review Required</span>}
                        </div>
                        {(q.pageNumbers || q.englishEvidence || q.hindiEvidence) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Evidence:</span>
                            {q.pageNumbers?.length > 0 && <span>Pages: {q.pageNumbers.join(', ')}</span>}
                            <span>English Fragments: {q.englishEvidence?.length || '0'}</span>
                            <span>Hindi Fragments: {q.hindiEvidence?.length || '0'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {(q.instructionEn || q.instructionHi) && (
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)' }}>
                          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>Instructions</h4>
                          {q.instructionEn && (
                            <div style={{ marginBottom: q.instructionHi ? '12px' : '0' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>English:</span>
                              <textarea 
                                disabled={isPublished}
                                className="form-input"
                                style={{ width: '100%', minHeight: '40px', padding: '8px', fontSize: '0.875rem' }}
                                value={q.instructionEn}
                                onChange={(e) => handleQuestionChange(idx, 'instructionEn', e.target.value)}
                              />
                            </div>
                          )}
                          {q.instructionHi && (
                            <div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hindi:</span>
                              <textarea 
                                disabled={isPublished}
                                className="form-input"
                                style={{ width: '100%', minHeight: '40px', padding: '8px', fontSize: '0.875rem' }}
                                value={q.instructionHi}
                                onChange={(e) => handleQuestionChange(idx, 'instructionHi', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>English</span>
                          {!q.questionEn && q.status !== 'UNRESOLVED_OCR_EVIDENCE' && <span className="badge" style={{ fontSize: '0.65rem', color: 'var(--rose-400)', backgroundColor: 'var(--rose-bg)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>MISSING</span>}
                        </div>
                        <textarea 
                           disabled={isPublished}
                           className="form-input"
                           style={{ width: '100%', minHeight: '80px', padding: '12px', resize: 'vertical', ...(q.original_questionEn !== undefined ? { borderColor: 'rgba(99, 102, 241, 0.5)' } : {}) }}
                           value={q.questionEn || ''}
                           onChange={(e) => handleQuestionChange(idx, 'questionEn', e.target.value)}
                        />
                        {q.original_questionEn !== undefined && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--indigo-400)', marginTop: '8px', padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <Edit3 size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div><span style={{ fontWeight: 600 }}>Original OCR:</span> {q.original_questionEn || 'null'}</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Hindi</span>
                          {!q.questionHi && q.status !== 'UNRESOLVED_OCR_EVIDENCE' && <span className="badge" style={{ fontSize: '0.65rem', color: 'var(--gold-500)', backgroundColor: 'var(--gold-bg)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>MISSING</span>}
                        </div>
                        <textarea 
                           disabled={isPublished}
                           className="form-input"
                           style={{ width: '100%', minHeight: '80px', padding: '12px', resize: 'vertical', ...(q.original_questionHi !== undefined ? { borderColor: 'rgba(99, 102, 241, 0.5)' } : {}) }}
                           value={q.questionHi || ''}
                           onChange={(e) => handleQuestionChange(idx, 'questionHi', e.target.value)}
                        />
                        {q.original_questionHi !== undefined && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--indigo-400)', marginTop: '8px', padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <Edit3 size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div><span style={{ fontWeight: 600 }}>Original OCR:</span> {q.original_questionHi || 'null'}</div>
                          </div>
                        )}
                      </div>
                      
                       {/* TOPIC MAPPING PROPOSAL UI (SLICE 1) */}
                      <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                           <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <Layers size={12} /> Topic / Syllabus Mapping
                           </span>
                           <button 
                             onClick={() => fetchProposal(idx, q.questionEn, intel.identification?.paper?.value)}
                             disabled={fetchingProposals[idx] || isPublished || intel.identification?.paper?.value === 'UNKNOWN'}
                             className="btn btn-secondary"
                             style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--indigo-400)', opacity: (fetchingProposals[idx] || isPublished || intel.identification?.paper?.value === 'UNKNOWN') ? 0.5 : 1 }}
                           >
                             {fetchingProposals[idx] ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }}/> Analyzing...</> : <><Search size={12}/> Generate Proposal</>}
                           </button>
                        </div>
                        
                        {intel.identification?.paper?.value === 'UNKNOWN' && (
                           <div style={{ marginBottom: '12px', fontSize: '0.75rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <AlertTriangle size={14} /> Please set Paper Code in Extracted Metadata to generate topic proposals.
                           </div>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(30, 41, 59, 0.5)' }}>
                           <div>
                             <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', marginBottom: '4px' }}>Current Mapping</div>
                             <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{q.topic_title ? <span style={{ color: 'var(--indigo-400)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> {q.topic_title}</span> : 'TOPIC_MAPPING_PENDING'}</div>
                           </div>
                           <div>
                             <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', marginBottom: '4px' }}>Proposed Mapping</div>
                             {proposals[idx] ? (
                               proposals[idx].status === 'UNMAPPED' ? (
                                 <div style={{ color: 'var(--gold-500)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12}/> UNMAPPED ({proposals[idx].reason})</div>
                               ) : (
                                 <div style={{ color: 'var(--emerald-400)' }}>
                                   <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14}/> {proposals[idx].proposedTopicTitle}</div>
                                   <div style={{ fontSize: '0.65rem', color: 'rgba(52, 211, 153, 0.7)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                     <span>Node ID: {proposals[idx].proposedTopicId} | Confidence: {proposals[idx].confidence}</span>
                                     <span style={{ fontStyle: 'italic', opacity: 0.8 }}>Reason: {proposals[idx].reason}</span>
                                   </div>
                                 </div>
                               )
                             ) : (
                               <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No proposal generated yet</div>
                             )}
                           </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                           <button disabled style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', padding: '6px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 500, opacity: 0.5, cursor: 'not-allowed', border: 'none' }}>Reject</button>
                           <button 
                             onClick={() => acceptMapping(idx)}
                             disabled={!proposals[idx] || proposals[idx].status !== 'PROPOSED' || isPublished} 
                             style={{ backgroundColor: 'var(--indigo-bg)', color: 'rgba(99, 102, 241, 0.9)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 500, cursor: (!proposals[idx] || proposals[idx].status !== 'PROPOSED' || isPublished) ? 'not-allowed' : 'pointer', opacity: (!proposals[idx] || proposals[idx].status !== 'PROPOSED' || isPublished) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <Save size={12}/> Accept Mapping
                           </button>
                        </div>
                      </div>

                      {/* AI ANSWER BLUEPRINT PROPOSAL UI (SLICE 3A) */}
                      <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                           <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <Sparkles size={12} /> Answer Blueprint Proposal
                           </span>
                           <div style={{ display: 'flex', gap: '8px' }}>
                             {q.blueprint_status !== 'APPROVED' && (
                               <button 
                                 onClick={() => fetchBlueprintProposal(idx)}
                                 disabled={fetchingBlueprints[idx] || isPublished || q.topic_status !== 'MAPPED'}
                                 className="btn btn-secondary"
                                 style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--indigo-400)', opacity: (fetchingBlueprints[idx] || isPublished || q.topic_status !== 'MAPPED') ? 0.5 : 1 }}
                               >
                                 {fetchingBlueprints[idx] ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }}/> Generating...</> : <><Sparkles size={12}/> Generate Proposal</>}
                               </button>
                             )}
                           </div>
                        </div>
                        
                        {q.topic_status !== 'MAPPED' && q.blueprint_status !== 'APPROVED' && (
                           <div style={{ marginBottom: '12px', fontSize: '0.75rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <AlertTriangle size={14} /> Please map a topic before generating an AI blueprint.
                           </div>
                        )}
                        
                        {q.blueprint_status === 'APPROVED' ? (
                          <div style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-500)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                              <span style={{ color: 'var(--emerald-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12}/> APPROVED BLUEPRINT
                              </span>
                            </div>
                            <div style={{ color: 'var(--text-primary)' }}>
                               <div style={{ marginBottom: '8px' }}><strong>Directive:</strong> <span style={{ color: 'var(--indigo-400)' }}>{q.directive}</span></div>
                               <div style={{ marginBottom: '8px' }}><strong>Directive Tip:</strong> {q.directive_tip}</div>
                               <div style={{ marginTop: '12px', fontWeight: 600 }}>Model Framework:</div>
                               <div style={{ paddingLeft: '8px', marginTop: '4px', borderLeft: '2px solid var(--emerald-500)' }}>
                                 <div style={{ marginBottom: '8px' }}><em>Intro:</em> {q.model_framework?.introduction}</div>
                                 {q.model_framework?.dimensions?.map((dim, dIdx) => (
                                   <div key={dIdx} style={{ marginBottom: '8px' }}>
                                     <strong>{dim.name}</strong>
                                     <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                       {dim.points?.map((pt, pIdx) => <li key={pIdx}>{pt}</li>)}
                                     </ul>
                                   </div>
                                 ))}
                                 <div style={{ marginBottom: '8px' }}>
                                    <strong>Citations:</strong> {q.model_framework?.citations?.join(', ')}
                                 </div>
                                 <div><em>Conclusion:</em> {q.model_framework?.conclusion}</div>
                               </div>
                             </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(30, 41, 59, 0.5)' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>AI PROPOSAL — NOT SAVED</span>
                             </div>

                             {blueprintProposals[idx] ? (
                               blueprintProposals[idx].status === 'PROPOSED' ? (
                                 <div style={{ color: 'var(--text-primary)' }}>
                                   <div style={{ marginBottom: '8px' }}><strong>Directive:</strong> <span style={{ color: 'var(--indigo-400)' }}>{blueprintProposals[idx].proposal.directive}</span></div>
                                   <div style={{ marginBottom: '8px' }}><strong>Directive Tip:</strong> {blueprintProposals[idx].proposal.directive_tip}</div>
                                   <div style={{ marginTop: '12px', fontWeight: 600 }}>Model Framework:</div>
                                   <div style={{ paddingLeft: '8px', marginTop: '4px', borderLeft: '2px solid var(--border-subtle)' }}>
                                     <div style={{ marginBottom: '8px' }}><em>Intro:</em> {blueprintProposals[idx].proposal.model_framework?.introduction}</div>
                                     {blueprintProposals[idx].proposal.model_framework?.dimensions?.map((dim, dIdx) => (
                                       <div key={dIdx} style={{ marginBottom: '8px' }}>
                                         <strong>{dim.name}</strong>
                                         <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                           {dim.points?.map((pt, pIdx) => <li key={pIdx}>{pt}</li>)}
                                         </ul>
                                       </div>
                                     ))}
                                     <div style={{ marginBottom: '8px' }}>
                                        <strong>Citations:</strong> {blueprintProposals[idx].proposal.model_framework?.citations?.join(', ')}
                                     </div>
                                     <div><em>Conclusion:</em> {blueprintProposals[idx].proposal.model_framework?.conclusion}</div>
                                   </div>
                                   <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                     <button 
                                       onClick={() => approveBlueprint(idx)}
                                       disabled={approvingBlueprints[idx] || isPublished}
                                       className="btn btn-primary"
                                       style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                     >
                                       {approvingBlueprints[idx] ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }}/> Approving...</> : <><CheckCircle size={12}/> Approve Blueprint</>}
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 <div style={{ color: 'var(--rose-400)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <AlertTriangle size={12}/> Unable to generate blueprint proposal. ({blueprintProposals[idx].reason})
                                 </div>
                               )
                             ) : (
                               <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No proposal generated yet</div>
                             )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Review;
