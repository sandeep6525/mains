import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Clock,
  BookOpen,
  Award,
  UserCheck,
  BarChart3,
  Eye,
  ArrowUpRight,
  AlertTriangle,
  Target,
  Zap,
  HelpCircle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { PYQ_QUESTIONS } from '../data/pyqData';
import { TEN_YEAR_PAPERS } from '../data/tenYearsPyqData';
import { evaluateAnswerSubmission } from '../data/evaluationEngine';
import OCRScannerModal from './OCRScannerModal';
import RevisionWorkspaceModal from './RevisionWorkspaceModal';

// Merge PYQ_QUESTIONS and TEN_YEAR_PAPERS into unified practice question repository
const UNIFIED_QUESTIONS = [
  ...PYQ_QUESTIONS,
  ...TEN_YEAR_PAPERS.map(q => ({
    id: q.id,
    paper_id: `paper-${q.paper_code.toLowerCase()}`,
    paper_code: q.paper_code,
    topic_id: q.topic_id,
    topic_title: `${q.subject}: ${q.topic_name}`,
    year: q.year,
    marks: q.marks,
    word_limit: q.word_limit,
    time_limit_mins: q.time_mins,
    directive: q.directive,
    directive_tip: `Examiner Directive: ${q.directive}. Blueprint Anchors: ${q.model_hints || 'Constitutional, theoretical, and empirical substantiation'}.`,
    question_en: q.question_en,
    question_hi: q.question_hi,
    model_framework: {
      introduction: `Contextualize the core premise of ${q.topic_name} and define key theoretical concepts.`,
      dimensions: [
        {
          name: "Theoretical & Conceptual Anchors",
          points: [
            q.model_hints || "Elucidate primary theoretical perspectives, statutes, or doctrines."
          ]
        },
        {
          name: "Empirical Analysis & Multi-Dimensional Impacts",
          points: [
            "Examine critical structural challenges, governance implications, and contemporary debates."
          ]
        }
      ],
      citations: q.key_articles || ["UPSC Model Framework", "Supreme Court / Institutional Reports"],
      conclusion: "Formulate a balanced, forward-looking synthesis addressing the core directive."
    },
    sample_submission: {
      student_name: "Aspirant Demo Draft",
      submission_date: "2026-09-24",
      status: "Ready for Practice",
      v1_text: `${q.question_en}\n\nI. Introduction:\nThe fundamental question pertains to ${q.topic_name}.\n\nII. Key Arguments:\n1. Core theoretical foundations and structural perspectives.\n2. Critical real-world challenges and empirical implications.\n\nIII. Way Forward & Conclusion:\nA comprehensive, evidence-backed strategy is essential for achieving institutional equilibrium.`
    }
  }))
].filter((q, index, self) => index === self.findIndex(t => t.id === q.id));

