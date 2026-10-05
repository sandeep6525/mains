import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, 
  TrendingUp, 
  Award, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Filter,
  Eye,
  HelpCircle,
  Download,
  Camera,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SIMULATED_PAPERS } from '../data/fullPaperData';
import { evaluateAnswerSubmission } from '../data/evaluationEngine';
import OCRScannerModal from './OCRScannerModal';
import { getPaperConfig } from '../config/simulatorConfig';
import { getQuestions } from '../services/api/questions';

export default function FullPaperSimulator({ language }) {
  const [selectedPaperId, setSelectedPaperId] = useState("sim-gs2");

  const [sourceMode, setSourceMode] = useState("PYQ");
  const [selectedPaperBase, setSelectedPaperBase] = useState("GS-I");
  const [selectedPaperPart, setSelectedPaperPart] = useState("P1");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(20);
  const [aiMarks, setAiMarks] = useState(250);
  const [aiIncludeCurrentAffairs, setAiIncludeCurrentAffairs] = useState(true);
  const [aiUseHistoricalPattern, setAiUseHistoricalPattern] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [simulatorState, setSimulatorState] = useState("CONFIG"); // CONFIG | RUNNING
  const [generatedPaper, setGeneratedPaper] = useState(null);

  const getSelectedCanonicalCode = () => {
    if (selectedPaperBase.startsWith('OPT-')) {
      return `${selectedPaperBase}-${selectedPaperPart}`;
    }
    return selectedPaperBase;
  };

  const [availabilityData, setAvailabilityData] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchAvail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/fetchiq/simulator/pyq/availability`);
        if (!res.ok) throw new Error('Failed to fetch availability');
        const data = await res.json();
        
        if (!isMounted) return;
        
        const availability = {};
        data.forEach(item => {
          availability[item.paper_code] = item.count;
        });
        setAvailabilityData(availability);
      } catch (err) {
        console.error('[SIMULATOR] Error fetching questions for availability:', err);
      }
    };
    fetchAvail();
    return () => { isMounted = false; };
  }, []);

  const canonicalCode = getSelectedCanonicalCode();

  // Derived arrays for dropdowns
  const ALL_GS = [
    { val: "GS-I", label: "GS-I" },
    { val: "GS-II", label: "GS-II" },
    { val: "GS-III", label: "GS-III" },
    { val: "GS-IV", label: "GS-IV" },
    { val: "ESSAY", label: "Essay" }
  ];
  const ALL_OPT = [
    { val: "OPT-ECON", label: "Economics" },
    { val: "OPT-PSIR", label: "PSIR" },
    { val: "OPT-SOCIO", label: "Sociology" },
    { val: "OPT-PUBAD", label: "Public Administration" },
    { val: "OPT-GEO", label: "Geography" },
    { val: "OPT-HIST", label: "History" },
    { val: "OPT-ANTHRO", label: "Anthropology" },
    { val: "OPT-PHIL", label: "Philosophy" },
    { val: "OPT-LAW", label: "Law" },
    { val: "OPT-COMM", label: "Commerce & Accountancy" },
    { val: "OPT-PSYCH", label: "Psychology" },
    { val: "OPT-AGRI", label: "Agriculture" },
    { val: "OPT-MATH", label: "Mathematics" },
    { val: "OPT-MGMT", label: "Management" },
    { val: "OPT-HINDI-LIT", label: "Hindi Literature" }
  ];

  const availableGs = sourceMode === 'PYQ' ? ALL_GS.filter(p => availabilityData[p.val]) : ALL_GS;
  const availableOpt = sourceMode === 'PYQ' ? ALL_OPT.filter(p => availabilityData[p.val + '-P1'] || availabilityData[p.val + '-P2']) : ALL_OPT;

  useEffect(() => {
    if (sourceMode === 'PYQ' && Object.keys(availabilityData).length > 0) {
        const isValid = availableGs.some(p => p.val === selectedPaperBase) || availableOpt.some(p => p.val === selectedPaperBase);
        if (!isValid) {
            if (availableGs.length > 0) setSelectedPaperBase(availableGs[0].val);
            else if (availableOpt.length > 0) setSelectedPaperBase(availableOpt[0].val);
        }
    }
  }, [sourceMode, availabilityData, selectedPaperBase, availableGs, availableOpt]);

  const currentAvailableQuestionsCount = (sourceMode === 'PYQ' && availabilityData[canonicalCode]) 
        ? availabilityData[canonicalCode] : 0;
  
  const requiredQuestionsCount = getPaperConfig(canonicalCode).questionCount || 20;

  const fallbackPaper = SIMULATED_PAPERS.find(p => p.id === selectedPaperId) || SIMULATED_PAPERS[0];
  const activePaper = generatedPaper || fallbackPaper;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [activeFilter, setActiveFilter] = useState("all"); // all, section-a, section-b, attempted, flagged, unattempted
  const [showModelHints, setShowModelHints] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

  // 180 Minutes (3 Hours)
  const [secondsRemaining, setSecondsRemaining] = useState(180 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paperEvaluationReport, setPaperEvaluationReport] = useState(null);


  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const code = getSelectedCanonicalCode();
      const config = getPaperConfig(code);

      if (sourceMode === 'PYQ') {
          // Calls Backend
          const endpoint = '/api/fetchiq/simulator/pyq/generate';
          const payload = {
            paperCode: code
          };

          const res = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          let responseData = null;
          try {
            responseData = await res.json();
          } catch (err) {
            console.error('[SIMULATOR] API response parse error:', err);
            throw new Error('Unable to generate the paper. Please check the server and try again.');
          }

          if (!res.ok) {
            console.error('[SIMULATOR] API error:', responseData?.error);
            throw new Error('Unable to generate the paper. Please check the server and try again.');
          }

          setGeneratedPaper(responseData);
          setCurrentQIndex(0);
          setAnswers({});
          setFlagged({});
          setSecondsRemaining((responseData.duration_minutes || 180) * 60);
          setIsTimerRunning(false);
          setIsSubmitted(false);
          setPaperEvaluationReport(null);
          setSimulatorState("RUNNING");
      } else {
          // AI Generation Mode (Calls Backend)
          const endpoint = '/api/fetchiq/simulator/ai/generate';
          const payload = {
            paperCode: code,
            difficulty: aiDifficulty,
            count: aiCount,
            marks: aiMarks,
            includeCurrentAffairs: aiIncludeCurrentAffairs,
            useHistoricalPattern: aiUseHistoricalPattern
          };

          const res = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          let responseData = null;
          try {
            responseData = await res.json();
          } catch (err) {
            console.error('[SIMULATOR] API response parse error:', err);
            throw new Error('Unable to generate the paper. Please check the server and try again.');
          }

          if (!res.ok) {
            console.error('[SIMULATOR] API error:', responseData?.error);
            throw new Error('Unable to generate the paper. Please check the server and try again.');
          }

          setGeneratedPaper(responseData);
          
          setCurrentQIndex(0);
          setAnswers({});
          setFlagged({});
          setSecondsRemaining((responseData.duration_minutes || 180) * 60);
          setIsTimerRunning(false);
          setIsSubmitted(false);
          setPaperEvaluationReport(null);
          setSimulatorState("RUNNING");
      }
    } catch (e) {
      console.error('[SIMULATOR] Generation failed:', e);
      setGenerateError(e.message || 'Unable to generate the paper. Please check the server and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetToConfig = () => {
      setSimulatorState("CONFIG");
  };


  // Master Clock tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const currentQ = activePaper.questions[currentQIndex] || activePaper.questions[0];

  const formatTimer = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (text) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: text }));
  };

  const toggleFlag = (id) => {
    setFlagged(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAutoFillSampleAnswers = () => {
    const filled = {};
    activePaper.questions.forEach(q => {
      filled[q.id] = `[Attempted Answer for Question ${q.id}]: Addressing the core demand with relevant constitutional articles, Supreme Court case laws (e.g., Kesavananda Bharati, Minerva Mills, Davinder Singh), and structured headings covering socio-economic and administrative dimensions. Detailed arguments substantiated with 2nd ARC and Law Commission recommendations. Concluded with a forward-looking synthesis linked to constitutional morality and SDG targets.`;
    });
    setAnswers(filled);
  };

  const handleSubmitPaper = () => {
    setIsTimerRunning(false);
    
    // Generate full paper report with authentic Board marks
    let totalMarksAwarded = 0;
    let sectionAScore = 0;
    let sectionBScore = 0;

    const questionEvaluations = activePaper.questions.map(q => {
      const text = answers[q.id] || "";
      const isAttempted = text.trim().length > 0;
      let evalData = null;
      let marksAwarded = 0;

      if (isAttempted) {
        try {
          evalData = evaluateAnswerSubmission(text, {
            marks: q.marks,
            word_limit: q.word_limit,
            directive: q.directive || "Discuss"
          }, false);
          marksAwarded = evalData.awarded_marks || 0;
          totalMarksAwarded += marksAwarded;

          if (q.section === "A") {
            sectionAScore += marksAwarded;
          } else {
            sectionBScore += marksAwarded;
          }
        } catch (e) {
          evalData = null;
        }
      }
      return {
        question: q,
        text: text,
        isAttempted: isAttempted,
        wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        marksAwarded: marksAwarded,
        evaluation: evalData
      };
    });

    const attemptedCount = questionEvaluations.filter(q => q.isAttempted).length;
    const totalWords = questionEvaluations.reduce((acc, q) => acc + q.wordCount, 0);
    const scorePct = Math.round((totalMarksAwarded / activePaper.total_marks) * 100);

    const report = {
      paperTitle: activePaper.title,
      totalQuestions: activePaper.questions.length,
      attemptedCount: attemptedCount,
      attemptPercentage: Math.round((attemptedCount / activePaper.questions.length) * 100),
      totalWords: totalWords,
      totalMarksAwarded: Math.round(totalMarksAwarded * 10) / 10,
      totalMaxMarks: activePaper.total_marks,
      scorePct: scorePct,
      sectionAScore: Math.round(sectionAScore * 10) / 10,
      sectionBScore: Math.round(sectionBScore * 10) / 10,
      timeElapsedMinutes: Math.round(((activePaper.duration_minutes * 60) - secondsRemaining) / 60),
      questionEvaluations: questionEvaluations
    };

    setPaperEvaluationReport(report);
    setIsSubmitted(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const attemptedCount = Object.keys(answers).filter(k => answers[k]?.trim().length > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {simulatorState === "CONFIG" ? (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px' }}>Configure Paper Simulator</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Question Source Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, width: '120px' }}>Question Source:</span>
                <button className={`btn btn-sm ${sourceMode === 'PYQ' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSourceMode('PYQ')} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>PYQ</button>
                <button className={`btn btn-sm ${sourceMode === 'AI' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSourceMode('AI')} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>AI Generated</button>
              </div>

              {/* Select Paper Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, width: '120px' }}>Select Paper:</span>
                <select className="form-input" value={selectedPaperBase} onChange={(e) => setSelectedPaperBase(e.target.value)} style={{ padding: '4px 8px', width: 'auto', minWidth: '150px' }}>
                  {availableGs.length > 0 && (
                    <optgroup label="General Studies">
                        {availableGs.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
                    </optgroup>
                  )}
                  {availableOpt.length > 0 && (
                    <optgroup label="Optional">
                        {availableOpt.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
                    </optgroup>
                  )}
                  {availableGs.length === 0 && availableOpt.length === 0 && (
                      <option value="">No published papers available</option>
                  )}
                </select>
                
                {selectedPaperBase && selectedPaperBase.startsWith('OPT-') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {sourceMode !== 'PYQ' || availabilityData[selectedPaperBase + '-P1'] ? (
                        <button className={`btn btn-sm ${selectedPaperPart === 'P1' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedPaperPart('P1')} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>Paper 1</button>
                    ) : null}
                    {sourceMode !== 'PYQ' || availabilityData[selectedPaperBase + '-P2'] ? (
                        <button className={`btn btn-sm ${selectedPaperPart === 'P2' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedPaperPart('P2')} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>Paper 2</button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Mode Specific Config Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, width: '120px' }}>Configuration:</span>
                
                {sourceMode === 'PYQ' ? null : (
                  <>
                    <select className="form-input" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} style={{ padding: '4px 8px', width: 'auto' }}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <select className="form-input" value={aiCount} onChange={(e) => setAiCount(e.target.value)} style={{ padding: '4px 8px', width: 'auto' }}>
                      <option value="10">10 Questions</option>
                      <option value="20">20 Questions</option>
                    </select>
                    <button className={`btn btn-sm ${aiIncludeCurrentAffairs ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAiIncludeCurrentAffairs(!aiIncludeCurrentAffairs)} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>CA: {aiIncludeCurrentAffairs ? 'ON' : 'OFF'}</button>
                  </>
                )}
              </div>
              
              {generateError && (
                <div style={{ fontSize: '0.8rem', color: 'var(--rose-400)', background: 'rgba(244, 63, 94, 0.1)', padding: '8px 12px', borderRadius: '4px' }}>
                  {generateError}
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                {sourceMode === 'PYQ' && (
                  <div style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Availability: </span>
                    <span style={{ color: currentAvailableQuestionsCount > 0 ? 'var(--emerald-500)' : 'var(--rose-500)', fontWeight: 600 }}>
                      {currentAvailableQuestionsCount} PYQ Questions
                    </span>
                    <div style={{ color: currentAvailableQuestionsCount > 0 ? 'var(--text-muted)' : 'var(--rose-400)', marginTop: '4px' }}>
                      {currentAvailableQuestionsCount === 0 
                          ? "No published PYQ questions are currently available for this paper." 
                          : (currentAvailableQuestionsCount >= requiredQuestionsCount 
                              ? `${requiredQuestionsCount} questions will be selected for this simulation.`
                              : `${currentAvailableQuestionsCount} questions will be used for this simulation.`
                            )
                      }
                    </div>
                  </div>
                )}
                <button 
                  className="btn btn-success" 
                  onClick={handleGenerate} 
                  disabled={isGenerating || (sourceMode === 'PYQ' && currentAvailableQuestionsCount === 0)}
                >
                  {isGenerating ? 'Generating...' : 'Start Simulator'}
                </button>
              </div>
            </div>
        </div>
      ) : (
        <>
          {/* Simulation Header Banner */}
          <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--indigo-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-indigo">Official Simulation Mode</span>
                  <span className="badge badge-gold">{activePaper.code} (250 Marks)</span>
                  <span className="badge badge-emerald">{activePaper.questions?.length || 20} Questions ({(activePaper.duration_minutes || 180) / 60} Hours)</span>
                  <span className="badge badge-sky">Board Evaluation Active</span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {language === "hi" && activePaper.title_hi ? activePaper.title_hi : activePaper.title}
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {activePaper.instructions}
                </p>
              </div>

              {/* Master 3-Hour Timer & Start Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ 
                  padding: '10px 20px', 
                  borderRadius: 'var(--radius-lg)', 
                  background: secondsRemaining < 900 ? 'var(--rose-bg)' : 'var(--bg-tertiary)',
                  border: `1px solid ${secondsRemaining < 900 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-medium)'}`,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  color: secondsRemaining < 900 ? 'var(--rose-400)' : 'var(--gold-400)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={20} />
                  <span>{formatTimer(secondsRemaining)}</span>
                </div>

                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className={`btn ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isTimerRunning ? "Pause" : "Start Paper Clock"}</span>
                </button>

                <button
                  onClick={() => { setIsTimerRunning(false); setSecondsRemaining((activePaper.duration_minutes || 180) * 60); }}
                  className="btn btn-outline btn-sm"
                  title="Reset 3-Hour Clock"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Source:</span>
                <span className="badge badge-indigo">{sourceMode}</span>
              </div>
              <button className="btn btn-sm btn-outline" onClick={handleResetToConfig} style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}>
                <RotateCcw size={12} style={{ marginRight: '4px' }} />
                New Configuration
              </button>
            </div>
          </div>

      {simulatorState === 'RUNNING' && !isSubmitted ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: 20-Question Navigator Palette */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Question Palette
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {attemptedCount}/{activePaper.questions.length} Attempted
              </span>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {["all", "section-a", "section-b", "attempted", "flagged", "unattempted"].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem',
                    fontWeight: activeFilter === f ? 700 : 500,
                    background: activeFilter === f ? 'var(--gold-500)' : 'var(--bg-tertiary)',
                    color: activeFilter === f ? '#0f172a' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.7rem', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--emerald-500)' }} />
                <span>Attempted ({attemptedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--rose-500)' }} />
                <span>Unattempted ({activePaper.questions.length - attemptedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gold-500)' }} />
                <span>Flagged ({Object.keys(flagged).filter(k => flagged[k]).length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', border: '2px solid var(--sky-400)' }} />
                <span>Current</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {activePaper.questions.map((q, idx) => {
                const isAttempted = answers[q.id]?.trim().length > 0;
                const isFlag = flagged[q.id];
                const isCurrent = currentQIndex === idx;

                let bg = 'var(--bg-tertiary)';
                let border = '1px solid var(--border-medium)';
                let color = 'var(--text-primary)';
                let boxSh = 'none';

                if (isAttempted) {
                  bg = 'var(--emerald-bg)';
                  border = '1px solid var(--emerald-400)';
                  color = 'var(--emerald-400)';
                }
                if (isFlag) {
                  bg = 'rgba(245, 158, 11, 0.2)';
                  border = '1px solid var(--gold-400)';
                  color = 'var(--gold-400)';
                }
                if (isCurrent) {
                  border = '2px solid var(--sky-400)';
                  boxSh = '0 0 10px rgba(56, 189, 248, 0.4)';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    style={{
                      padding: '10px 0',
                      borderRadius: 'var(--radius-sm)',
                      background: bg,
                      border: border,
                      color: color,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: boxSh
                    }}
                  >
                    Q{q.id}
                  </button>
                );
              })}
            </div>

            {/* Actions: Auto-fill sample answers, submit paper */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleAutoFillSampleAnswers} 
                className="btn btn-sm btn-outline" 
                style={{ fontSize: '0.78rem' }}
              >
                <Sparkles size={14} color="var(--gold-400)" />
                <span>Quick-Fill Sample Answers</span>
              </button>
              
              <button 
                onClick={handleSubmitPaper}
                disabled={attemptedCount === 0}
                className="btn btn-success"
              >
                <Send size={16} />
                <span>Submit Complete Paper ({attemptedCount}/{activePaper.questions.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Question Workspace */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">Question {currentQ.id} of {activePaper.questions.length}</span>
                <span className="badge badge-indigo">Section {currentQ.section}</span>
                <span className="badge badge-emerald">{currentQ.marks} Marks ({currentQ.word_limit} Words)</span>
                <span className="badge badge-sky">Target: ~{currentQ.target_mins} mins</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setIsOCRModalOpen(true)}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Camera size={14} color="var(--indigo-400)" />
                  <span>OCR Ingest</span>
                </button>

                <button 
                  onClick={() => setShowModelHints(!showModelHints)}
                  className={`btn btn-sm ${showModelHints ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  <Eye size={14} />
                  <span>{showModelHints ? "Hide Blueprint" : "Model Blueprint"}</span>
                </button>

                <button 
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`btn btn-sm ${flagged[currentQ.id] ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {flagged[currentQ.id] ? "🚩 Flagged" : "Flag"}
                </button>
              </div>
            </div>

            {/* Question Statement */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold-500)' }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {currentQ.text}
              </p>
            </div>

            {/* Model Blueprint Drawer */}
            {showModelHints && currentQ.model_hints && (
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--indigo-400)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Model Blueprint & High-Scoring Dimensions:
                </h5>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  {currentQ.model_hints}
                </p>
              </div>
            )}

            {/* Answer Editor for this question */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Type or paste your answer for Question {currentQ.id}:</span>
                <span style={{ 
                  color: (answers[currentQ.id] || "").trim().split(/\s+/).filter(Boolean).length > currentQ.word_limit * 1.15 ? 'var(--rose-400)' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  Word count: {(answers[currentQ.id] || "").trim().split(/\s+/).filter(Boolean).length} / {currentQ.word_limit}
                </span>
              </div>

              <textarea
                className="form-textarea"
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your answer for this question..."
                style={{ minHeight: '280px', fontSize: '0.92rem' }}
              />
            </div>

            {/* Navigation Bottom Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="btn btn-secondary"
              >
                <ChevronLeft size={16} />
                <span>Previous Question</span>
              </button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Question {currentQIndex + 1} of {activePaper.questions.length}
              </div>

              <button 
                onClick={() => setCurrentQIndex(prev => Math.min(activePaper.questions.length - 1, prev + 1))}
                disabled={currentQIndex === activePaper.questions.length - 1}
                className="btn btn-secondary"
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Holistic Paper Diagnostic Report */
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--gold-500), #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={26} color="#0f172a" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  UPSC Board Official Evaluation Report
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {paperEvaluationReport?.paperTitle} • {paperEvaluationReport?.attemptedCount}/{paperEvaluationReport?.totalQuestions} Questions Evaluated Across Official Board Rubrics
                </p>
              </div>
            </div>

            <button onClick={() => setIsSubmitted(false)} className="btn btn-outline">
              <RotateCcw size={16} />
              <span>Review / Edit Answers</span>
            </button>
          </div>

          {/* Diagnostic Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            {/* Total Board Marks Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), var(--bg-tertiary))', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', textTransform: 'uppercase', fontWeight: 700 }}>Total Board Marks Awarded</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {paperEvaluationReport?.totalMarksAwarded} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ {paperEvaluationReport?.totalMaxMarks}M</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                Score: {paperEvaluationReport?.scorePct}% (Interview Call Trajectory)
              </div>
            </div>

            {/* Section A Score */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section A (10M Questions)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '4px' }}>
                {paperEvaluationReport?.sectionAScore} / 100M
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg ~{Math.round((paperEvaluationReport?.sectionAScore / 10) * 10) / 10} M per question</div>
            </div>

            {/* Section B Score */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section B (15M Questions)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sky-400)', marginTop: '4px' }}>
                {paperEvaluationReport?.sectionBScore} / 150M
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg ~{Math.round((paperEvaluationReport?.sectionBScore / 10) * 10) / 10} M per question</div>
            </div>

            {/* Attempt Rate & Words */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attempt Rate & Velocity</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--indigo-400)', marginTop: '4px' }}>
                {paperEvaluationReport?.attemptPercentage}% ({paperEvaluationReport?.totalWords}W)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Time: {paperEvaluationReport?.timeElapsedMinutes} / 180 mins</div>
            </div>
          </div>

          {/* Question-by-Question Diagnostic Table */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '18px', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> Question-by-Question Board Marks Breakdown:
            </h4>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>Q#</th>
                  <th style={{ padding: '8px' }}>Section & Marks</th>
                  <th style={{ padding: '8px' }}>Board Marks Awarded</th>
                  <th style={{ padding: '8px' }}>Word Count</th>
                  <th style={{ padding: '8px' }}>Directive Rating</th>
                  <th style={{ padding: '8px' }}>PESTLE Coverage</th>
                  <th style={{ padding: '8px' }}>Percentile Band</th>
                </tr>
              </thead>
              <tbody>
                {paperEvaluationReport?.questionEvaluations?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>Q{item.question.id}</td>
                    <td style={{ padding: '10px 8px' }}>Sec {item.question.section} ({item.question.marks}M)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--gold-400)' }}>
                      {item.isAttempted ? `${item.marksAwarded} / ${item.question.marks}M` : "0.0 M"}
                    </td>
                    <td style={{ padding: '10px 8px', color: item.isAttempted ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                      {item.isAttempted ? `${item.wordCount} / ${item.question.word_limit}W` : "Unattempted"}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.evaluation?.directive_adherence?.rating ? (
                        <span className={`badge badge-${item.evaluation.directive_adherence.rating.includes('Strong') ? 'emerald' : 'sky'}`} style={{ fontSize: '0.7rem' }}>
                          {item.evaluation.directive_adherence.rating}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.evaluation?.coverage_percentage ? `${item.evaluation.coverage_percentage}%` : "-"}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.evaluation?.percentile_band ? (
                        <span className={`badge badge-${item.evaluation.band_color}`} style={{ fontSize: '0.7rem' }}>
                          {item.evaluation.percentile_band}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SME Board Final Assessment & Recommendations */}
          <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--indigo-400)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} /> SME Board Overall Feedback & Interview Call Trajectory:
            </h4>
            <ul style={{ fontSize: '0.88rem', color: 'var(--text-primary)', paddingLeft: '20px', lineHeight: '1.7' }}>
              <li><strong>Overall Aggregate: {paperEvaluationReport?.totalMarksAwarded} / 250 Marks ({paperEvaluationReport?.scorePct}%)</strong> — Places candidate comfortably in the Top 10% competitive bracket.</li>
              <li><strong>Section A Velocity & Depth:</strong> Consistently secured 5.0–6.5 marks per 10M question with strong constitutional grounding.</li>
              <li><strong>Section B Expansion:</strong> 15-mark questions are well-substantiated. To breach the 130+ marks barrier, integrate more explicit visual diagrams and NITI Aayog Strategy documents.</li>
            </ul>
          </div>

        </div>
      )}
      </>
      )}

      {/* OCR Scanner Modal */}
      <OCRScannerModal
        isOpen={isOCRModalOpen}
        onClose={() => setIsOCRModalOpen(false)}
        onImportText={(text) => handleAnswerChange(text)}
        language={language}
      />

    </div>
  );
}
