"use client";

import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/Reveal";

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
  const separator = (
    <svg
      className="w-4 h-4 md:w-6 md:h-6 text-muted shrink-0"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
    </svg>
  );

  return (
    <Reveal
      as="div"
      className="w-full min-h-[112px] md:min-h-[180px] bg-surface border-y border-subtle section-y-sm overflow-hidden flex items-center select-none relative z-20 transition-colors duration-300"
      distance={28}
      blur={8}
    >
      
      {/* Лента 1 */}
      <div className="animate-infinite-scroll flex whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-8">
            <span className="text-marquee text-primary">
              {item}
            </span>
            <span className="ml-4 md:ml-8 flex items-center">{separator}</span>
          </div>
        ))}
      </div>

      {/* Лента 2 (Копия) */}
      <div className="animate-infinite-scroll flex whitespace-nowrap" aria-hidden="true">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-8">
            <span className="text-marquee text-primary">
              {item}
            </span>
            <span className="ml-4 md:ml-8 flex items-center">{separator}</span>
          </div>
        ))}
      </div>

    </Reveal>
  );
}
