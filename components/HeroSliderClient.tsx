"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Slide = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  showButton: boolean;
  image: string;
  buttonUrl?: string;
};

export default function HeroSliderClient({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const startTimer = useCallback(() => {
    resetTimer();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
  }, [resetTimer, slides.length]);

  // Параллакс эффект (работает везде)
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    startTimer();
    return () => resetTimer();
  }, [startTimer, resetTimer]);

  const handleManualChange = (index: number) => {
    setCurrentIndex(index);
    startTimer();
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0D0D0D]">
      
      {/* 1. ФОНОВЫЕ КАРТИНКИ + ГРАДИЕНТ (Двигаются вместе) */}
      <div className="absolute top-0 left-0 w-full z-0 h-[65%] md:h-full transition-all duration-500">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Контейнер с параллаксом: двигает и картинку, и градиент одновременно */}
            <div
              className="relative w-full h-full"
              style={{ transform: `translateY(${offsetY * 0.50}px)` }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center brightness-[0.6]"
                priority={index === 0}
              />
              {/* Градиент теперь ВНУТРИ, чтобы не было "отслойки" при движении */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0D0D0D]/90 z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. ТЕКСТОВЫЙ КОНТЕНТ */}
      <div id="hero-text-content" className="relative z-30 h-full flex flex-col justify-end px-4 md:px-10 pb-24 md:pb-24 pointer-events-none">
        <div key={currentIndex} className="max-w-4xl opacity-0 animate-fade-up pointer-events-auto">
      
          {/* Надзаголовок */}
          <div className="flex items-center gap-4 mb-2 md:mb-3">
              <span className="text-[#d1d1d1] text-[10px] md:text-[14px] tracking-[0.2em] uppercase font-light">
                {currentSlide.subtitle}
              </span>
          </div>

          {/* Заголовок */}
          <h1 className="text-white text-[32px] md:text-[70px] leading-[1.1] font-serif uppercase tracking-tight mb-3 md:mb-4">
            {currentSlide.title}
          </h1>

          {/* Описание */}
          <div className="flex items-center gap-4 mb-8 md:mb-10">
              <div className="h-[1px] w-8 md:w-12 bg-[#d1d1d1]/60"></div>
              <p className="text-[#d1d1d1]/80 text-[13px] md:text-[18px] max-w-xl leading-relaxed font-light">
                {currentSlide.description}
              </p>
          </div>

          {/* Кнопка */}
          {currentSlide.showButton && currentSlide.buttonUrl ? (
            <div className="mt-2 flex justify-start">
              <a
                href={currentSlide.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 px-7 py-3 md:px-10 md:py-4 rounded-full border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-full pointer-events-none -z-10 backdrop-blur-3xl transition-all duration-300 group-hover:backdrop-blur-3xl" />
                <span className="text-[12px] md:text-[15px] text-white tracking-[0.1em] uppercase font-light transition-colors duration-300">
                  {currentSlide.buttonText}
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          ) : currentSlide.showButton ? (
            <div className="mt-2 flex justify-start">
              <button
                className="group relative flex items-center gap-2 px-7 py-3 md:px-10 md:py-4 rounded-full border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-full pointer-events-none -z-10 backdrop-blur-md transition-all duration-300 group-hover:backdrop-blur-xl" />
                <span className="text-[12px] md:text-[15px] text-white tracking-[0.2em] uppercase font-light transition-colors duration-300">
                  {currentSlide.buttonText}
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          ) : null}
      </div>
    </div>

      {/* 3. НАВИГАЦИЯ */}
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 z-40 flex items-center gap-6 md:gap-10 pointer-events-auto">
        <div className="flex items-baseline gap-2 text-white font-serif">
            <span className="text-[24px] md:text-[42px] leading-none">{currentIndex + 1}</span>
            <div className="h-[1px] w-6 md:w-12 bg-white/20 -translate-y-1 md:-translate-y-2 overflow-hidden relative">
              <div 
                key={currentIndex} 
                className="h-full bg-white"
                style={{
                  animation: 'progressBar 10s linear forwards'
                }}
              ></div>
            </div>
            <span className="text-[14px] md:text-[20px] text-white/40">{((currentIndex + 1) % slides.length) + 1}</span>
        </div>

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