import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  PenTool, 
  Clock, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  BarChart3,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Loader2
} from 'lucide-react';
import { TEN_YEARS_METADATA, TEN_YEAR_PAPERS, TEN_YEAR_TREND_METRICS } from '../data/tenYearsPyqData';
import { getQuestions } from '../services/api/questions';

export default function PYQVaultArchive({ onSelectQuestionForPractice, onLaunchMockTest, language }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedPaper, setSelectedPaper] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all"); // "all", "gs", "optionals"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("questions"); // questions, trends, mocks
  
  // API State
  const [apiQuestions, setApiQuestions] = useState(TEN_YEAR_PAPERS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPYQs = async () => {
      setIsLoading(true);
      try {
        const data = await getQuestions();
        if (isMounted && data && data.length > 0) {
           setApiQuestions(data);
           setApiError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("API failed, using static TEN_YEAR_PAPERS fallback", err);
          setApiQuestions(TEN_YEAR_PAPERS);
          setApiError(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPYQs();
    return () => { isMounted = false; };
  }, []);

  const years = ["all", 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const gsPapers = [
    { code: "all", label: "All Papers" },
    { code: "GS-I", label: "GS-I" },
    { code: "GS-II", label: "GS-II" },
    { code: "GS-III", label: "GS-III" },
    { code: "GS-IV", label: "GS-IV (Ethics)" },
    { code: "ESSAY", label: "Essay" }
  ];

  const optionalPapers = [
    { code: "OPT-ECON", label: "Economics (P1 & P2)" },
    { code: "OPT-PSIR", label: "PSIR (P1 & P2)" },
    { code: "OPT-SOCIO", label: "Sociology (P1 & P2)" },
    { code: "OPT-PHIL", label: "Philosophy (P1 & P2)" },
    { code: "OPT-LAW", label: "Law (P1 & P2)" },
    { code: "OPT-PUBAD", label: "Pub Administration (P1 & P2)" },
    { code: "OPT-GEO", label: "Geography (P1 & P2)" },
    { code: "OPT-HIST", label: "History (P1 & P2)" },
    { code: "OPT-ANTHRO", label: "Anthropology (P1 & P2)" },
    { code: "OPT-COMM", label: "Commerce (P1 & P2)" },
    { code: "OPT-PSYCH", label: "Psychology (P1 & P2)" },
    { code: "OPT-AGRI", label: "Agriculture (P1 & P2)" },
    { code: "OPT-MATH", label: "Mathematics (P1 & P2)" },
    { code: "OPT-MGMT", label: "Management (P1 & P2)" },
    { code: "OPT-HINDI-LIT", label: "Hindi Literature (P1 & P2)" }
  ];

  const filteredQuestions = apiQuestions.filter(q => {
    const matchesYear = selectedYear === "all" || q.year === Number(selectedYear);
    
    let matchesPaper = true;
    if (selectedPaper !== "all") {
      matchesPaper = q.paper_code === selectedPaper || 
                     (selectedPaper === "OPT-SOCIO" && (q.paper_code === "OPT-SOC" || q.paper_code === "OPT-SOCIO")) ||
                     (selectedPaper === "OPT-COMM" && (q.paper_code === "OPT-COMMERCE" || q.paper_code === "OPT-COMM"));
    }

    let matchesGroup = true;
    if (selectedGroup === "gs") {
      matchesGroup = ["GS-I", "GS-II", "GS-III", "GS-IV", "ESSAY"].includes(q.paper_code);
    } else if (selectedGroup === "optionals") {
      matchesGroup = (q.paper_code || "").startsWith("OPT-");
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch = (q.question_en || "").toLowerCase().includes(query) ||
                          (q.question_hi && q.question_hi.toLowerCase().includes(query)) ||
                          (q.subject || "").toLowerCase().includes(query) ||
                          (q.directive || "").toLowerCase().includes(query) ||
                          (q.topic_name || q.topic_title || "").toLowerCase().includes(query) ||
                          (q.paper_title && q.paper_title.toLowerCase().includes(query));
    return matchesYear && matchesPaper && matchesGroup && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', borderLeft: '4px solid var(--gold-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">Official UPSC Archive (2015-2024)</span>
              <span className="badge badge-emerald">GS I-IV, Essay & 15 Optionals (P1 & P2)</span>
              <span className="badge badge-sky">Trend-Based Mock Series</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {language === "hi" ? "UPSC CSE 10 वर्षों के प्रश्नपत्र, वैकल्पिक विषय एवं मॉक टेस्ट" : "UPSC CSE 10-Year PYQ Archive: GS, Essay & Top 15 Optionals"}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {language === "hi" 
                ? "आधिकारिक UPSC मुख्य परीक्षा के पिछले 10 वर्षों के प्रश्न, GS I-IV, निबंध एवं सभी 15 वैकल्पिक विषयों (Paper 1 व Paper 2) के प्रामाणिक प्रश्न।" 
                : "Authentic UPSC CSE Mains questions (2015–2024) covering General Studies, Essay, and all 15 Optional Subjects (Paper 1 & Paper 2)."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-400)' }}>10 Yrs</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2015 - 2024</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-400)' }}>720+</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>All Papers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab("questions")}
          className={`btn ${activeTab === "questions" ? 'btn-primary' : 'btn-outline'}`}
        >
          <BookOpen size={16} />
          <span>1. 10-Year Question Papers Archive ({filteredQuestions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`btn ${activeTab === "trends" ? 'btn-primary' : 'btn-outline'}`}
        >
          <BarChart3 size={16} />
          <span>2. 10-Year Subject & Directive Trends</span>
        </button>
        <button
          onClick={() => setActiveTab("mocks")}
          className={`btn ${activeTab === "mocks" ? 'btn-primary' : 'btn-outline'}`}
        >
          <Sparkles size={16} />
          <span>3. Trend-Calibrated Full Mock Tests</span>
        </button>
      </div>

      {apiError && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red-500)', borderRadius: 'var(--radius-md)', color: 'var(--red-400)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} />
          <span><strong>Development Fallback Mode:</strong> The Backend Questions API is currently unavailable. Displaying static offline archive data instead.</span>
        </div>
      )}

      {/* 1. Questions View */}
      {activeTab === "questions" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Group Category Filter (All vs GS vs Optionals) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Category:
              </span>
              {[
                { id: "all", label: "All Papers (GS + Optionals)" },
                { id: "gs", label: "General Studies & Essay" },
                { id: "optionals", label: "Optional Subjects (Paper 1 & Paper 2)" }
              ].map(grp => (
                <button
                  key={grp.id}
                  onClick={() => { setSelectedGroup(grp.id); setSelectedPaper("all"); }}
                  className={`btn btn-sm ${selectedGroup === grp.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            {/* Paper Selector Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Paper:
              </span>
              {(selectedGroup === "optionals" ? optionalPapers : selectedGroup === "gs" ? gsPapers : [...gsPapers, ...optionalPapers]).map(p => (
                <button
                  key={p.code}
                  onClick={() => setSelectedPaper(p.code)}
                  className={`btn btn-sm ${selectedPaper === p.code ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Year Selector Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Year:
              </span>
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`btn btn-sm ${selectedYear === yr ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  {yr === "all" ? "All Years (10Y)" : yr}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, optional name, thinker, directive, or question keyword (e.g. 'Mundell-Fleming', 'Basic Structure', 'Bhakti', 'Weber', 'Kant')..."
                style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

          </div>

          {/* Questions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => (
                <div 
                  key={q.id}
                  className="glass-card"
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    borderLeft: q.paper_code.startsWith('OPT-') ? '3px solid var(--gold-500)' : '3px solid var(--indigo-500)'
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

                    <div style={{ fontSize: '0.76rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Flame size={13} />
                      <span>{q.paper_title || q.paper_code} • {q.subject}</span>
                    </div>

                    <p style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.45' }}>
                      {language === "hi" && q.question_hi ? q.question_hi : q.question_en}
                    </p>

                    {/* Model hints preview */}
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
                      onClick={() => onSelectQuestionForPractice(q.id)}
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
                <p style={{ color: 'var(--text-muted)' }}>No questions match your current filters. Try changing the paper or year selection.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. Trends & High-Yield Analysis View */}
      {activeTab === "trends" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-400)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} /> 10-Year Subject-Wise Marks Distribution & Repeating Patterns
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(TEN_YEAR_TREND_METRICS.most_frequent_topics_by_paper).map(([paperName, topics]) => (
                <div key={paperName} style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span className="badge badge-gold">{paperName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10-Year Avg Weight</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topics.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.topic}</div>
                          <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>{t.trend}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--gold-400)' }}>~{t.avg_marks_per_year} M</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Directive Demand Analysis */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--indigo-400)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> Directive Command Word Breakdown (Examiner Demand Decoded)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {TEN_YEAR_TREND_METRICS.directive_breakdown.map((d, i) => (
                <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{d.directive}</strong>
                    <span className="badge badge-indigo">{d.frequency_pct}%</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {d.demand_tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. Trend-Calibrated Mock Tests View */}
      {activeTab === "mocks" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid var(--emerald-500)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              10-Year High-Yield Predictive Mock Examination Series
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Constructed using the exact weightages, repeating themes, and recent contemporary twists of the 2015–2024 UPSC CSE Mains examinations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Mock 1: GS-II */}
            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className="badge badge-gold">Full Mock Test #1</span>
                  <span className="badge badge-indigo">GS Paper II</span>
                  <span className="badge badge-emerald">250 Marks • 3 Hours</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Constitutional Governance & Federal Equilibrium Mock
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  20 authentic questions spanning Basic Structure, Discretionary Powers of Governors, Simultaneous Elections, Sub-classification, and SCO/Indo-Pacific diplomacy.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>20 Questions • 3 Hours</span>
                <button onClick={() => onLaunchMockTest("sim-gs2")} className="btn btn-sm btn-primary">
                  <Clock size={14} />
                  <span>Launch 3-Hour Simulation</span>
                </button>
              </div>
            </div>

            {/* Mock 2: GS-III */}
            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className="badge badge-gold">Full Mock Test #2</span>
                  <span className="badge badge-sky">GS Paper III</span>
                  <span className="badge badge-emerald">250 Marks • 3 Hours</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  High-Yield Economy, AI & Climate Finance Mock
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  20 questions focusing on Semiconductor Mission, Direct Seeding of Rice, Loss & Damage Fund, Manufacturing PLI hurdles, and Coastal Cyber-Maritime Security.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>20 Questions • 3 Hours</span>
                <button onClick={() => onLaunchMockTest("sim-gs3")} className="btn btn-sm btn-primary">
                  <Clock size={14} />
                  <span>Launch 3-Hour Simulation</span>
                </button>
              </div>
            </div>

            {/* Mock 3: GS-IV Ethics */}
            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className="badge badge-gold">Full Mock Test #3</span>
                  <span className="badge badge-rose">GS Paper IV</span>
                  <span className="badge badge-emerald">250 Marks • 3 Hours</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Ethics Theory & High-Stakes Case Studies Mock
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  12 Questions: 6 Theory (Integrity, Probity, AI Ethics) + 6 Real-World Dilemmas (Himalayan Landslides, Hospital Procurement Syndicate, Communal Riots).
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>12 Questions • 3 Hours</span>
                <button onClick={() => onLaunchMockTest("sim-gs4")} className="btn btn-sm btn-primary">
                  <Clock size={14} />
                  <span>Launch 3-Hour Simulation</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
