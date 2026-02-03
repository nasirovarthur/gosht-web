"use client"; 

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("RU");

  const menuItems = [
    "РЕСТОРАНЫ", "МЕЖДУНАРОДНЫЕ ПРОЕКТЫ", "ПРОЕКТЫ", "СОБЫТИЯ", 
    "ПАРТНЕРЫ", "ПРОГРАММА ЛОЯЛЬНОСТИ", "ФРАНШИЗЫ", 
    "О КОМПАНИИ", "ВАКАНСИИ", "КОНТАКТЫ",
  ];

  // Для анимации стрелки
  const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);
  const [lastIndex, setLastIndex] = useState<number>(0);
  const [arrowTop, setArrowTop] = useState<number>(0);
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const languages = ["UZ", "RU", "EN"];

  return (
    <>
      {/* =======================================
          1. ГЛАВНАЯ ШАПКА
         ======================================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#0D0D0D] text-[#d1d1d1] transition-all duration-300 border-b border-white/5">
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] px-4 md:px-10 relative">
          
          {/* Кнопка МЕНЮ */}
          <button 
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all active:scale-95"
          >
            <svg className="w-[14px] h-[10px] md:w-[24px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="1.5" />
              <rect y="5.25" width="18" height="1.5" />
              <rect y="10.5" width="18" height="1.5" />
            </svg>
            <span className="text-[10px] md:text-[16px] font-light tracking-[0.15em] md:tracking-[0.2em] uppercase pt-0.5 text-white/90">
              МЕНЮ
            </span>
          </button>

          {/* 2. ЛОГОТИП В ШАПКЕ */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-[120px] h-[50px] md:w-[200px] md:h-[80px] hover:opacity-80 transition-opacity cursor-pointer z-50">
                <Image
                  src="/logo.svg" 
                  alt="GOSHT Logo"
                  fill
                  className="object-contain scale-125 md:scale-90 origin-center" 
                  priority
                />
            </div>
          </div>
          
          <div className="md:hidden w-[80px]"></div>

        {/* Языки (Desktop) */}
          <div className="hidden md:flex justify-end min-w-[140px]">
            <div className="group relative flex items-center h-[60px] bg-transparent border border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:w-[220px] w-[80px] hover:bg-white/5 cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                    <span className="text-[16px] font-light tracking-[0.1em] uppercase text-white">{lang}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                    {languages.map((item) => (
                        <button 
                            key={item} 
                            onClick={() => setLang(item)} 
                            className={`text-[14px] font-light tracking-[0.1em] transition-colors uppercase ${lang === item ? "text-white" : "text-white/40 hover:text-white"}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="md:hidden w-[80px]"></div>
        </div>
      </header>
      
      {/* =======================================
          2. ШТОРКА МЕНЮ
         ======================================= */}
      {/* Затемнение и размытие под меню */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[49] bg-black/60 ${
          isOpen
            ? "opacity-100 backdrop-blur-[4px] visible"
            : "opacity-0 backdrop-blur-none visible"
        }`}
        style={{
          transitionProperty: 'opacity, filter',
          transitionDuration: '700ms',
          transitionTimingFunction: 'ease',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      ></div>

      {/* Сама панель меню */}
      <div 
        className={`fixed top-0 left-0 h-full z-[60] bg-[#131313] text-[#d1d1d1] transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full flex flex-col justify-between overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxWidth: 'min(100vw, 700px)', width: 'min(100vw, 700px)', maxHeight: 'min(100%)', height: 'min(100%)'}}
      >
        
        {/* Верхняя панель шторки (z-10 чтобы быть выше фона) */}
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] px-4 md:px-10 flex-shrink-0 border-b border-white/5 relative z-20">
            <button 
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all"
            >
                <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                </svg>
                <span className="text-[10px] md:text-[16px] font-light tracking-[0.1em] md:tracking-[0.2em] uppercase pt-0.5 text-white/90">
                  ЗАКРЫТЬ
                </span>
            </button>

            <div className="flex md:hidden items-center gap-4 pr-2 relative z-10">
                {languages.map((item) => (
                  <button
                    key={item}
                    onClick={() => setLang(item)}
                    className={`text-[12px] font-light tracking-[0.15em] transition-colors uppercase ${
                      lang === item ? "text-white underline decoration-1 underline-offset-4" : "text-white/30"
                    }`}
                  >
                    {item}
                  </button>
                ))}
            </div>
        </div>

        {/* СПИСОК МЕНЮ (z-10 чтобы быть выше фона) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-6 border-r border-white/5 flex flex-col justify-start relative z-10">
            <nav className="flex flex-col gap-6 md:gap-8 pl-14 md:pl- mt-20 md:mt-12 relative">
                {/* Анимированная стрелка */}
                <span
                  className="absolute left-10 flex items-center h-[22px] md:h-[28px] pointer-events-none"
                  style={{
                    top: arrowTop,
                    opacity: hoveredIndex !== null ? 1 : 0,
                    transition: 'top 0.4s cubic-bezier(.22,1,.36,1), opacity 1s cubic-bezier(.4,2,.3,1)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {menuItems.map((item, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    ref={el => { menuRefs.current[index] = el; }}
                    className="text-[19px] md:text-[24px] font-serif font-light text-white hover:text-white/60 transition-colors uppercase tracking-[0.05em] leading-tight flex items-center gap-4 pl-8 relative"
                    onMouseEnter={() => {
                      setHoveredIndex(index);
                      setLastIndex(index);
                      if (menuRefs.current[index]) {
                        setArrowTop(menuRefs.current[index].offsetTop);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                    }}
                  >
                    {item}
                  </a>
                ))}
            </nav>
        </div>
        {/* ЛОГОТИП ВНИЗУ */}
        <div className="pointer-events-none z-0 absolute bottom-0 right-[-80] bottom-[-150] w-[90%] h-[800px] overflow-hidden">
            <div className="relative w-full h-full">
                <Image
                  src="/menu-logo.svg" 
                  alt="Background Logo"
                  fill
                  className="object-contain"
                />
            </div>
        </div>
      </div>
    </>
  );
}