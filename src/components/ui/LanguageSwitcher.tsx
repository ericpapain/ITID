import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          i18n.language.startsWith('fr')
            ? 'bg-[#2a9d8f] text-white font-bold'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          i18n.language.startsWith('en')
            ? 'bg-[#2a9d8f] text-white font-bold'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        EN
      </button>
    </div>
  );
}
