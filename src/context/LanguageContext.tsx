import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../i18n';

const STORAGE_KEY = 'app_language';

interface LanguageContextValue {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'es',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(i18n.locale);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && (saved === 'es' || saved === 'en')) {
        setLanguageState(saved);
        i18n.locale = saved;
      }
    });
  }, []);

  const setLanguage = useCallback((lang: string) => {
    const validLang = lang === 'en' ? 'en' : 'es';
    i18n.locale = validLang;
    setLanguageState(validLang);
    AsyncStorage.setItem(STORAGE_KEY, validLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { language } = useLanguage();
  // Setting locale before each translation call guarantees correct language
  // even if i18n.locale was modified externally.
  const t = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      i18n.locale = language;
      return i18n.t(key, options);
    },
    [language],
  );
  return { t, language };
}
