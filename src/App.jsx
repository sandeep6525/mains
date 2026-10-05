import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import Header from './components/Header';
import AnswerWritingStudio from './components/AnswerWritingStudio';
import PYQVaultArchive from './components/PYQVaultArchive';
import PaperSyllabusMatrix from './components/PaperSyllabusMatrix';
import FullPaperSimulator from './components/FullPaperSimulator';
import CurrentAffairsMatrix from './components/CurrentAffairsMatrix';
import OptionalSubjectsExplorer from './components/OptionalSubjectsExplorer';
import MasteryAnalytics from './components/MasteryAnalytics';
import { ShieldCheck, Award, Sparkles, BookOpen, Layers } from 'lucide-react';
import './App.css';

// FetchIQ Imports
import FetchIQLogin from './components/FetchIQ/Login';
import FetchIQDashboard from './components/FetchIQ/Dashboard';
import FetchIQIngestion from './components/FetchIQ/Ingestion';
import FetchIQReview from './components/FetchIQ/Review';
import FetchIQReviewQueue from './components/FetchIQ/ReviewQueue';
import FetchIQSources from './components/FetchIQ/Sources';

export default function App() {
  const { language, setLanguage, t } = useLanguage();

  // Simple Path-based router for FetchIQ administrative pages
  const path = window.location.pathname.replace(/\/$/, '');
  
  const isAuthenticated = !!localStorage.getItem('fetchIqToken');

  if (path === '/admin/login' || path === '/fetchiq/login') return <FetchIQLogin />;
  
  if (path === '/admin' || path === '/fetchiq/dashboard') {
     if (!isAuthenticated) { window.location.href = '/admin/login'; return null; }
     return <FetchIQDashboard />;
  }
  if (path === '/fetchiq/review-queue') {
     if (!isAuthenticated) { window.location.href = '/admin/login'; return null; }
     return <FetchIQReviewQueue />;
  }
  if (path === '/admin/sources') {
     if (!isAuthenticated) { window.location.href = '/admin/login'; return null; }
     return <FetchIQSources />;
  }
  if (path === '/fetchiq/ingestion') {
     if (!isAuthenticated) { window.location.href = '/admin/login'; return null; }
     return <FetchIQIngestion />;
  }
  if (path.startsWith('/fetchiq/review/')) {
     if (!isAuthenticated) { window.location.href = '/admin/login'; return null; }
     return <FetchIQReview />;
  }

  const [activeTab, setActiveTab] = useState("studio");
  const [selectedQuestionId, setSelectedQuestionId] = useState("pyq-2024-gs2-01");
  const [theme, setTheme] = useState("dark"); // dark or light

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleNavigateToPractice = (qId) => {
    if (qId) {
      setSelectedQuestionId(qId);
    }
    setActiveTab("studio");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchMock = (paperId) => {
    setActiveTab("simulator");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background ambient lighting */}
      <div className="bg-ambient" />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        <div style={{ display: activeTab === "studio" ? "block" : "none" }}>
          <AnswerWritingStudio
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "archive" ? "block" : "none" }}>
          <PYQVaultArchive
            onSelectQuestionForPractice={handleNavigateToPractice}
            onLaunchMockTest={handleLaunchMock}
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "syllabus" ? "block" : "none" }}>
          <PaperSyllabusMatrix
            onSelectQuestionForPractice={handleNavigateToPractice}
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "simulator" ? "block" : "none" }}>
          <FullPaperSimulator
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "current-affairs" ? "block" : "none" }}>
          <CurrentAffairsMatrix
            onSelectQuestionForPractice={handleNavigateToPractice}
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "optionals" ? "block" : "none" }}>
          <OptionalSubjectsExplorer
            onSelectQuestionForPractice={handleNavigateToPractice}
            language={language}
          />
        </div>

        <div style={{ display: activeTab === "analytics" ? "block" : "none" }}>
          <MasteryAnalytics
            language={language}
            onNavigateToPractice={handleNavigateToPractice}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card" style={{ 
        margin: 'auto 20px 20px 20px', 
        padding: '16px 24px', 
        borderRadius: 'var(--radius-lg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '12px',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--emerald-400)" />
          <span>YuktiPrep Mains 360° • Version 2026.1 • 10-Year UPSC Archive (2015-2024)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>
            ✨ 10Y PYQs + 15 Optionals + Board Grading (100% Free Full Access)
          </span>
          <span>Pedagogical Diagnostic Guidance System</span>
        </div>
      </footer>
    </div>
  );
}
