// client/src/components/Disclaimer.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Disclaimer = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
        <span className="text-base">⚕️</span>
        <p>{t('disclaimerText')}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <h4 className="font-semibold text-amber-800 mb-2">{t('disclaimer')}</h4>
      <p className="text-sm text-amber-700">{t('disclaimerText')}</p>
      <p className="text-xs text-amber-600 mt-2">
        Always seek the advice of your physician or other qualified health provider with any questions regarding medical conditions.
      </p>
    </div>
  );
};

export default Disclaimer;
