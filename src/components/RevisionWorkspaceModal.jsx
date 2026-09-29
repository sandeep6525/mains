import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, ArrowRight, TrendingUp, Award, Layers, HelpCircle, ArrowUpRight, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { evaluateAnswerSubmission } from '../data/evaluationEngine';

export default function RevisionWorkspaceModal({ 
  isOpen, 
  onClose, 
  question, 
  activeQuestion,
  originalEvaluation, 
  v1Evaluation,
  originalText, 
  v1Text,
  sampleV2Text,
  onSaveRevision,
  language 
}) {
  const currentQuestion = question || activeQuestion;
  const currentEvaluation = originalEvaluation || v1Evaluation;
  const currentOriginalText = originalText || v1Text || "";
  const currentV2Sample = sampleV2Text || currentQuestion?.sample_submission?.v2_text || "";

  const [revisedText, setRevisedText] = useState(currentOriginalText);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [revisionEvaluation, setRevisionEvaluation] = useState(null);

  if (!isOpen || !currentQuestion) return null;

  const handleLoadSampleV2 = () => {
    if (currentV2Sample) {
      setRevisedText(currentV2Sample);
    }
  };

  const handleEvaluateRevision = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateAnswerSubmission(revisedText, currentQuestion, true, currentEvaluation);
      setRevisionEvaluation(result);
      setIsEvaluating(false);

      // Trigger celebration if improvement
      if (result.delta_analysis?.mark_jump !== "Maintained" || result.delta_analysis?.coverage_improvement_pct !== "Maintained") {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 600);
  };

  const handleApplyAndFinish = () => {
    if (revisionEvaluation) {
      onSaveRevision(revisedText, revisionEvaluation);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1160px', padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--gold-500), #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#0f172a" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {language === "hi" ? "UPSC 360° बोर्ड संशोधन स्टूडियो (ड्राफ्ट v1 → v2)" : "UPSC 360° Board Revision Studio (Draft v1 → v2 Rewrite)"}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {language === "hi" ? "दोषों एवं विफलता जोखिमों को दूर करें, आधिकारिक अंक एवं पर्सेंटाइल छलांग मापें" : "Eliminate failure vulnerabilities, inject authoritative case laws, and measure your exact numerical mark jump"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline" style={{ borderRadius: 'var(--radius-full)', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Question Prompt Card */}
        <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '18px', borderLeft: '4px solid var(--gold-500)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span className="badge badge-gold">{currentQuestion.paper_code}</span>
            <span className="badge badge-indigo">{currentQuestion.marks} Marks ({currentQuestion.word_limit} Words)</span>
            <span className="badge badge-sky">Directive: {currentQuestion.directive}</span>
          </div>
          <p style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === "hi" && currentQuestion.question_hi ? currentQuestion.question_hi : currentQuestion.question_en}
          </p>
        </div>

        {/* Split Screen Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          
          {/* Left Column: Original Draft & Gaps to Fix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                1. Original Submission (Draft v1)
              </span>
              <span className="badge badge-rose" style={{ fontSize: '0.74rem' }}>
                Score: {currentEvaluation?.awarded_marks || 0} / {currentQuestion.marks}M
              </span>
            </div>

            <div style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-medium)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px', 
              fontSize: '0.86rem', 
              color: 'var(--text-secondary)',
              maxHeight: '160px',
              overflowY: 'auto',
              whiteSpace: 'pre-line'
            }}>
              {currentOriginalText || "No original text entered."}
            </div>

            {/* Diagnostic Action Items & Failure Risks from v1 */}
            <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--rose-400)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} /> Critical Gaps & Penalty Risks to Resolve:
              </h5>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-primary)', paddingLeft: '18px', lineHeight: '1.45' }}>
                {currentEvaluation?.risk_analysis?.vulnerabilities?.slice(0, 2).map((vuln, idx) => (
                  <li key={idx} style={{ marginBottom: '3px' }}><strong>{vuln.type}: </strong>{vuln.impact}</li>
                ))}
                {currentEvaluation?.gaps?.map((gap, idx) => (
                  <li key={`gap-${idx}`} style={{ marginBottom: '3px' }}>{gap}</li>
                ))}
              </ul>
            </div>

            {/* Authoritative Precedents to borrow */}
            {(currentQuestion.model_framework?.citations || currentQuestion.key_articles) && (
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--indigo-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Authoritative Precedents to Inject into Body:
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(currentQuestion.model_framework?.citations || currentQuestion.key_articles || []).map((c, i) => (
                    <span key={i} className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Revision Editor & Delta Measurement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                2. Revised Answer (Draft v2 Rewrite)
              </span>
              {currentV2Sample && (
                <button 
                  onClick={handleLoadSampleV2} 
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.74rem', padding: '2px 8px' }}
                >
                  Load Topper Reference v2
                </button>
              )}
            </div>

            <textarea
              className="form-input"
              value={revisedText}
              onChange={(e) => setRevisedText(e.target.value)}
              placeholder="Refine and structure your answer with sub-headings, authoritative citations, and a balanced conclusion..."
              rows={13}
              style={{ fontSize: '0.88rem', lineHeight: '1.55', minHeight: '220px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Words: {revisedText.trim().split(/\s+/).filter(Boolean).length} / {currentQuestion.word_limit}
              </span>

              <button
                onClick={handleEvaluateRevision}
                disabled={isEvaluating || !revisedText.trim()}
                className="btn btn-sm btn-primary"
              >
                <Sparkles size={14} />
                <span>{isEvaluating ? "Measuring 360° Delta..." : "Measure Delta Score Jump"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Delta Analysis Panel (Appears after evaluating Draft v2) */}
        {revisionEvaluation && revisionEvaluation.delta_analysis && (
          <div className="glass-card" style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid var(--emerald-500)', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--emerald-400)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                  {revisionEvaluation.delta_analysis.overall_verdict}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-gold">
                  Score: {revisionEvaluation.awarded_marks} / {currentQuestion.marks}M
                </span>
                <span className="badge badge-emerald">
                  360° Index: {revisionEvaluation.overall_360_index}/100
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mark Jump</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-400)' }}>
                  {revisionEvaluation.delta_analysis.mark_jump}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score Leap %</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                  {revisionEvaluation.delta_analysis.mark_jump_pct}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Risk Reduction</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sky-400)' }}>
                  {revisionEvaluation.delta_analysis.risk_reduction_pct || "-25% Risk"}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Percentile Shift</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '4px' }}>
                  {revisionEvaluation.delta_analysis.percentile_shift}
                </div>
              </div>
            </div>

            {revisionEvaluation.delta_analysis.newly_added_citations?.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Newly Injected Precedents: </strong>
                {revisionEvaluation.delta_analysis.newly_added_citations.join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>

          <button 
            onClick={handleApplyAndFinish} 
            disabled={!revisionEvaluation}
            className="btn btn-primary"
            style={{ padding: '8px 22px' }}
          >
            <CheckCircle size={16} />
            <span>Apply Draft v2 to Studio & Track Progress</span>
          </button>
        </div>

      </div>
    </div>
  );
}
