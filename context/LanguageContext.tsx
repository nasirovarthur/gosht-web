"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";

type Language = "uz" | "ru" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang = "uz" }: { children: ReactNode; initialLang?: Language }) {
  const lang = initialLang;

  const persistPreferredLanguage = (value: Language) => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `preferredLanguage=${value};expires=${expiryDate.toUTCString()};path=/`;
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      persistPreferredLanguage(initialLang);
    }
  }, [initialLang]);

  const setLang = (newLang: Language) => {
    if (typeof document !== "undefined") {
      persistPreferredLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
