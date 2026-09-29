import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function MasteryAnalytics({ language, onNavigateToPractice }) {
  const paperProgress = [
    { code: "Essay (Paper I)", title: "Philosophical & Socio-Economic", progress: 85, color: "var(--gold-500)", answers: 14 },
    { code: "GS-I (Paper II)", title: "Heritage, History, Geography, Society", progress: 72, color: "var(--emerald-500)", answers: 26 },
    { code: "GS-II (Paper III)", title: "Governance, Constitution, Polity, IR", progress: 88, color: "var(--indigo-500)", answers: 38 },
    { code: "GS-III (Paper IV)", title: "Economy, Agriculture, S&T, Environment", progress: 68, color: "var(--sky-500)", answers: 22 },
    { code: "GS-IV (Paper V)", title: "Ethics, Integrity, Aptitude & Cases", progress: 79, color: "var(--rose-500)", answers: 19 },
    { code: "Optional Subject", title: "Paper 1 & Paper 2 (500 Marks)", progress: 64, color: "#a855f7", answers: 15 }
  ];

  const directiveMastery = [
    { directive: "Critically Analyze", mastery: "88%", status: "Exemplary", desc: "Consistently balances pro/con arguments with structural limitations." },
    { directive: "Examine", mastery: "82%", status: "Strong", desc: "Probes deep into underlying causes and legal provisions." },
    { directive: "Discuss", mastery: "94%", status: "Mastered", desc: "Broad multidimensional PESTLE coverage." },
    { directive: "Evaluate", mastery: "71%", status: "Needs Practice", desc: "Sometimes omits specific criteria-based judgment." },
    { directive: "Elucidate / Comment", mastery: "85%", status: "Strong", desc: "Clarifies core quote with relevant historical anecdotes." }
  ];

  const remedialTasks = [
    {
      id: "rem-1",
      paper: "GS-II (Polity)",
      gap: "Judicial Appointments & Federal Commissions",
      action: "Review Sarkaria & Punchhi recommendations on Article 163 and write 1 practice answer on Governor's role.",
      difficulty: "High Yield",
      time: "15 mins"
    },
    {
      id: "rem-2",
      paper: "GS-III (Economy)",
      gap: "Semiconductor GVCs & Industrial Policy",
      action: "Incorporate PLI scheme data and India Semiconductor Mission metrics into S&T answers.",
      difficulty: "Medium Yield",
      time: "10 mins"
    },
    {
      id: "rem-3",
      paper: "GS-IV (Ethics)",
      gap: "Deontological vs Consequentialist Frameworks",
      action: "Apply Kantian Categorical Imperative explicitly in administrative dilemma case studies.",
      difficulty: "High Yield",
      time: "20 mins"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--sky-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-sky">360° Real-time Feedback Loop</span>
              <span className="badge badge-emerald">Continuous Improvement Record</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {language === "hi" ? "व्यक्तिगत मुख्य परीक्षा विश्लेषिकी एवं दक्षता ट्रैकर" : "Personalized Mains Mastery & Gap Analytics Dashboard"}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === "hi" 
                ? "पाठ्यक्रम पूर्णता, निर्देश दक्षता, शब्द सीमा प्रबंधन एवं लक्षित उपचारात्मक कार्य" 
                : "Tracking syllabus coverage, directive proficiency, writing velocity, and dynamic gap remediation."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'center', padding: '10px 18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-400)' }}>134</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Answers Evaluated</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>+24%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Revision Delta Leap</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Syllabus Progress (Left) & Directive Mastery (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left: Paper-Wise Syllabus Coverage */}
        <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--gold-400)" />
              <span>Syllabus Micro-Topic Coverage</span>
            </h3>
            <span className="badge badge-emerald">Overall: 76%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paperProgress.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.code}</span>
                  <span style={{ fontWeight: 700, color: p.color }}>{p.progress}% ({p.answers} answers)</span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress}%`, height: '100%', background: p.color, borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Directive & Command Word Proficiency */}
        <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--indigo-400)" />
              <span>Directive & Command Word Mastery</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {directiveMastery.map((item, idx) => (
              <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.directive}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--emerald-400)' }}>{item.mastery}</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{item.status}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Remedial Recommendations & Next Actions */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--gold-500), #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#0f172a" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              AI-Generated Remedial Action Plan (Demonstrated Gaps)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Prioritized daily drills based on your recent answer writing evaluations and missed dimensions.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {remedialTasks.map(task => (
            <div 
              key={task.id}
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-medium)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-gold">{task.paper}</span>
                  <span className="badge badge-rose">{task.difficulty}</span>
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {task.gap}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {task.action}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱️ {task.time}</span>
                <button onClick={() => onNavigateToPractice("pyq-2024-gs2-01")} className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  <span>Start Drill</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
