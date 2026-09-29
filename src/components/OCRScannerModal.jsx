import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, ScanLine, X, FileText, Sparkles, RefreshCw } from 'lucide-react';

export const SAMPLE_OCR_PAGES = [
  {
    id: "page-sample-1",
    title: "Handwritten Sample: GS-II Basic Structure",
    imageUrl: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&auto=format&fit=crop&q=80",
    extractedText: `The basic structure doctrine was propounded by the Supreme Court in the landmark Kesavananda Bharati case in 1973. It says that Parliament can amend any part of the Constitution under Article 368 but cannot change its basic structure like democracy, secularism and rule of law.

This doctrine has stopped authoritarianism in India. During emergency, 39th amendment tried to put election of PM outside judicial review, but SC struck it down in Raj Narain case. In Minerva Mills case, court held that judicial review and balance between Fundamental rights and DPSP is basic structure.

However, critics say that basic structure is not defined anywhere in the constitution. It leads to judicial activism and friction between legislature and judiciary.

In conclusion, basic structure is very important for Indian democracy and protects citizen rights.`,
    confidence: "98.7%",
    linesDetected: 22
  },
  {
    id: "page-sample-2",
    title: "Handwritten Sample: GS-III AI Regulation",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80",
    extractedText: `Artificial Intelligence (AI) is transforming the world rapidly. India has huge opportunity to use AI in many sectors.

Opportunities:
1. Economy: AI will increase GDP and help in IT sector.
2. Agriculture: Weather forecasting and crop monitoring.
3. Health: AI doctors and diagnosis.
4. Education: Personalized learning for students.

Risks:
1. Job loss in IT and call centres.
2. Deepfakes and crime.
3. Privacy violations.

Suggestions:
Government should make strong law for AI and promote research. NITI Aayog AI for all must be implemented.`,
    confidence: "97.9%",
    linesDetected: 19
  }
];

export default function OCRScannerModal({ isOpen, onClose, onImportText, language }) {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_OCR_PAGES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [activeStep, setActiveStep] = useState("preview"); // preview, scanning, done

  useEffect(() => {
    if (isOpen) {
      setExtractedText(selectedSample.extractedText);
      setActiveStep("preview");
    }
  }, [isOpen, selectedSample]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setActiveStep("scanning");
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setActiveStep("done");
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleTransfer = () => {
    onImportText(extractedText);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--indigo-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScanLine size={20} color="var(--indigo-400)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {language === "hi" ? "हस्तलिखित उत्तर स्कैन एवं विज़न OCR" : "Handwritten Answer Scanner & Vision OCR"}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {language === "hi" ? "UPSC QCAB उत्तर पुस्तिकाओं के लिए ऑप्टिमाइज़्ड न्यूरल OCR" : "Optimized neural vision OCR for UPSC Question-cum-Answer Booklets (QCAB)"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline" style={{ borderRadius: 'var(--radius-full)', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 600 }}>
            {language === "hi" ? "नमूना उत्तर पत्रक:" : "Select Sample Answer Sheet:"}
          </span>
          {SAMPLE_OCR_PAGES.map(sample => (
            <button
              key={sample.id}
              onClick={() => { setSelectedSample(sample); setExtractedText(sample.extractedText); setActiveStep("preview"); }}
              className={`btn btn-sm ${selectedSample.id === sample.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              <FileText size={14} />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>

        {/* Scanner Split View */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          
          {/* Left Column: Simulated Answer Sheet Visualizer */}
          <div style={{ 
            background: 'var(--bg-tertiary)', 
            border: '2px dashed var(--border-medium)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                UPSC QCAB Layout Standard (32 Lines)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedSample.linesDetected} lines detected
              </span>
            </div>

            {/* Answer Sheet Mock Container */}
            <div style={{ 
              flex: 1, 
              background: '#fffdfa', 
              color: '#1e293b', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px', 
              position: 'relative',
              fontFamily: 'Caveat, cursive, sans-serif',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              {/* UPSC Margin Lines */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '38px', width: '2px', background: 'rgba(239, 68, 68, 0.4)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: '38px', width: '2px', background: 'rgba(239, 68, 68, 0.4)' }} />
              
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                (उम्मीदवारों को इस हाशिए में नहीं लिखना चाहिए / Candidates must not write on this margin)
              </div>

              {/* Text simulation with bounding lines */}
              <div style={{ padding: '0 40px', fontSize: '0.9rem', lineHeight: '1.8', color: '#0f172a', whiteSpace: 'pre-line' }}>
                {selectedSample.extractedText.slice(0, 260)}...
              </div>

              {/* Scanning Laser Beam Animation */}
              {isScanning && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${scanProgress}%`,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #6366f1, #fbbf24, #6366f1, transparent)',
                  boxShadow: '0 0 15px #6366f1, 0 0 25px #fbbf24',
                  transition: 'top 0.35s ease'
                }} />
              )}
            </div>

            {/* Scan Action Controls */}
            <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleStartScan}
                disabled={isScanning}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={16} className="spin-slow" />
                    <span>Processing Neural OCR ({scanProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <ScanLine size={16} />
                    <span>Scan & Extract Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Extracted Text & Transcription Verification */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="var(--gold-400)" />
                <span>{language === "hi" ? "निष्कर्षित पाठ (संपादनीय):" : "Extracted Transcript (Editable):"}</span>
              </label>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} />
                Accuracy: {selectedSample.confidence}
              </span>
            </div>

            <textarea
              className="form-textarea"
              value={extractedText}
              onChange={e => setExtractedText(e.target.value)}
              placeholder="Extracted handwritten text will appear here. You can refine or correct words before evaluation..."
              style={{ flex: 1, minHeight: '260px', fontSize: '0.92rem' }}
            />

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleTransfer} className="btn btn-success">
                <Sparkles size={16} />
                <span>{language === "hi" ? "उत्तर स्टूडियो में आयात करें" : "Transfer to Answer Studio"}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
