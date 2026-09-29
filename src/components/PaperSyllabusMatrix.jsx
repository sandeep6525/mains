import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  PenTool,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { MAINS_PAPERS, SYLLABUS_METADATA } from '../data/syllabusData';
import { PYQ_QUESTIONS } from '../data/pyqData';
import { fetchSyllabusMatrix } from '../services/api/syllabus';
import { normalizeSyllabusMatrix } from '../services/api/syllabusAdapter';

export default function PaperSyllabusMatrix({ onSelectQuestionForPractice, language }) {
  const [selectedPaperId, setSelectedPaperId] = useState(MAINS_PAPERS[1].id); // GS-1 default
  const [searchQuery, setSearchQuery] = useState("");
  
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const matrix = await fetchSyllabusMatrix('upsc-cse-mains');
        if (isMounted) {
          if (matrix && matrix.length > 0) {
            const normalized = normalizeSyllabusMatrix(matrix);
            setApiData(normalized);
            setApiError(null);
            if (normalized.length > 0) {
              setSelectedPaperId(normalized[0].id);
            }
          } else {
            setApiError("Backend returned empty syllabus matrix.");
            setApiData([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message);
          setApiData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Use API data if available, otherwise fallback to static
  const hasValidApiData = apiData.length > 0 && !apiError;
  const papersToRender = hasValidApiData ? apiData : MAINS_PAPERS;

  const activePaper = papersToRender.find(p => p.id === selectedPaperId) || papersToRender[0];

  // Filter micro topics
  const filteredMicroTopics = activePaper ? activePaper.micro_topics.filter(topic => {
    const q = searchQuery.toLowerCase();
    return (topic.name && topic.name.toLowerCase().includes(q)) || 
           (topic.name_hi && topic.name_hi.toLowerCase().includes(q)) ||
           (topic.code && topic.code.toLowerCase().includes(q));
  }) : [];

  // Find related PYQs for this paper (using paper.id which could be UUID now)
  const relatedPYQs = PYQ_QUESTIONS.filter(q => {
    // If backend data is used, activePaper.id is a UUID. We check if PYQ paper_id matches slug or id.
    const staticPaper = MAINS_PAPERS.find(p => p.title === activePaper?.title);
    return q.paper_id === activePaper?.id || q.paper_id === staticPaper?.id;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Fallback Warning */}
      {!hasValidApiData && !isLoading && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red-500)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle color="var(--red-500)" size={20} />
          <div>
            <h4 style={{ color: 'var(--red-500)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>Development Fallback Mode</h4>
            <p style={{ color: 'var(--red-400)', fontSize: '0.8rem', margin: 0 }}>
              Backend API is unavailable or returned empty data. Using static offline syllabus data. Error: {apiError}
            </p>
          </div>
        </div>
      )}

      {/* Syllabus Metadata & UPSC Verification Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--gold-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="var(--emerald-400)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Controlling Source: {SYLLABUS_METADATA.controlling_source}
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                Verified {SYLLABUS_METADATA.last_verified_date}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {language === "hi" ? "UPSC CSE मुख्य परीक्षा: आधिकारिक पाठ्यक्रम एवं माइक्रो-टॉपिक मैट्रिक्स" : "Official UPSC CSE Mains Syllabus & Micro-Topic Matrix"}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === "hi" 
                ? "सभी 9 प्रश्नपत्र (निबंध, GS I-IV, अनिवार्य भाषाएं एवं वैकल्पिक विषय) पूर्णतया मैप किए गए हैं।" 
                : "Comprehensive breakdown covering all 9 papers (Essay, GS I–IV, Qualifying Hindi/English & Optionals)."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-400)' }}>1750</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Merit Marks</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-400)' }}>600</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qualifying Marks</div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading syllabus...
        </div>
      ) : (
        <>
          {/* Paper Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {papersToRender.map(paper => {
              const isSelected = selectedPaperId === paper.id;
              return (
                <button
                  key={paper.id}
                  onClick={() => setSelectedPaperId(paper.id)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '8px 16px' }}
                >
                  <span>{paper.code || paper.title}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {paper.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Split: Micro-Syllabus Taxonomy (Left) & Topic PYQ Practice Vault (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Micro-Topics Taxonomy */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    {language === "hi" && activePaper?.title_hi ? activePaper.title_hi : activePaper?.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activePaper?.description}
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "hi" ? "माइक्रो-टॉपिक या कीवर्ड खोजें..." : "Filter micro-topics or keywords..."}
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Micro Topics List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredMicroTopics.map(topic => (
                  <div 
                    key={topic.id}
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                        {topic.code || "TBD"}
                      </span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {language === "hi" && topic.name_hi ? topic.name_hi : topic.name}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {topic.count_pyq || 0} PYQs
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Linked PYQ Practice Bank */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--gold-400)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    {language === "hi" ? "प्रश्न बैंक एवं अभ्यास सेट" : "PYQ Vault & Practice Prompts"}
                  </h3>
                </div>
                <span className="badge badge-emerald">
                  {relatedPYQs.length} Featured Prompts
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '460px', overflowY: 'auto' }}>
                {relatedPYQs.length > 0 ? (
                  relatedPYQs.map(q => (
                    <div 
                      key={q.id}
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-medium)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className="badge badge-gold">{q.year} UPSC</span>
                          <span className="badge badge-indigo">{q.marks} Marks ({q.word_limit} W)</span>
                          <span className="badge badge-sky">{q.directive}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ⏱️ {q.time_limit_mins} mins
                        </span>
                      </div>

                      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {language === "hi" && q.question_hi ? q.question_hi : q.question_en}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          onClick={() => onSelectQuestionForPractice(q.id)}
                          className="btn btn-sm btn-primary"
                        >
                          <PenTool size={14} />
                          <span>{language === "hi" ? "स्टूडियो में लिखें" : "Write in Studio"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>Full authentic question bank mapped for {activePaper?.code}.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Switch to GS-I, GS-II, GS-III, GS-IV or Essay to practice live questions.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
