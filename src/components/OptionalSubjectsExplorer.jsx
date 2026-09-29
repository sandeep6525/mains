import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  PenTool, 
  Search,
  Layers,
  Sparkles,
  TrendingUp,
  Filter,
  Calendar,
  Clock,
  Flame,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { OPTIONAL_SUBJECTS } from '../data/optionalsData';
import { TEN_YEAR_PAPERS } from '../data/tenYearsPyqData';

export default function OptionalSubjectsExplorer({ onSelectQuestionForPractice, language }) {
  const [selectedOptionalId, setSelectedOptionalId] = useState("economics");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionTab, setActiveSectionTab] = useState("pyqs"); // "pyqs" or "overview"
  const [selectedPaperFilter, setSelectedPaperFilter] = useState("all"); // "all", "Paper 1", "Paper 2"
  const [selectedYearFilter, setSelectedYearFilter] = useState("all");

  const categories = [
    { id: "all", label: "All Top 15 Optionals" },
    { id: "Business & Economics", label: "Business & Economics" },
    { id: "Humanities & Social Sciences", label: "Humanities & Social Sciences" },
    { id: "Legal & Governance", label: "Legal & Governance" },
    { id: "STEM & Applied Sciences", label: "STEM & Applied Sciences" }
  ];

  const filteredOptionals = OPTIONAL_SUBJECTS.filter(opt => {
    const matchesCategory = selectedCategory === "all" || opt.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = opt.name.toLowerCase().includes(q) || 
                          opt.code.toLowerCase().includes(q) ||
                          opt.key_thinkers.some(t => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const activeOptional = OPTIONAL_SUBJECTS.find(o => o.id === selectedOptionalId) || filteredOptionals[0] || OPTIONAL_SUBJECTS[0];

  // Match PYQs for the active optional from TEN_YEAR_PAPERS
  const optionalPyqs = TEN_YEAR_PAPERS.filter(q => {
    const matchesCode = q.paper_code === activeOptional.code || 
                        q.optional_id === activeOptional.id ||
                        (q.paper_title && q.paper_title.toLowerCase().includes(activeOptional.name.toLowerCase())) ||
                        (activeOptional.id === "economics" && q.paper_code === "OPT-ECON") ||
                        (activeOptional.id === "psir" && q.paper_code === "OPT-PSIR") ||
                        (activeOptional.id === "sociology" && (q.paper_code === "OPT-SOCIO" || q.paper_code === "OPT-SOC")) ||
                        (activeOptional.id === "philosophy" && q.paper_code === "OPT-PHIL") ||
                        (activeOptional.id === "law" && q.paper_code === "OPT-LAW") ||
                        (activeOptional.id === "pubad" && q.paper_code === "OPT-PUBAD") ||
                        (activeOptional.id === "geography" && q.paper_code === "OPT-GEO") ||
                        (activeOptional.id === "history" && q.paper_code === "OPT-HIST") ||
                        (activeOptional.id === "anthropology" && q.paper_code === "OPT-ANTHRO") ||
                        (activeOptional.id === "commerce" && q.paper_code === "OPT-COMM") ||
                        (activeOptional.id === "psychology" && q.paper_code === "OPT-PSYCH") ||
                        (activeOptional.id === "agriculture" && q.paper_code === "OPT-AGRI") ||
                        (activeOptional.id === "mathematics" && q.paper_code === "OPT-MATH") ||
                        (activeOptional.id === "management" && q.paper_code === "OPT-MGMT") ||
                        (activeOptional.id === "hindi_lit" && q.paper_code === "OPT-HINDI-LIT");
    
    if (!matchesCode) return false;

    const matchesPaper = selectedPaperFilter === "all" || 
                         (selectedPaperFilter === "Paper 1" && (q.paper_type === "Paper 1" || (q.paper_title && q.paper_title.includes("Paper 1")))) ||
                         (selectedPaperFilter === "Paper 2" && (q.paper_type === "Paper 2" || (q.paper_title && q.paper_title.includes("Paper 2"))));

    const matchesYear = selectedYearFilter === "all" || q.year === Number(selectedYearFilter);

    return matchesPaper && matchesYear;
  });

  const handleSelectOptional = (optId) => {
    setSelectedOptionalId(optId);
  };

  const handlePracticeOptional = (questionId) => {
    if (questionId) {
      onSelectQuestionForPractice(questionId);
      return;
    }

    if (activeOptional.id === "economics") {
      onSelectQuestionForPractice("pyq-2024-econ-01");
    } else if (activeOptional.id === "psir") {
      onSelectQuestionForPractice("pyq-2024-psir-01");
    } else if (activeOptional.id === "sociology") {
      onSelectQuestionForPractice("pyq-2024-soc-01");
    } else if (activeOptional.id === "philosophy") {
      onSelectQuestionForPractice("pyq-2024-phil-01");
    } else if (activeOptional.id === "law") {
      onSelectQuestionForPractice("pyq-2024-law-01");
    } else {
      onSelectQuestionForPractice("pyq-2024-gs2-01");
    }
  };

  const years = ["all", 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--gold-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">500 Merit Marks</span>
              <span className="badge badge-emerald">Top 15 Optionals Live & Mapped</span>
              <span className="badge badge-indigo">10-Year PYQ Papers (P1 & P2)</span>
              <span className="badge badge-sky">100% Free Full Access</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {language === "hi" 
                ? "वैकल्पिक विषय: शीर्ष 15 विषय, पिछले 10 वर्षों के प्रश्नपत्र (P1 व P2) एवं विचारक मैट्रिक्स" 
                : "Optional Subjects: Top 15 Optionals, 10-Year Question Papers (P1 & P2) & Thinker Matrix"}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === "hi" 
                ? "अर्थशास्त्र (Economics), PSIR, समाजशास्त्र, दर्शनशास्त्र, विधि, वाणिज्य, नृविज्ञान, इतिहास, भूगोल, मनोविज्ञान, कृषि, गणित, प्रबंधन एवं साहित्य के प्रामाणिक प्रश्न।" 
                : "Authentic Paper 1 & Paper 2 question papers for Economics, PSIR, Sociology, Philosophy, Law, PubAd, Geography, History, Anthropology, Commerce, Psychology, Agriculture, Math, Management, Hindi Lit."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-400)' }}>15</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Optionals</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-400)' }}>P1 & P2</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PYQ Archive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search optionals by name, code, or thinker (e.g. 'Economics', 'PSIR', 'Keynes', 'Rawls', 'Kant', 'Durkheim')..."
            style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* 15 Optional Selection Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filteredOptionals.map(opt => {
            const isSelected = selectedOptionalId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOptional(opt.id)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px', whiteSpace: 'nowrap', fontWeight: isSelected ? 700 : 500 }}
              >
                <Award size={14} />
                <span>{opt.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Header for Active Optional & View Switcher */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--gold-600), var(--gold-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900 }}>
            {activeOptional.code.replace('OPT-', '').slice(0, 3)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activeOptional.name}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeOptional.category} • 500 Marks • Paper 1 & Paper 2</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveSectionTab("pyqs")}
            className={`btn btn-sm ${activeSectionTab === "pyqs" ? 'btn-primary' : 'btn-outline'}`}
          >
            <BookOpen size={14} />
            <span>10-Year Question Papers ({optionalPyqs.length})</span>
          </button>
          <button
            onClick={() => setActiveSectionTab("overview")}
            className={`btn btn-sm ${activeSectionTab === "overview" ? 'btn-primary' : 'btn-outline'}`}
          >
            <Layers size={14} />
            <span>Syllabus & Thinkers Matrix</span>
          </button>
        </div>
      </div>

      {/* 1. Dedicated 10-Year PYQ Papers Section */}
      {activeSectionTab === "pyqs" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Sub-Filters: Paper 1 vs Paper 2 & Year */}
          <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Paper Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paper:</span>
              {["all", "Paper 1", "Paper 2"].map(pf => (
                <button
                  key={pf}
                  onClick={() => setSelectedPaperFilter(pf)}
                  className={`btn btn-sm ${selectedPaperFilter === pf ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem' }}
                >
                  {pf === "all" ? "All Papers (P1 & P2)" : pf}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Year:</span>
              {years.slice(0, 6).map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`btn btn-sm ${selectedYearFilter === yr ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  {yr === "all" ? "All Years" : yr}
                </button>
              ))}
            </div>

          </div>

          {/* Questions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {optionalPyqs.length > 0 ? (
              optionalPyqs.map(q => (
                <div 
                  key={q.id}
                  className="glass-card"
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    gap: '14px',
                    borderLeft: '3px solid var(--gold-500)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-gold">{q.year} UPSC</span>
                        <span className="badge badge-indigo">{q.paper_type || q.paper_code}</span>
                        <span className="badge badge-emerald">{q.marks} Marks ({q.word_limit}W)</span>
                        <span className="badge badge-sky">{q.directive}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <Flame size={13} />
                      <span>{q.subject} • {q.topic_name}</span>
                    </div>

                    <p style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.45' }}>
                      {language === "hi" && q.question_hi ? q.question_hi : q.question_en}
                    </p>

                    {/* Model blueprint hints */}
                    {q.model_hints && (
                      <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--gold-400)' }}>Blueprint Anchors: </strong> {q.model_hints}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      ⏱️ Target: {q.time_mins} mins • {q.repeat_frequency}
                    </span>

                    <button
                      onClick={() => handlePracticeOptional(q.id)}
                      className="btn btn-sm btn-primary"
                    >
                      <PenTool size={14} />
                      <span>Write in Studio</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>No questions match the selected filter. Try selecting 'All Papers' or 'All Years'.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. Syllabus & Thinker Matrix Section */}
      {activeSectionTab === "overview" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left: Overview, Key Thinkers & Sample Question */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-emerald">{activeOptional.status}</span>
                <span className="badge badge-gold">{activeOptional.category}</span>
                <span className="badge badge-sky">{activeOptional.code}</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeOptional.name}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.55' }}>
                {activeOptional.overview}
              </p>
            </div>

            {/* Key Thinkers & Theoretical Frameworks Matrix */}
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} /> Key Thinkers, Economists & Jurists ({activeOptional.key_thinkers.length}):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeOptional.key_thinkers.map((thinker, i) => (
                  <span key={i} className="badge badge-indigo" style={{ fontSize: '0.74rem' }}>
                    {thinker}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured PYQ Question Box */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge badge-gold">{activeOptional.sample_question.year} UPSC PYQ</span>
                  <span className="badge badge-sky">{activeOptional.sample_question.marks} Marks</span>
                  <span className="badge badge-emerald">{activeOptional.sample_question.directive}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱️ 15 mins</span>
              </div>

              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {activeOptional.sample_question.text}
              </p>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => handlePracticeOptional(null)} className="btn btn-sm btn-primary">
                  <PenTool size={14} />
                  <span>Write in Answer Studio</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right: Paper 1 & Paper 2 Detailed Focus Areas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activeOptional.papers.map((p, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>{p.paper}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 600 }}>250 Marks • 3 Hours</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
                  {p.syllabus_focus.map((focus, fIdx) => (
                    <li key={fIdx}>{focus}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
