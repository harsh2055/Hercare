// client/src/context/LanguageContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { t as translate } from '../utils/i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('hercare_lang') || 'en'
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('hercare_lang', lang);
  };

  const t = (key) => translate(key, language);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
