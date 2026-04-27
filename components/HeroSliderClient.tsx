"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { pickLocalized } from "@/types/i18n";
import Reveal from "@/components/Reveal";
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
  const [textScale, setTextScale] = useState(1);
  
  const { lang } = useLanguage();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);

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

  // Параллакс применяем напрямую к DOM-узлу, чтобы не ререндерить весь hero на каждом scroll.
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
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translate3d(0, ${lastScrollY * 0.5}px, 0)`;
        }
      });
    };

    handleScroll();
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
    "group relative flex items-center gap-2 px-7 py-3 md:px-10 md:py-4 rounded-full border border-[color:var(--hero-button-border)] bg-[color:var(--hero-button-bg)] text-[color:var(--hero-text-primary)] transition-all duration-300 hover:bg-[color:var(--hero-button-hover)] hover:border-[color:var(--hero-text-primary)] focus:outline-none";
  const buttonInner = (
    <>
      <span className="absolute inset-0 rounded-full pointer-events-none -z-10 backdrop-blur-3xl transition-all duration-300 group-hover:backdrop-blur-3xl" />
      <span className="text-ui text-[color:var(--hero-text-primary)] font-light transition-colors duration-300">
        {pickLocalized(currentSlide.buttonText, lang)}
      </span>
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </>
  );
  const navLabels = {
    previous:
      lang === "ru"
        ? "Предыдущий слайд"
        : lang === "en"
          ? "Previous slide"
          : "Oldingi slayd",
    next:
      lang === "ru"
        ? "Следующий слайд"
        : lang === "en"
          ? "Next slide"
          : "Keyingi slayd",
  };

  return (
    <div className="relative w-full min-h-[100svh] h-[100svh] md:min-h-screen md:h-screen overflow-hidden bg-base transition-colors duration-300">
      
      {/* 1. ФОНОВЫЕ КАРТИНКИ + ГРАДИЕНТ (Двигаются вместе) */}
      <div
        ref={parallaxRef}
        className="absolute top-0 left-0 w-full z-0 h-[65%] md:h-full"
        style={{ willChange: "transform" }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={pickLocalized(slide.title, lang)}
                fill
                sizes="100vw"
                className="object-cover object-center"
                style={{ filter: "var(--hero-image-filter)" }}
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : undefined}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Градиент теперь ВНУТРИ, чтобы не было "отслойки" при движении */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--hero-overlay-top), var(--hero-overlay-middle) 34%, transparent 56%, var(--hero-overlay-bottom))",
                }}
              />
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
          <Reveal
            trigger="mount"
            delay={70}
            className="flex items-center gap-4 mb-2 md:mb-3"
          >
            <span className="text-[color:var(--hero-text-secondary)] text-label font-light">
              {pickLocalized(currentSlide.subtitle, lang)}
            </span>
          </Reveal>

          <Reveal trigger="mount" delay={150} distance={52} blur={12} as="div">
            <p className="text-[color:var(--hero-text-primary)] text-display mb-3 md:mb-4">
              {pickLocalized(currentSlide.title, lang)}
            </p>
          </Reveal>

          <Reveal
            trigger="mount"
            delay={240}
            className="flex items-center gap-4 mb-8 md:mb-10"
          >
            <div className="h-[1px] w-8 md:w-12 bg-[color:var(--hero-button-border)]"></div>
            <p className="text-[color:var(--hero-text-secondary)] text-body-lg max-w-xl font-light">
              {pickLocalized(currentSlide.description, lang)}
            </p>
          </Reveal>

          {currentSlide.showButton && heroHref ? (
            <Reveal trigger="mount" delay={320} className="mt-2 flex justify-start">
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
            </Reveal>
          ) : null}
        </div>
    </div>

      {/* 3. НАВИГАЦИЯ */}
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 z-20 flex items-center gap-6 md:gap-10 pointer-events-auto">
        <div className="flex items-baseline gap-2 text-[color:var(--hero-text-primary)] font-serif">
            <span className="text-counter">{currentIndex + 1}</span>
            <div className="h-[1px] w-6 md:w-12 bg-[color:var(--hero-button-border)] -translate-y-1 md:-translate-y-2 overflow-hidden relative">
              <div 
                key={currentIndex} 
                className="h-full bg-[color:var(--hero-text-primary)]"
                style={{
                  animation: 'progressBar 10s linear forwards'
                }}
              ></div>
            </div>
            <span className="text-counter-sm text-[color:var(--hero-text-muted)]">{((currentIndex + 1) % slides.length) + 1}</span>
        </div>

        <div className="flex gap-2 md:gap-4">
            <button 
                type="button"
                onClick={() => handleManualChange((currentIndex - 1 + slides.length) % slides.length)}
                aria-label={navLabels.previous}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[color:var(--hero-button-border)] bg-[color:var(--hero-button-bg)] text-[color:var(--hero-text-primary)] flex items-center justify-center transition-all hover:bg-[color:var(--hero-button-hover)] active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180" aria-hidden="true">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <button 
                type="button"
                onClick={() => handleManualChange((currentIndex + 1) % slides.length)}
                aria-label={navLabels.next}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[color:var(--hero-button-border)] bg-[color:var(--hero-button-bg)] text-[color:var(--hero-text-primary)] flex items-center justify-center transition-all hover:bg-[color:var(--hero-button-hover)] active:scale-95"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
      </div>

    </div>
  );
}
