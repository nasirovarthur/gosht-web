"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import FeedbackDrawer from "@/components/FeedbackDrawer";
import { useLanguage } from "@/context/LanguageContext";
import { pickLocalized, translations } from "@/types/i18n";
import type { FeedbackSettingsData } from "@/types/feedback";
import type { LangCode, NavItem } from "@/types/i18n";

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
  const closeButtonText = translations.header.close;
  const feedbackButtonText =
    pickLocalized(feedbackSettings.title, lang) ||
    pickLocalized(translations.footer.feedback, lang);
  const isAnyDrawerOpen = isOpen || isFeedbackOpen;
  const headerNavItems = navItems.filter((item) => item.showInHeader);

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
      <header className="fixed top-0 left-0 w-full z-40 bg-base text-[#d1d1d1] transition-all duration-300 border-b border-white/5">
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x relative">
          
          {/* MENU BUTTON */}
          <button 
            onClick={() => {
              setIsFeedbackOpen(false);
              setIsOpen(true);
            }}
            className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all active:scale-95"
          >
            <svg className="w-[14px] h-[10px] md:w-[24px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="1.5" />
              <rect y="5.25" width="18" height="1.5" />
              <rect y="10.5" width="18" height="1.5" />
            </svg>
            <span className="text-ui font-light pt-0.5 text-white/90">
              {pickLocalized(menuButtonText, lang)}
            </span>
          </button>

          {/* LOGO */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href={`/${lang}`} className="relative w-[120px] h-[50px] md:w-[200px] md:h-[80px] hover:opacity-80 transition-opacity cursor-pointer z-50 block">
                <Image
                  src="/logo.svg" 
                  alt="GOSHT Logo"
                  fill
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
              className="group flex items-center justify-center h-[40px] w-[40px] rounded-full border border-white/10 hover:bg-white/5 transition-all"
              aria-label={feedbackButtonText}
            >
              <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              className="group flex items-center gap-3 pl-5 pr-6 h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all"
            >
              <svg className="w-[18px] h-[18px] text-white/65 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H9L4 20V5.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-ui font-light pt-0.5 text-white/90">
                {feedbackButtonText}
              </span>
            </button>

            <div className="group relative flex items-center h-[60px] bg-transparent border border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:w-[220px] w-[80px] hover:bg-white/5 cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                <span className="text-ui font-light text-white">{lang.toUpperCase()}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                {languages.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleLanguageChange(item)}
                    className={`text-ui font-light transition-colors ${lang === item ? "text-white" : "text-white/40 hover:text-white"}`}
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
        className={`fixed inset-0 z-[49] bg-black/60 ${
          isAnyDrawerOpen ? "opacity-100 backdrop-blur-[4px] visible" : "opacity-0 backdrop-blur-none invisible"
        }`}
        style={{ transition: 'all 0.7s ease' }}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full z-[60] bg-panel text-[#d1d1d1] transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full flex flex-col justify-between overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxWidth: 'min(100vw, 700px)', width: 'min(100vw, 700px)'}}
      >
        
        {/* Close bar */}
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x flex-shrink-0 border-b border-white/5 relative z-20">
            <button 
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all"
            >
                <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                </svg>
                <span className="text-ui font-light pt-0.5 text-white/90">
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
                      lang === item ? "text-white underline decoration-1 underline-offset-4" : "text-white/30"
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
            </div>
        </div>

        {/* NAV LINKS */}
        <div className="flex-1 overflow-y-auto p-6 md:p-6 border-r border-white/5 flex flex-col justify-start relative z-10">
            <nav className="flex flex-col gap-6 md:gap-8 pl-14 md:pl- mt-20 md:mt-12 relative">
                
                {/* Animated arrow */}
                <span
                  className="absolute left-10 flex items-center h-[22px] md:h-[28px] pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    top: arrowTop,
                    opacity: hoveredIndex !== null ? 1 : 0,
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>

                {headerNavItems.map((item, index) => {
                  const href = resolveMenuHref(item.href);
                  const itemClassName = `text-nav font-light leading-tight flex items-center gap-4 pl-8 relative transition-[transform,opacity,color] duration-500 ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  } ${href ? "text-white hover:text-white/60" : "text-white/90 cursor-default"}`;
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
                  src="/menu-logo.svg" 
                  alt="Background Logo"
                  fill
                  className="object-contain"
                />
            </div>
        </div>
      </div>

      <FeedbackDrawer
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        lang={lang}
        settings={feedbackSettings}
      />
    </>
  );
}
