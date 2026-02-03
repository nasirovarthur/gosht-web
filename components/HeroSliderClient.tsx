"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link"; // Если используем ссылки

type Slide = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  showButton: boolean;
  image: string;
  link: string; // <--- Добавили это поле, чтобы TS не ругался
};

export default function HeroSliderClient({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Сброс таймера
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Запуск таймера
  const startTimer = useCallback(() => {
    resetTimer();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [resetTimer, slides.length]);

  // Эффект параллакса
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Эффект таймера
  useEffect(() => {
    startTimer();
    return () => resetTimer();
  }, [startTimer, resetTimer]);

  const handleManualChange = (index: number) => {
    setCurrentIndex(index);
    startTimer();
  };

  // Вычисляем данные для текущего и следующего слайда
  const currentSlide = slides[currentIndex];
  const nextIndex = (currentIndex + 1) % slides.length;
  const nextSlide = slides[nextIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0c0c0c]">
      {/* 1. ФОНОВЫЕ КАРТИНКИ (Смена через opacity) */}
      <div className="absolute inset-0 w-full h-full z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div 
               className="relative w-full h-full"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover brightness-[0.6]"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
        {/* Градиент поверх фото */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-20" />
      </div>

      {/* 2. ТЕКСТОВЫЙ КОНТЕНТ */}
      <div id="hero-text-content" className="relative z-30 h-full flex flex-col justify-end px-4 md:px-10 pb-12 md:pb-24">
        <div key={currentIndex} className="max-w-4xl opacity-0 animate-fade-up">
      
      {/* Надзаголовок */}
      <div className="flex items-center gap-4 mb-2 md:mb-3">
          <span className="text-[#d1d1d1] text-[10px] md:text-[14px] tracking-[0.2em] uppercase font-light">
            {currentSlide.subtitle}
          </span>
      </div>

      {/* Заголовок */}
      <h1 className="text-white text-[42px] md:text-[70px] leading-[1.1] font-serif uppercase tracking-tight mb-3 md:mb-4">
        {currentSlide.title}
      </h1>

      {/* Описание */}
      <div className="flex items-center gap-4 mb-8 md:mb-10">
          <div className="h-[1px] w-8 md:w-12 bg-[#d1d1d1]/60"></div>
          <p className="text-[#d1d1d1]/80 text-[14px] md:text-[18px] max-w-xl leading-relaxed font-light">
            {currentSlide.description}
          </p>
      </div>

      {/* Кнопка: теперь она в общем блоке и зависит от showButton */}
      {currentSlide.showButton && (
        <div className="mt-2">
          <button className="group relative px-8 py-3 md:px-10 md:py-4 border border-white/20 rounded-full overflow-hidden hover:border-white/40 transition-colors">
              <span className="relative z-10 text-[10px] md:text-[12px] text-white tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500">
                {currentSlide.buttonText} &rarr;
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
          </button>
        </div>
      )}
  </div>
</div>
      {/* 3. НАВИГАЦИЯ (Снизу справа) */}
      <div className="absolute bottom-10 right-4 md:right-10 z-40 flex items-center gap-6 md:gap-10">
        {/* Номер слайда */}
        <div className="flex items-baseline gap-2 text-white font-serif">
            <span className="text-[32px] md:text-[42px] leading-none">{currentIndex + 1}</span>
            <div className="h-[1px] w-8 md:w-12 bg-white/50 -translate-y-2 overflow-hidden relative">
              <div 
                key={currentIndex} 
                className="h-full bg-white animate-progress"
              ></div>
            </div>
            <span className="text-[16px] md:text-[20px] text-white/40">{slides.length}</span>
        </div>

        {/* Стрелки */}
        <div className="flex gap-2 md:gap-4">
            <button 
                onClick={() => handleManualChange((currentIndex - 1 + slides.length) % slides.length)}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-all active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <button 
                onClick={() => handleManualChange((currentIndex + 1) % slides.length)}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-all active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
      </div>


    </div>
  );
}