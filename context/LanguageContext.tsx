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
  const [lang, setLangState] = useState<Language>(initialLang);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Пытаемся получить язык из cookies
    const savedLang = document.cookie
      .split('; ')
      .find(row => row.startsWith('preferredLanguage='))
      ?.split('=')[1] as Language | undefined;

    if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
      setLangState(savedLang);
      
      // Если сохранённый язык не совпадает с URL, перенаправляем на правильный язык
      if (savedLang !== initialLang && !pathname.includes('/studio')) {
        // Добавляем небольшую задержку чтобы избежать race condition
        setTimeout(() => {
          const newPathname = pathname.replace(/^\/(uz|ru|en)/, `/${savedLang}`);
          router.push(newPathname || `/${savedLang}`);
        }, 100);
      }
    } else {
      // Если нет сохранённого языка, сохраняем текущий
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `preferredLanguage=${initialLang};expires=${expiryDate.toUTCString()};path=/`;
    }
  }, [initialLang, pathname, router]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    // Сохраняем в cookies на 1 год
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `preferredLanguage=${newLang};expires=${expiryDate.toUTCString()};path=/`;
  };

  if (!mounted) {
    return <LanguageContext.Provider value={{ lang: initialLang, setLang }}>{children}</LanguageContext.Provider>;
  }

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
