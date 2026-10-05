import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[language];
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to English if key doesn't exist
        let fallback = translations['en'];
        for (const k of keys) {
            if (!fallback) return path;
            fallback = fallback[k];
        }
        return fallback || path;
      }
      current = current[key];
    }
    return current;
  };

  const getQuestionText = (item) => {
    if (language === 'hi' && item.question_hi) {
        return item.question_hi;
    }
    return item.question_en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getQuestionText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