export default function AnswerWritingStudio({ 
  selectedQuestionId, 
  setSelectedQuestionId, 
  language 
}) {
  const [activeQuestion, setActiveQuestion] = useState(
    UNIFIED_QUESTIONS.find(q => q.id === selectedQuestionId) || UNIFIED_QUESTIONS[0]
  );
  
  const [inputText, setInputText] = useState("");
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  
  // 360-Degree Evaluation Tab State
  // "risk_audit", "where_missed", "how_to_fix", "pillars_radar", "sme_feedback"
  const [activeEvalTab, setActiveEvalTab] = useState("risk_audit");
  const [activeSmeSubTab, setActiveSmeSubTab] = useState("board_lead"); // board_lead, specialist, mentor, annotations
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState((activeQuestion?.time_limit_mins || 15) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [revisionHistory, setRevisionHistory] = useState([]);

  useEffect(() => {
    if (selectedQuestionId) {
      const q = UNIFIED_QUESTIONS.find(item => item.id === selectedQuestionId);
      if (q) {
        setActiveQuestion(q);
        setTimeLeft((q.time_limit_mins || 15) * 60);
        setIsTimerRunning(false);
        setEvaluationResult(null);
        setInputText("");
      }
    }
  }, [selectedQuestionId]);

  // Timer Tick
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionChange = (qId) => {
    setSelectedQuestionId(qId);
  };

  const handleLoadSampleV1 = () => {
    if (activeQuestion?.sample_submission?.v1_text) {
      setInputText(activeQuestion.sample_submission.v1_text);
    }
  };

  const handleEvaluate = () => {
    if (!inputText.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateAnswerSubmission(inputText, activeQuestion, false);
      setEvaluationResult(result);
      setIsEvaluating(false);
    }, 700);
  };

  const handleSaveRevision = (revisedText, revisionResult) => {
    setRevisionHistory(prev => [
      ...prev,
      {
        version: prev.length + 2,
        text: revisedText,
        evaluation: revisionResult,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setInputText(revisedText);
    setEvaluationResult(revisionResult);
  };

  const words = inputText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const targetWords = activeQuestion?.word_limit || 150;

  // Separate questions into GS vs Optionals for clean dropdown grouping
  const gsQuestions = UNIFIED_QUESTIONS.filter(q => !q.paper_code.startsWith('OPT-'));
  const optionalQuestions = UNIFIED_QUESTIONS.filter(q => q.paper_code.startsWith('OPT-'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Active Question Selector & Timer Controls */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
              {activeQuestion.paper_code}
            </span>
            <span className="badge badge-indigo">
              {activeQuestion.year} UPSC CSE
            </span>
            <span className="badge badge-emerald">
              {activeQuestion.marks} Marks ({activeQuestion.word_limit} Words)
            </span>
            <span className="badge badge-sky">
              Directive: {activeQuestion.directive}
            </span>
          </div>

          {/* Question Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === "hi" ? "प्रश्न चुनें:" : "Select Question:"}
            </label>
            <select
              className="form-select"
              value={activeQuestion.id}
              onChange={(e) => handleQuestionChange(e.target.value)}
              style={{ flex: 1, width: '100%', maxWidth: '320px', padding: '6px 12px', fontSize: '0.82rem', textOverflow: 'ellipsis' }}
            >
              <optgroup label="General Studies (GS I - IV & Essay)">
                {gsQuestions.map(q => (
                  <option key={q.id} value={q.id}>
                    [{q.paper_code}] {q.year} - {q.topic_title} ({q.marks}M)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Top 15 Optional Papers (Paper 1 & Paper 2)">
                {optionalQuestions.map(q => (
                  <option key={q.id} value={q.id}>
                    [{q.paper_code}] {q.year} - {q.topic_title} ({q.marks}M)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

        </div>

        {/* Question Statement */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.45' }}>
            {language === "hi" && activeQuestion.question_hi ? activeQuestion.question_hi : activeQuestion.question_en}
          </h2>
          {activeQuestion.directive_tip && (
            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>{activeQuestion.directive_tip}</span>
            </div>
          )}
        </div>

        {/* Action Bar: Timer, OCR Mode, Sample Loader */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          
          {/* Timer Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              borderRadius: 'var(--radius-md)', 
              background: timeLeft < 60 ? 'var(--rose-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${timeLeft < 60 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-medium)'}`,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: timeLeft < 60 ? 'var(--rose-400)' : 'var(--text-primary)'
            }}>
              <Clock size={16} color={timeLeft < 60 ? 'var(--rose-400)' : 'var(--gold-400)'} />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className={`btn btn-sm ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isTimerRunning ? "Pause" : "Start Clock"}</span>
            </button>

            <button 
              onClick={() => { setIsTimerRunning(false); setTimeLeft((activeQuestion?.time_limit_mins || 15) * 60); }} 
              className="btn btn-sm btn-outline"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Quick Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setIsOCRModalOpen(true)} 
              className="btn btn-sm btn-secondary"
            >
              <Camera size={15} color="var(--indigo-400)" />
              <span>{language === "hi" ? "हस्तलिखित OCR स्कैन" : "Scan Handwritten Sheet"}</span>
            </button>

            <button 
              onClick={handleLoadSampleV1} 
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              <FileText size={14} color="var(--gold-400)" />
              <span>{language === "hi" ? "नमूना उत्तर लोड करें" : "Load Sample Draft"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace: Answer Editor & 360-Degree Evaluation Guidance */}
      <div style={{ display: 'grid', gridTemplateColumns: evaluationResult ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
        
        {/* Left Column: Answer Editor */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PenTool size={18} color="var(--gold-400)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {language === "hi" ? "उत्तर लेखन क्षेत्र" : "Answer Workspace"}
              </h3>
            </div>

            {/* Word Count Indicator */}
            <div style={{ fontSize: '0.85rem', color: wordCount > targetWords * 1.15 ? 'var(--rose-400)' : 'var(--text-secondary)' }}>
              <strong>{wordCount}</strong> / {targetWords} Words
              {wordCount > targetWords * 1.15 && <span style={{ marginLeft: '6px', fontSize: '0.75rem' }}>(Over limit)</span>}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="form-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === "hi" 
              ? "यहां अपना उत्तर लिखें... (भूमिका, मुख्य भाग, सर्वोच्च न्यायालय के निर्णय/समितियां/विचारक और निष्कर्ष)..." 
              : "Type your UPSC answer here... (Introduction, Body with sub-headings & diagrams/cases, Substantiation, and Conclusion)..."}
            rows={16}
            style={{ 
              fontFamily: 'inherit', 
              fontSize: '0.95rem', 
              lineHeight: '1.6', 
              resize: 'vertical',
              minHeight: '300px'
            }}
          />

          {/* Submission Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">UPSC QCAB Format</span>
              <span className="badge badge-indigo">360° AI Evaluation Suite</span>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !inputText.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontWeight: 700 }}
            >
              <Sparkles size={16} />
              <span>{isEvaluating ? "Evaluating 360°..." : "Evaluate Answer (360° Board Suite)"}</span>
            </button>
          </div>

        </div>

        {/* Right Column: 360-Degree Board Evaluation Intelligence Suite */}
        {evaluationResult && (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header: Score, 360 Index & Risk Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge badge-gold">UPSC Board Evaluation</span>
                  <span className={`badge badge-${evaluationResult.risk_analysis.badge_color}`}>
                    {evaluationResult.risk_analysis.risk_level}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--gold-400)' }}>
                  {evaluationResult.awarded_marks} / {evaluationResult.max_marks} Marks
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>
                    360° Index: {evaluationResult.overall_360_index}/100
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Trajectory: {evaluationResult.percentile_band}
                </div>
              </div>
            </div>

            {/* Sub-Scores Sectional Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Intro Hook</div>
                <div style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '0.85rem' }}>{evaluationResult.sectional_scores.introduction}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Body Structure</div>
                <div style={{ fontWeight: 700, color: 'var(--sky-400)', fontSize: '0.85rem' }}>{evaluationResult.sectional_scores.body_structure}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Substantiation</div>
                <div style={{ fontWeight: 700, color: 'var(--indigo-400)', fontSize: '0.85rem' }}>{evaluationResult.sectional_scores.substantiation}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Conclusion</div>
                <div style={{ fontWeight: 700, color: 'var(--emerald-400)', fontSize: '0.85rem' }}>{evaluationResult.sectional_scores.conclusion}</div>
              </div>
            </div>

            {/* 360-Degree Navigation Tabs */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
              <button
                onClick={() => setActiveEvalTab("risk_audit")}
                className={`btn btn-sm ${activeEvalTab === "risk_audit" ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
              >
                <AlertTriangle size={13} />
                <span>1. Failure Risk Audit</span>
              </button>
              <button
                onClick={() => setActiveEvalTab("where_missed")}
                className={`btn btn-sm ${activeEvalTab === "where_missed" ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
              >
                <Target size={13} />
                <span>2. Where Missed & Why</span>
              </button>
              <button
                onClick={() => setActiveEvalTab("how_to_fix")}
                className={`btn btn-sm ${activeEvalTab === "how_to_fix" ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
              >
                <Zap size={13} />
                <span>3. How to Fix (Topper Plan)</span>
              </button>
              <button
                onClick={() => setActiveEvalTab("pillars_radar")}
                className={`btn btn-sm ${activeEvalTab === "pillars_radar" ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
              >
                <BarChart3 size={13} />
                <span>4. 360° Multi-Pillar Scorecard</span>
              </button>
              <button
                onClick={() => setActiveEvalTab("sme_feedback")}
                className={`btn btn-sm ${activeEvalTab === "sme_feedback" ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
              >
                <UserCheck size={13} />
                <span>5. SME Persona Audit</span>
              </button>
            </div>

            {/* TAB 1: FAILURE RISK AUDIT */}
            {activeEvalTab === "risk_audit" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Failure Probability Alert Box */}
                <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} color="var(--rose-400)" />
                      <strong style={{ fontSize: '0.88rem', color: 'var(--rose-400)' }}>
                        Examiner Penalty Risk Profile: {evaluationResult.risk_analysis.failure_probability_pct}%
                      </strong>
                    </div>
                    <span className="badge badge-rose">{evaluationResult.risk_analysis.risk_level}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {evaluationResult.sme_feedback.board_lead_examiner.examiner_psychology_tip}
                  </p>
                </div>

                {/* Identified Failure Vulnerabilities */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px' }}>
                    Critical Penalty Factors Triggered ({evaluationResult.risk_analysis.vulnerabilities.length}):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {evaluationResult.risk_analysis.vulnerabilities.length > 0 ? (
                      evaluationResult.risk_analysis.vulnerabilities.map((vuln, vIdx) => (
                        <div key={vIdx} style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--rose-500)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{vuln.type}</strong>
                            <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>{vuln.impact}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '4px' }}>
                            {vuln.description}
                          </p>
                          <div style={{ fontSize: '0.74rem', color: 'var(--gold-400)', fontStyle: 'italic' }}>
                            <strong>Examiner Reaction: </strong>"{vuln.how_examiner_views_it}"
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', color: 'var(--emerald-400)', fontSize: '0.84rem' }}>
                        ✓ Zero critical penalty vulnerabilities detected! Answer exhibits high-order topper characteristics.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: WHERE THEY MISSED & ROOT CAUSE */}
            {activeEvalTab === "where_missed" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Primary Failure Mode Diagnostic */}
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--indigo-400)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={15} /> Primary Cognitive Blindspot Identified:
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                    {evaluationResult.root_cause_analysis.primary_failure_mode}
                  </p>
                </div>

                {/* Missed Authoritative Precedents */}
                <div>
                  <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '6px' }}>
                    Omitted Statutory & Case Law Precedents:
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {evaluationResult.root_cause_analysis.missed_authoritative_anchors.map((anchor, aIdx) => (
                      <span key={aIdx} className="badge badge-rose" style={{ fontSize: '0.74rem' }}>
                        + Missed: {anchor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missed Dimensions */}
                <div>
                  <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--sky-400)', marginBottom: '6px' }}>
                    Omitted Multidimensional Angles:
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {evaluationResult.root_cause_analysis.missed_key_dimensions.map((dim, dIdx) => (
                      <span key={dIdx} className="badge badge-indigo" style={{ fontSize: '0.74rem' }}>
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cognitive Traps List */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Why Candidates Miss These Points Under Pressure:
                  </h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    {evaluationResult.root_cause_analysis.cognitive_blindspots.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* TAB 3: HOW TO FIX & TOPPER BLUEPRINT */}
            {activeEvalTab === "how_to_fix" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 4-Phase Step-by-Step Fix Plan */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={15} /> 4-Phase Score Leap Blueprint (+2.0 to +3.5 Marks):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Phase 1 (Intro Hook): </strong>{evaluationResult.remedial_blueprint.phase_1_immediate_fix}</div>
                    <div><strong>Phase 2 (Body Overhaul): </strong>{evaluationResult.remedial_blueprint.phase_2_body_overhaul}</div>
                    <div><strong>Phase 3 (Evidence Injection): </strong>{evaluationResult.remedial_blueprint.phase_3_evidence_injection}</div>
                    <div><strong>Phase 4 (Visionary Synthesis): </strong>{evaluationResult.remedial_blueprint.phase_4_conclusion_upgrade}</div>
                  </div>
                </div>

                {/* Before vs After Sentence Transformation */}
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid var(--emerald-500)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald-400)', marginBottom: '6px' }}>
                    Before vs. After Sentence Rephrasing Demo:
                  </h5>
                  <div style={{ fontSize: '0.78rem', color: 'var(--rose-400)', marginBottom: '4px' }}>
                    <strong>Weak Candidate Phrasing: </strong>"{evaluationResult.remedial_blueprint.sentence_transformation_demo.before_candidate_draft}"
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', fontWeight: 600, marginBottom: '6px' }}>
                    <strong>Topper Masterpiece: </strong>"{evaluationResult.remedial_blueprint.sentence_transformation_demo.after_topper_rewrite}"
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <em>Rationale: {evaluationResult.remedial_blueprint.sentence_transformation_demo.why_it_scores_more}</em>
                  </div>
                </div>

                {/* Topper Gold Booster Lines */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '6px' }}>
                    Topper Gold Booster Lines (Plug-and-Play Sentences):
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {evaluationResult.remedial_blueprint.topper_gold_booster_lines.map((line, lIdx) => (
                      <div key={lIdx} style={{ fontSize: '0.76rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: 'var(--radius-xs)', borderLeft: '2px solid var(--gold-400)' }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Micro-Diagram Generator Blueprint */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--indigo-400)' }}>{evaluationResult.value_add_diagram.title}</strong>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>{evaluationResult.value_add_diagram.benefit}</span>
                  </div>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold-400)', overflowX: 'auto', background: '#0a0f1d', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                    {evaluationResult.value_add_diagram.suggested_diagram}
                  </pre>
                </div>

              </div>
            )}

            {/* TAB 4: 360° MULTI-PILLAR RADAR */}
            {activeEvalTab === "pillars_radar" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  
                  {/* Pillar 1 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Directive Precision</span>
                      <strong style={{ color: 'var(--gold-400)' }}>{evaluationResult.pillars_360.directive_precision}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.directive_precision}%`, height: '100%', background: 'var(--gold-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Authority & Evidence</span>
                      <strong style={{ color: 'var(--indigo-400)' }}>{evaluationResult.pillars_360.substantive_authority}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.substantive_authority}%`, height: '100%', background: 'var(--indigo-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Multidimensional PESTLE</span>
                      <strong style={{ color: 'var(--sky-400)' }}>{evaluationResult.pillars_360.multidimensional_pestle}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.multidimensional_pestle}%`, height: '100%', background: 'var(--sky-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Examiner Impression</span>
                      <strong style={{ color: 'var(--emerald-400)' }}>{evaluationResult.pillars_360.examiner_impression_index}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.examiner_impression_index}%`, height: '100%', background: 'var(--emerald-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Pillar 5 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Visual Scannability</span>
                      <strong style={{ color: 'var(--gold-400)' }}>{evaluationResult.pillars_360.visual_scannability}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.visual_scannability}%`, height: '100%', background: 'var(--gold-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Pillar 6 */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Visionary Synthesis</span>
                      <strong style={{ color: 'var(--emerald-400)' }}>{evaluationResult.pillars_360.visionary_synthesis}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${evaluationResult.pillars_360.visionary_synthesis}%`, height: '100%', background: 'var(--emerald-500)', borderRadius: '3px' }} />
                    </div>
                  </div>

                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>360° Diagnostic Verdict: </strong>
                  {evaluationResult.overall_360_index >= 75
                    ? "Candidate exhibits exceptional multidimensional equilibrium. Focus on conserving time discipline during full mock simulations."
                    : "Candidate suffers from substantiation and structural deficits. Follow the 4-Phase Remedial Blueprint in Tab 3 to leap into topper bracket."}
                </div>
              </div>
            )}

            {/* TAB 5: MULTI-PERSONA SME GUIDANCE */}
            {activeEvalTab === "sme_feedback" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* SME Sub-tabs */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <button
                    onClick={() => setActiveSmeSubTab("board_lead")}
                    className={`btn btn-sm ${activeSmeSubTab === "board_lead" ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Board Lead Examiner
                  </button>
                  <button
                    onClick={() => setActiveSmeSubTab("specialist")}
                    className={`btn btn-sm ${activeSmeSubTab === "specialist" ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Domain Specialist
                  </button>
                  <button
                    onClick={() => setActiveSmeSubTab("mentor")}
                    className={`btn btn-sm ${activeSmeSubTab === "mentor" ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Revision Mentor
                  </button>
                  <button
                    onClick={() => setActiveSmeSubTab("annotations")}
                    className={`btn btn-sm ${activeSmeSubTab === "annotations" ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Paragraph Annotations
                  </button>
                </div>

                {/* Sub-tab content */}
                <div style={{ fontSize: '0.86rem', lineHeight: '1.5', minHeight: '120px' }}>
                  {activeSmeSubTab === "board_lead" && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '4px' }}>
                        {evaluationResult.sme_feedback.board_lead_examiner.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {evaluationResult.sme_feedback.board_lead_examiner.verdict}
                      </p>
                      <div style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                        <strong>Examiner Psychology: </strong>{evaluationResult.sme_feedback.board_lead_examiner.examiner_psychology_tip}
                      </div>
                    </div>
                  )}

                  {activeSmeSubTab === "specialist" && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--indigo-400)', marginBottom: '4px' }}>
                        {evaluationResult.sme_feedback.domain_specialist.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {evaluationResult.sme_feedback.domain_specialist.technical_critique}
                      </p>
                      <div>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--gold-400)' }}>Authoritative Grounding:</strong>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {evaluationResult.sme_feedback.domain_specialist.recommended_precedents.map((p, i) => (
                            <span key={i} className="badge badge-sky" style={{ fontSize: '0.72rem' }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSmeSubTab === "mentor" && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--emerald-400)', marginBottom: '4px' }}>
                        {evaluationResult.sme_feedback.revision_mentor.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {evaluationResult.sme_feedback.revision_mentor.score_leap_strategy}
                      </p>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--gold-400)' }}>
                        <strong>Action Drill: </strong>{evaluationResult.sme_feedback.revision_mentor.practical_drill}
                      </div>
                    </div>
                  )}

                  {activeSmeSubTab === "annotations" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {evaluationResult.paragraph_annotations.map((ann, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${ann.severity === 'high' ? 'var(--rose-500)' : ann.severity === 'good' ? 'var(--emerald-500)' : 'var(--gold-500)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700 }}>
                            <span>{ann.section}</span>
                            <span style={{ color: ann.severity === 'good' ? 'var(--emerald-400)' : 'var(--gold-400)' }}>{ann.status}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{ann.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Launch Iterative Revision Action Footer */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} />
                <span>Fix identified failure risks & verify score leap</span>
              </div>

              <button
                onClick={() => setIsRevisionModalOpen(true)}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))', borderColor: 'var(--emerald-500)', padding: '8px 18px', fontWeight: 700 }}
              >
                <TrendingUp size={16} />
                <span>Launch Iterative Revision (Draft v2)</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* OCR Scanner Modal */}
      {isOCRModalOpen && (
        <OCRScannerModal
          isOpen={isOCRModalOpen}
          onClose={() => setIsOCRModalOpen(false)}
          onTextExtracted={(text) => {
            setInputText(text);
            setIsOCRModalOpen(false);
          }}
          language={language}
        />
      )}

      {/* Revision Workspace Modal */}
      {isRevisionModalOpen && (
        <RevisionWorkspaceModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          activeQuestion={activeQuestion}
          v1Text={inputText}
          v1Evaluation={evaluationResult}
          onSaveRevision={handleSaveRevision}
          language={language}
        />
      )}

    </div>
  );
}
