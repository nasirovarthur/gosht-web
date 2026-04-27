"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { pickLocalized, translations } from "@/types/i18n";
import type { FeedbackSettingsData } from "@/types/feedback";
import type { LangCode, NavItem } from "@/types/i18n";

const FeedbackDrawer = dynamic(() => import("@/components/FeedbackDrawer"), {
  ssr: false,
});

type HeaderProps = {
  navItems: NavItem[];
  feedbackSettings: FeedbackSettingsData;
};

export default function Header({ navItems = [], feedbackSettings }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { lang, setLang } = useLanguage();
  const { theme } = useTheme();

  // Arrow animation state
  const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);
  const [arrowTop, setArrowTop] = useState<number>(0);
  const menuRefs = useRef<(HTMLElement | null)[]>([]);

  const languages: LangCode[] = ["uz", "ru", "en"];

  const handleLanguageChange = (newLang: LangCode) => {
    const scrollPosition = window.scrollY;
    
    setLang(newLang);
    const newPathname = pathname.replace(/^\/(uz|ru|en)/, `/${newLang}`);
    
    router.push(newPathname || `/${newLang}`, { scroll: false });
    
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  const menuButtonText = translations.header.menu;
  const deliveryButtonText = translations.header.delivery;
  const closeButtonText = translations.header.close;
  const feedbackButtonText =
    pickLocalized(feedbackSettings.title, lang) ||
    pickLocalized(translations.footer.feedback, lang);
  const isAnyDrawerOpen = isOpen || isFeedbackOpen;
  const headerNavItems = navItems.filter((item) => item.showInHeader);
  const logoSrc = theme === "light" ? "/logo-dark.svg" : "/logo.svg";
  const menuLogoSrc = theme === "light" ? "/menu-logo-dark.svg" : "/menu-logo.svg";

  useBodyScrollLock(isAnyDrawerOpen);

  useEffect(() => {
    const handleOpenFeedbackDrawer = () => {
      setIsOpen(false);
      setIsFeedbackOpen(true);
    };

    window.addEventListener("open-feedback-drawer", handleOpenFeedbackDrawer);

    return () => {
      window.removeEventListener("open-feedback-drawer", handleOpenFeedbackDrawer);
    };
  }, []);

  const resolveMenuHref = (href: string | null) => {
    if (!href) return null;
    if (/^(https?:|mailto:|tel:)/.test(href)) return href;
    if (href.startsWith("#")) return href;
    if (/^\/(uz|ru|en)(\/|$)/.test(href)) {
      return href.replace(/^\/(uz|ru|en)(?=\/|$)/, `/${lang}`);
    }
    return `/${lang}${href.startsWith("/") ? href : `/${href}`}`;
  };

  return (
    <>
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 w-full z-40 bg-base text-secondary transition-all duration-300 border-b border-subtle">
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x relative">
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* MENU BUTTON */}
            <button 
              onClick={() => {
                setIsFeedbackOpen(false);
                setIsOpen(true);
              }}
              className="group flex items-center justify-center gap-3 md:gap-4 h-[40px] w-[40px] sm:w-auto sm:pl-4 sm:pr-4 md:h-[60px] md:pl-6 md:pr-8 border border-subtle rounded-full hover:bg-[color:var(--interactive-hover)] transition-all active:scale-95"
            >
              <svg className="w-[14px] h-[10px] md:w-[24px] md:h-[16px] fill-[color:var(--text-muted)] group-hover:fill-[color:var(--text-primary)] transition-colors" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="1.5" />
                <rect y="5.25" width="18" height="1.5" />
                <rect y="10.5" width="18" height="1.5" />
              </svg>
              <span className="hidden sm:inline text-ui font-light pt-0.5 text-secondary">
                {pickLocalized(menuButtonText, lang)}
              </span>
            </button>

            <Link
              href={`/${lang}/restaurants-concept`}
              onClick={() => {
                setIsOpen(false);
                setIsFeedbackOpen(false);
              }}
              className="group flex items-center justify-center gap-3 md:gap-4 h-[40px] w-[40px] md:h-[60px] md:w-[60px] lg:w-auto lg:pl-5 lg:pr-7 border border-subtle rounded-full hover:bg-[color:var(--interactive-hover)] transition-all active:scale-95"
              aria-label={pickLocalized(deliveryButtonText, lang)}
            >
              <svg
                className="h-[16px] w-[16px] md:h-[22px] md:w-[22px] text-muted group-hover:text-primary transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13.5H19L17.8 20H6.2L5 13.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 13.5C8.5 10.5 10.07 8 12 8C13.93 8 15.5 10.5 15.5 13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M4 13.5H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="hidden lg:inline text-ui font-light pt-0.5 text-secondary">
                {pickLocalized(deliveryButtonText, lang)}
              </span>
            </Link>
          </div>

          {/* LOGO */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href={`/${lang}`} className="relative w-[120px] h-[50px] md:w-[200px] md:h-[80px] hover:opacity-80 transition-opacity cursor-pointer z-50 block">
                <Image
                  src={logoSrc}
                  alt="GOSHT Logo"
                  fill
                  sizes="(max-width: 768px) 120px, 200px"
                  className="object-contain scale-125 md:scale-90 origin-center" 
                  priority
                />
            </Link>
          </div>
          
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="group flex items-center justify-center h-[40px] w-[40px] rounded-full border border-subtle hover:bg-[color:var(--interactive-hover)] transition-all"
              aria-label={feedbackButtonText}
            >
              <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H9L4 20V5.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Language Selector (Desktop) */}
          <div className="hidden md:flex items-center justify-end min-w-[140px] gap-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="group flex items-center gap-3 pl-5 pr-6 h-[60px] border border-subtle rounded-full hover:bg-[color:var(--interactive-hover)] transition-all"
            >
              <svg className="w-[18px] h-[18px] text-muted group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H9L4 20V5.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-ui font-light pt-0.5 text-secondary">
                {feedbackButtonText}
              </span>
            </button>
            <div className="group relative flex items-center h-[60px] bg-transparent border border-subtle rounded-full overflow-hidden transition-all duration-500 hover:w-[220px] w-[80px] hover:bg-[color:var(--interactive-hover)] cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                <span className="text-ui font-light text-primary">{lang.toUpperCase()}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                {languages.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleLanguageChange(item)}
                    className={`text-ui font-light transition-colors ${lang === item ? "text-primary" : "text-muted hover:text-primary"}`}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* MENU OVERLAY */}
      <div
        onClick={() => {
          setIsOpen(false);
          setIsFeedbackOpen(false);
        }}
        className={`fixed inset-0 z-[49] bg-[color:var(--overlay-backdrop)] ${
          isAnyDrawerOpen ? "opacity-100 backdrop-blur-[4px] visible" : "opacity-0 backdrop-blur-none invisible"
        }`}
        style={{ transition: 'all 0.7s ease' }}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full z-[60] bg-panel text-secondary transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full flex flex-col justify-between overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxWidth: 'min(100vw, 700px)', width: 'min(100vw, 700px)'}}
      >
        
        {/* Close bar */}
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x flex-shrink-0 border-b border-subtle relative z-20">
            <button 
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-subtle rounded-full hover:bg-[color:var(--interactive-hover)] transition-all"
            >
                <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] fill-[color:var(--text-muted)] group-hover:fill-[color:var(--text-primary)] transition-colors" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                </svg>
                <span className="text-ui font-light pt-0.5 text-secondary">
                  {pickLocalized(closeButtonText, lang)}
                </span>
            </button>

            {/* Mobile languages */}
            <div className="flex md:hidden items-center gap-4 pr-2 relative z-10">
                {languages.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleLanguageChange(item)}
                    className={`text-ui font-light transition-colors ${
                      lang === item ? "text-primary underline decoration-1 underline-offset-4" : "text-muted"
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
            </div>
        </div>

        {/* NAV LINKS */}
        <div className="flex-1 overflow-y-auto p-6 md:p-6 border-r border-subtle flex flex-col justify-start relative z-10">
            <nav className="flex flex-col gap-6 md:gap-8 pl-14 md:pl- mt-20 md:mt-12 relative">
                
                {/* Animated arrow */}
                <span
                  className="absolute left-10 flex items-center h-[22px] md:h-[28px] pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    top: arrowTop,
                    opacity: hoveredIndex !== null ? 1 : 0,
                    color: "var(--text-muted)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>

                {headerNavItems.map((item, index) => {
                  const href = resolveMenuHref(item.href);
                  const itemClassName = `text-nav font-light leading-tight flex items-center gap-4 pl-8 relative transition-[transform,opacity,color] duration-500 ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  } ${href ? "text-primary hover:text-secondary" : "text-secondary cursor-default"}`;
                  const itemStyle = { transitionDelay: `${120 + index * 55}ms` };
                  const itemLabel = pickLocalized(item.label, lang);

                  const handlePointerEnter = () => {
                    setHoveredIndex(index);
                    if (menuRefs.current[index]) {
                      setArrowTop(menuRefs.current[index].offsetTop);
                    }
                  };

                  if (!href) {
                    return (
                      <span
                        key={item._key || index}
                        ref={el => { menuRefs.current[index] = el; }}
                        className={itemClassName}
                        style={itemStyle}
                        onMouseEnter={handlePointerEnter}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {itemLabel}
                      </span>
                    );
                  }

                  const isExternal = /^(https?:|mailto:|tel:)/.test(href);

                  if (isExternal) {
                    return (
                      <a
                        key={item._key || index}
                        href={href}
                        ref={el => { menuRefs.current[index] = el; }}
                        className={itemClassName}
                        style={itemStyle}
                        onMouseEnter={handlePointerEnter}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setIsOpen(false)}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      >
                        {itemLabel}
                      </a>
                    );
                  }

                  return (
                    <Link 
                      key={item._key || index} 
                      href={href}
                      ref={el => { menuRefs.current[index] = el; }}
                      className={itemClassName}
                      style={itemStyle}
                      onMouseEnter={handlePointerEnter}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setIsOpen(false)}
                    >
                        {itemLabel}
                    </Link>
                  );
                })}
            </nav>
        </div>

        {/* BOTTOM LOGO */}
        <div className="pointer-events-none z-0 absolute bottom-[-150px] right-[-80px] w-[90%] h-[800px] overflow-hidden opacity-50 md:opacity-100">
            <div className="relative w-full h-full">
                <Image
                  src={menuLogoSrc}
                  alt="Background Logo"
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
            </div>
        </div>
      </div>

      {isFeedbackOpen ? (
        <FeedbackDrawer
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          lang={lang}
          settings={feedbackSettings}
        />
      ) : null}
    </>
  );
}
