import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  PenTool, 
  Calendar,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { CURRENT_AFFAIRS_MAINS_MATRIX } from '../data/currentAffairsData';

export default function CurrentAffairsMatrix({ onSelectQuestionForPractice, language }) {
  const [selectedCAId, setSelectedCAId] = useState(CURRENT_AFFAIRS_MAINS_MATRIX[0].id);
  const [activeTab, setActiveTab] = useState("facts"); // facts, arguments, citations, questions

  const currentCA = CURRENT_AFFAIRS_MAINS_MATRIX.find(ca => ca.id === selectedCAId) || CURRENT_AFFAIRS_MAINS_MATRIX[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--emerald-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald">Dynamic Linkage Engine</span>
              <span className="badge badge-gold">Distinguishing Fact from Argument</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {language === "hi" ? "समसामयिकी → मुख्य परीक्षा सिलेबस मैट्रिक्स" : "Current Affairs → Mains Syllabus Matrix"}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === "hi" 
                ? "दैनिक संपादकीयों का GS I-IV एवं निबंध विषयों से सटीक संबंध, तथ्य एवं तार्किक विश्लेषण" 
                : "Connecting daily editorial developments to official GS I–IV and Essay syllabus topics."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Feed on Left & Editorial Decomposition on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        
        {/* Left Column: Recent Developments Feed */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--gold-400)" />
            <span>{language === "hi" ? "समसामयिक मुद्दे" : "Editorial Dossier"}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CURRENT_AFFAIRS_MAINS_MATRIX.map(ca => {
              const isSelected = selectedCAId === ca.id;
              return (
                <div
                  key={ca.id}
                  onClick={() => setSelectedCAId(ca.id)}
                  style={{
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ca.date}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {ca.linked_papers.map((p, i) => (
                        <span key={i} className="badge badge-indigo" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          {p.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: isSelected ? 'var(--gold-400)' : 'var(--text-primary)', lineHeight: '1.35' }}>
                    {language === "hi" && ca.headline_hi ? ca.headline_hi : ca.headline}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Decomposed Matrix View */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Header */}
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {currentCA.linked_papers.map((p, i) => (
                <span key={i} className="badge badge-gold">{p}</span>
              ))}
              <span className="badge badge-sky">Source: {currentCA.source}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.4' }}>
              {language === "hi" && currentCA.headline_hi ? currentCA.headline_hi : currentCA.headline}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Syllabus Mapping: <strong style={{ color: 'var(--emerald-400)' }}>{currentCA.syllabus_tag}</strong>
            </p>
          </div>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <button
              onClick={() => setActiveTab("facts")}
              className={`btn btn-sm ${activeTab === "facts" ? 'btn-primary' : 'btn-outline'}`}
            >
              <CheckCircle2 size={14} />
              <span>1. Verified Facts ({currentCA.facts_box.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("arguments")}
              className={`btn btn-sm ${activeTab === "arguments" ? 'btn-primary' : 'btn-outline'}`}
            >
              <Scale size={14} />
              <span>2. Multi-Perspective Arguments</span>
            </button>
            <button
              onClick={() => setActiveTab("citations")}
              className={`btn btn-sm ${activeTab === "citations" ? 'btn-primary' : 'btn-outline'}`}
            >
              <FileText size={14} />
              <span>3. Ready Citations</span>
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`btn btn-sm ${activeTab === "questions" ? 'btn-primary' : 'btn-outline'}`}
            >
              <PenTool size={14} />
              <span>4. Potential Mains Questions</span>
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === "facts" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Empirical data points, statutory provisions, and verified chronologies to use in answers:
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentCA.facts_box.map((fact, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "arguments" && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {currentCA.arguments_analysis.map((arg, idx) => (
                <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px' }}>
                    {arg.perspective}
                  </h5>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {arg.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "citations" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ready-to-use constitutional articles, landmark Supreme Court cases, and committee reports:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentCA.ready_citations.map((cite, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="var(--indigo-400)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cite}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentCA.potential_mains_questions.map((pmq, idx) => (
                <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-gold">{pmq.paper_code}</span>
                    <span className="badge badge-indigo">{pmq.marks} Marks ({pmq.word_limit} Words)</span>
                    <span className="badge badge-sky">Directive: {pmq.directive}</span>
                  </div>
                  <p style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.45' }}>
                    {pmq.text}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      onClick={() => onSelectQuestionForPractice("pyq-2024-gs2-01")}
                      className="btn btn-sm btn-primary"
                    >
                      <PenTool size={14} />
                      <span>Write in Answer Studio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
