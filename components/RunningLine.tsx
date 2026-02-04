"use client";

import { useLanguage } from "@/context/LanguageContext";

type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

interface RunningLineProps {
  text?: LocalizedString;
}

export default function RunningLine({ text }: RunningLineProps) {
  const { lang } = useLanguage();
  
  // Fallback текст если нет данных из Sanity
  const fallbackText = "РЕСТОРАНЫ И ПРОЕКТЫ GŌSHT GROUP";
  
  // Получаем текст на нужном языке
  const displayText = text?.[lang] || text?.uz || fallbackText;
  const items = Array(4).fill(displayText);

  return (
    <div className="w-full bg-[#0F0F0F] border-y border-white/10 py-10 md:py-16 overflow-hidden flex select-none relative z-20">
      
      {/* Лента 1 */}
      <div className="animate-infinite-scroll flex whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-4">
            <span className="text-3xl md:text-5xl font-serif text-white uppercase tracking-tight">
              {item}
            </span>
            <span className="ml-4 md:ml-8 text-2xl md:text-4xl text-white/30 transform translate-y-[-2px]">
              ✦
            </span>
          </div>
        ))}
      </div>

      {/* Лента 2 (Копия) */}
      <div className="animate-infinite-scroll flex whitespace-nowrap" aria-hidden="true">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-8">
            <span className="text-3xl md:text-5xl font-serif text-white uppercase tracking-tight">
              {item}
            </span>
            <span className="ml-4 md:ml-8 text-2xl md:text-4xl text-white/30 transform translate-y-[-2px]">
              ✦
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}