"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { pickLocalized } from "@/types/i18n";
import type { Localized } from "@/types/i18n";

type Slide = {
  id: string;
  subtitle: Localized;
  title: Localized;
  description: Localized;
  buttonText: Localized;
  showButton: boolean;
  image: string;
  buttonMode: "none" | "custom" | "event";
  buttonUrl?: string;
  eventSlug?: string;
};

export default function HeroSliderClient({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [textScale, setTextScale] = useState(1);
  
  const { lang } = useLanguage();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

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

  // Параллакс эффект с requestAnimationFrame для плавности
  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      
      // Отменяем предыдущий RAF если он ещё не выполнен
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Используем RAF для синхронизации с refresh rate браузера
      rafRef.current = requestAnimationFrame(() => {
        setOffsetY(lastScrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    startTimer();
    return () => resetTimer();
  }, [startTimer, resetTimer]);

  useEffect(() => {
    const applyScale = () => {
      const width = window.innerWidth;
      setTextScale(width > 1920 ? width / 1920 : 1);
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    return () => {
      window.removeEventListener("resize", applyScale);
    };
  }, []);

  const handleManualChange = (index: number) => {
    setCurrentIndex(index);
    startTimer();
  };

  const currentSlide = slides[currentIndex];
  const heroHref =
    currentSlide.buttonMode === "event" && currentSlide.eventSlug
      ? `/${lang}/events/${encodeURIComponent(currentSlide.eventSlug)}`
      : currentSlide.buttonMode === "custom"
        ? currentSlide.buttonUrl
        : undefined;
  const isExternalHref = Boolean(heroHref && /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(heroHref));
  const isInternalHref = Boolean(heroHref && heroHref.startsWith("/"));
  const buttonClassName =
    "group relative flex items-center gap-2 px-7 py-3 md:px-10 md:py-4 rounded-full border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none";
  const buttonInner = (
    <>
      <span className="absolute inset-0 rounded-full pointer-events-none -z-10 backdrop-blur-3xl transition-all duration-300 group-hover:backdrop-blur-3xl" />
      <span className="text-ui text-white font-light transition-colors duration-300">
        {pickLocalized(currentSlide.buttonText, lang)}
      </span>
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-base">
      
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
              style={{ 
                transform: `translate3d(0, ${offsetY * 0.50}px, 0)`,
                willChange: 'transform'
              }}
            >
              <Image
                src={slide.image}
                alt={pickLocalized(slide.title, lang)}
                fill
                className="object-cover object-center brightness-[0.6]"
                priority={index === 0}
              />
              {/* Градиент теперь ВНУТРИ, чтобы не было "отслойки" при движении */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0D0D0D]/95 z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. ТЕКСТОВЫЙ КОНТЕНТ */}
      <div
        id="hero-text-content"
        className="relative z-30 h-full flex flex-col justify-end page-x pb-24 md:pb-24 pointer-events-none"
        style={{ transform: `scale(${textScale})`, transformOrigin: "bottom left" }}
      >
        <div key={currentIndex} className="max-w-4xl pointer-events-auto">
          <div className="flex items-center gap-4 mb-2 md:mb-3">
            <span className="text-[#d1d1d1] text-label font-light">
              {pickLocalized(currentSlide.subtitle, lang)}
            </span>
          </div>

          <div>
            <p className="text-white text-display mb-3 md:mb-4">
              {pickLocalized(currentSlide.title, lang)}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="h-[1px] w-8 md:w-12 bg-[#d1d1d1]/60"></div>
            <p className="text-[#d1d1d1]/80 text-body-lg max-w-xl font-light">
              {pickLocalized(currentSlide.description, lang)}
            </p>
          </div>

          {currentSlide.showButton && heroHref ? (
            <div className="mt-2 flex justify-start">
              {isInternalHref ? (
                <Link href={heroHref} className={buttonClassName}>
                  {buttonInner}
                </Link>
              ) : (
                <a
                  href={heroHref}
                  target={isExternalHref ? "_blank" : undefined}
                  rel={isExternalHref ? "noopener noreferrer" : undefined}
                  className={buttonClassName}
                >
                  {buttonInner}
                </a>
              )}
            </div>
          ) : null}
        </div>
    </div>

      {/* 3. НАВИГАЦИЯ */}
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 z-20 flex items-center gap-6 md:gap-10 pointer-events-auto">
        <div className="flex items-baseline gap-2 text-white font-serif">
            <span className="text-counter">{currentIndex + 1}</span>
            <div className="h-[1px] w-6 md:w-12 bg-white/20 -translate-y-1 md:-translate-y-2 overflow-hidden relative">
              <div 
                key={currentIndex} 
                className="h-full bg-white"
                style={{
                  animation: 'progressBar 10s linear forwards'
                }}
              ></div>
            </div>
            <span className="text-counter-sm text-white/40">{((currentIndex + 1) % slides.length) + 1}</span>
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
