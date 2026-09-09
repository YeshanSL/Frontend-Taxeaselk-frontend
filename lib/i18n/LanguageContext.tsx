"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, TranslationKey, translations } from "./translations";

const STORAGE_KEY = "taxeaselk_language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Wraps the whole app (see app/layout.tsx) so any component below it —
// server or client — can render a client child that reads the current
// language. Persists the choice in localStorage so it survives a
// refresh; defaults to English on first visit.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "en" || saved === "si" || saved === "ta") {
      setLanguageState(saved);
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let str =
      (translations[language] as Record<string, string>)[key] ??
      (translations.en as Record<string, string>)[key] ??
      key;
    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
      }
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage() must be used inside <LanguageProvider>");
  }
  return ctx;
}
