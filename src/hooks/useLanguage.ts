import { useState, useEffect } from 'react';
import { LANGUAGE_STORAGE_KEY, getTranslations, type Language, type Translations } from '../i18n/index.ts';

interface UseLanguageReturn {
  lang: Language;
  t: Translations;
}

export function useLanguage(): UseLanguageReturn {
  const [lang, setLang] = useState<Language>(
    () => (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'hi' ? 'hi' : 'en')
  );

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY) {
        setLang(e.newValue === 'hi' ? 'hi' : 'en');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { lang, t: getTranslations(lang) };
}
