"use client"; 

import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    "РЕСТОРАНЫ", "МЕЖДУНАРОДНЫЕ ПРОЕКТЫ", "ПРОЕКТЫ", "СОБЫТИЯ", 
    "ПАРТНЕРЫ", "ПРОГРАММА ЛОЯЛЬНОСТИ", "ФРАНШИЗЫ", 
    "О КОМПАНИИ", "ВАКАНСИИ", "КОНТАКТЫ",
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 mix-blend-difference text-white/80 pointer-events-none">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Кнопка МЕНЮ: убрал font-bold, добавил font-light */}
          <button 
            onClick={() => setIsOpen(true)}
            className="group pointer-events-auto flex items-center gap-3 px-5 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-all"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white/60 group-hover:fill-white transition-colors">
              <rect width="18" height="1" />
              <rect y="5" width="18" height="1" />
              <rect y="10" width="18" height="1" />
            </svg>
            <span className="text-[11px] font-light tracking-[0.2em] uppercase">
              МЕНЮ
            </span>
          </button>

          {/* Логотип: font-medium вместо font-bold */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto text-white/90">
            <h1 className="text-lg font-medium tracking-[0.3em] uppercase cursor-pointer">
              GOSHT
            </h1>
          </div>

          <div className="w-[110px]"></div> 
        </div>
      </header>

      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-1000 ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full z-[60] bg-[#0c0c0c] text-white/80 transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full md:w-1/2 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-8 md:p-14 relative border-r border-white/5 overflow-y-auto">
            
            {/* Кнопка ЗАКРЫТЬ: аналогично облегчаем */}
            <button 
                onClick={() => setIsOpen(false)}
                className="group absolute top-6 left-6 flex items-center gap-3 px-5 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-all"
            >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white/40 group-hover:fill-white transition-colors">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                </svg>
                <span className="text-[11px] font-light tracking-[0.2em] uppercase">
                  ЗАКРЫТЬ
                </span>
            </button>

            <nav className="flex flex-col justify-center min-h-full gap-4 pl-2 md:pl-10 py-24">
                {menuItems.map((item, index) => (
                    <a 
                        key={index} 
                        href="#" 
                        /* font-light и уменьшенный размер текста */
                        className="text-lg md:text-2xl font-light hover:text-white transition-colors uppercase tracking-[0.2em] leading-tight group flex items-center gap-3"
                    >
                        {item}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-white/20">●</span>
                    </a>
                ))}
            </nav>
        </div>
      </div>
    </>
  );
}