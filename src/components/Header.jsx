import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  Clock, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Sun, 
  Moon, 
  Globe,
  Award,
  ShieldCheck,
  Archive
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  language, 
  setLanguage, 
  theme, 
  setTheme 
}) {
  const navItems = [
    { id: "studio", label: language === "hi" ? "उत्तर लेखन स्टूडियो" : "Answer Studio", icon: PenTool },
    { id: "archive", label: language === "hi" ? "10 वर्ष PYQ एवं मॉक" : "10Y PYQs & Mocks", icon: Archive },
    { id: "syllabus", label: language === "hi" ? "पाठ्यक्रम एवं विषय" : "Syllabus Matrix", icon: Layers },
    { id: "simulator", label: language === "hi" ? "3 घंटे का पेपर सिमुलेटर" : "3-Hour Simulator", icon: Clock },
    { id: "current-affairs", label: language === "hi" ? "समसामयिकी मैट्रिक्स" : "Current Affairs", icon: BookOpen },
    { id: "optionals", label: language === "hi" ? "वैकल्पिक विषय (15)" : "Optionals (15)", icon: Award },
    { id: "analytics", label: language === "hi" ? "360° एनालिटिक्स" : "Mastery Analytics", icon: TrendingUp }
  ];

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', padding: '14px 24px', margin: '0 0 24px 0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('studio')}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            background: 'linear-gradient(135deg, var(--gold-500), #b45309)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--gold-glow)',
            fontSize: '22px'
          }}>
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                YuktiPrep
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                MAINS 360°
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={12} color="var(--emerald-400)" />
              <span>{language === "hi" ? "10 वर्ष PYQs + 15 ऑप्शनल + बोर्ड मूल्यांकन 100% अनलॉक" : "10Y PYQs + 15 Optionals + Board Grading 100% Unlocked"}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  borderRadius: 'var(--radius-full)', 
                  padding: '8px 15px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controls: Language, Theme & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Language Switch */}
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            title="Toggle Language (English / Hindi)"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
          >
            <Globe size={15} color="var(--gold-400)" />
            <span style={{ fontWeight: 600 }}>{language === "en" ? "हिंदी" : "English"}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: 'var(--radius-full)' }}
          >
            {theme === "dark" ? <Sun size={17} color="var(--gold-400)" /> : <Moon size={17} color="var(--indigo-400)" />}
          </button>
        </div>

      </div>
    </header>
  );
}
