"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SliderButton from "./SliderButton";
import { useLanguage } from "@/context/LanguageContext";

const scrollbarHiddenStyles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

type LocalizedString = {
  uz?: string;
  ru?: string;
  en?: string;
};

type Restaurant = {
  _id: string;
  name: LocalizedString;
  slug?: string;
  projectType: "restaurant" | "barbershop";
  city: string;
  image: string;
  logo?: string;
  hasBanquet?: boolean;
  hasPlayground?: boolean;
  hasVipRoom?: boolean;
  hasKidsHaircut?: boolean;
  url?: string;
};

export default function RestaurantsClient({ items }: { items: Restaurant[] }) {
  const [activeCity, setActiveCity] = useState<"tashkent" | "new_york">("tashkent");
  const { lang } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Состояния для кнопок
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredItems = items.filter((item) => item.city === activeCity);
  const getName = (field: LocalizedString) => field?.[lang] || field?.uz || "";

  const ui = {
    sectionTitle:
      lang === "uz" ? "Loyihalar va filiallar" : lang === "ru" ? "Проекты и филиалы" : "Projects and branches",
    tashkent: lang === 'uz' ? "Toshkent" : lang === 'ru' ? "Ташкент" : "Tashkent",
    previous:
      lang === "uz" ? "Oldingi kartalar" : lang === "ru" ? "Предыдущие карточки" : "Previous cards",
    next:
      lang === "uz" ? "Keyingi kartalar" : lang === "ru" ? "Следующие карточки" : "Next cards",
    banquet: lang === 'uz' ? "Banket zali" : lang === 'ru' ? "Банкетный зал" : "Banquet Hall",
    playground: lang === 'uz' ? "Bolalar maydonchasi" : lang === 'ru' ? "Детская площадка" : "Playground",
    vipRoom: lang === 'uz' ? "VIP kabinet" : lang === 'ru' ? "VIP-кабинет" : "VIP Room",
    kidsHaircut: lang === 'uz' ? "Bolalar soch turmagi" : lang === 'ru' ? "Детская стрижка" : "Kids Haircut",
  };

  const getFeatureTags = (item: Restaurant) => {
    if (item.projectType === "barbershop") {
      return [
        item.hasVipRoom ? ui.vipRoom : null,
        item.hasKidsHaircut ? ui.kidsHaircut : null,
      ].filter((value): value is string => Boolean(value));
    }

    return [
      item.hasBanquet ? ui.banquet : null,
      item.hasPlayground ? ui.playground : null,
    ].filter((value): value is string => Boolean(value));
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [filteredItems]);

  const getScrollAmount = () => {
    if (scrollContainerRef.current) {
        const firstCard = scrollContainerRef.current.firstElementChild as HTMLElement;
        if (firstCard) {
            return firstCard.offsetWidth + 24; 
        }
    }
    return 300;
  };

  const handleScrollNext = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ 
            left: getScrollAmount(),
            behavior: "smooth" 
        });
    }
  };

  const handleScrollPrev = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ 
            left: -getScrollAmount(),
            behavior: "smooth" 
        });
    }
  };

  return (
    <section className="w-full bg-base section-y-lg border-t border-subtle overflow-hidden transition-colors duration-300">
      <style jsx global>{scrollbarHiddenStyles}</style>
      <h2 className="sr-only">{ui.sectionTitle}</h2>

      {/* HEADER */}
      <div className="relative page-x mb-10 flex items-center justify-between md:justify-start">
        
        {/* ТАБЫ */}
        <div className="flex justify-start items-center gap-8 md:gap-12 relative z-10">
          <button onClick={() => setActiveCity("tashkent")} className="group relative pb-2 md:pb-3">
            <span className={`text-title transition-colors duration-300 ${activeCity === "tashkent" ? "text-primary" : "text-muted group-hover:text-secondary"}`}>
              {ui.tashkent}
            </span>
            <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[color:var(--text-primary)] transition-all duration-500 ease-out ${activeCity === "tashkent" ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-30"}`} />
          </button>

          <button onClick={() => setActiveCity("new_york")} className="group relative pb-2 md:pb-3">
            <span className={`text-title transition-colors duration-300 ${activeCity === "new_york" ? "text-primary" : "text-muted group-hover:text-secondary"}`}>
              New York
            </span>
            <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[color:var(--text-primary)] transition-all duration-500 ease-out ${activeCity === "new_york" ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-30"}`} />
          </button>
        </div>

        {/* КНОПКИ */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 gap-4">
            <SliderButton direction="left" onClick={handleScrollPrev} disabled={!canScrollLeft} ariaLabel={ui.previous} />
            <SliderButton direction="right" onClick={handleScrollNext} disabled={!canScrollRight} ariaLabel={ui.next} />
        </div>
        
        {/* Мобильные кнопки */}
        <div className="flex md:hidden gap-2">
             <SliderButton direction="left" onClick={handleScrollPrev} className="scale-75 origin-right" disabled={!canScrollLeft} ariaLabel={ui.previous} />
             <SliderButton direction="right" onClick={handleScrollNext} className="scale-75 origin-right" disabled={!canScrollRight} ariaLabel={ui.next} />
        </div>
      </div>

      {/* СЛАЙДЕР */}
      <div className="page-x">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar"
        >
        {filteredItems.map((item) => {
          const featureTags = getFeatureTags(item);
          const normalizedSlug = item.slug ? item.slug.replace(/^\/+|\/+$/g, "") : undefined;
          const fallbackHref = `/${lang}/restaurants`;
          const detailHref = normalizedSlug
            ? `/${lang}/restaurants/${encodeURIComponent(normalizedSlug)}`
            : fallbackHref;
          const href = normalizedSlug ? detailHref : item.url || fallbackHref;
          const isExternal = !normalizedSlug && Boolean(item.url);

          return (
            <Link
              key={item._id}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group block flex-shrink-0 w-[78vw] sm:w-[66vw] md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] snap-start"
            >
            {/* Карточка */}
            <div className="relative w-full h-[320px] md:h-[390px] overflow-hidden bg-card mb-4 border border-subtle z-0">
                <div className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-105 z-0">
                  <Image
                    src={item.image}
                    alt={getName(item.name)}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 768px) 66vw, (max-width: 1024px) calc((100vw - 72px) / 2), calc((100vw - 176px) / 3)"
                    className="object-cover brightness-[0.85] group-hover:brightness-100 transition-all duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
                
                {/* ЛОГОТИП: Убрал group-hover:scale-105 */}
                {item.logo && (
                  <div className="absolute bottom-5 left-5 w-[70px] h-[70px] md:w-[80px] md:h-[80px] drop-shadow-lg z-20">
                        <Image
                          src={item.logo}
                          alt={`${getName(item.name)} logo`}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Инфо */}
            <div className="flex flex-col items-start px-1">
                <h3 className="text-primary text-title-sm leading-none mb-3 group-hover:text-secondary transition-colors">
                    {getName(item.name)}
                </h3>
                <div className="flex flex-wrap gap-5 text-meta text-muted font-light">
                    {featureTags.map((tag) => (
                      <div key={tag} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[color:var(--text-muted)]" />
                        <span>{tag}</span>
                      </div>
                    ))}
                </div>
            </div>
            </Link>
          );
        })}
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="w-full page-x py-24 text-center border-t border-b border-subtle text-muted">
             <span className="text-meta">{lang === 'uz' ? "Ro'yxat bo'sh" : lang === 'ru' ? "Список пуст" : "List is empty"}</span>
        </div>
      )}
    </section>
  );
}
