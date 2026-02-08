"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

type Language = "uz" | "ru" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang = "uz" }: { children: ReactNode; initialLang?: Language }) {
  const getSavedLanguage = () => {
    if (typeof document === "undefined") return undefined;
    const savedLang = document.cookie
      .split("; ")
      .find(row => row.startsWith("preferredLanguage="))
      ?.split("=")[1] as Language | undefined;

    return savedLang && ["uz", "ru", "en"].includes(savedLang) ? savedLang : undefined;
  };

  const [lang, setLangState] = useState<Language>(() => getSavedLanguage() ?? initialLang);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedLang = getSavedLanguage();
    const activeLang = savedLang ?? initialLang;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `preferredLanguage=${activeLang};expires=${expiryDate.toUTCString()};path=/`;

    // Если сохранённый язык не совпадает с URL, перенаправляем на правильный язык
    if (savedLang && savedLang !== initialLang && !pathname.includes("/studio")) {
      setTimeout(() => {
        const newPathname = pathname.replace(/^\/(uz|ru|en)/, `/${savedLang}`);
        router.push(newPathname || `/${savedLang}`);
      }, 100);
    }
  }, [initialLang, pathname, router]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    // Сохраняем в cookies на 1 год
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `preferredLanguage=${newLang};expires=${expiryDate.toUTCString()};path=/`;
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
