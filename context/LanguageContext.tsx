
import { createContext, useState, useMemo, ReactNode } from 'react';
import { translations } from '../lib/translations';

type Locale = 'en' | 'ru';
type Translations = typeof translations.en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('ru');

  const value = useMemo(() => {
    return {
      locale,
      setLocale,
      translations: translations[locale],
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
