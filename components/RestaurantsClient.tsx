"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import SliderButton from "./SliderButton";

const scrollbarHiddenStyles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

type Restaurant = {
  _id: string;
  name: LocalizedString;
  city: "tashkent" | "new_york";
  image: string;
  logo?: string;
  hasBanquet?: boolean;
  hasPlayground?: boolean;
  url?: string;
};

export default function RestaurantsClient({ items }: { items: Restaurant[] }) {
  const [activeCity, setActiveCity] = useState<"tashkent" | "new_york">("tashkent");
  const [lang] = useState<"uz" | "ru" | "en">("ru");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Состояния для кнопок
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredItems = items.filter((item) => item.city === activeCity);
  const getName = (field: LocalizedString) => field?.[lang] || field?.uz || "";

  const ui = {
    tashkent: lang === 'uz' ? "Toshkent" : lang === 'ru' ? "Ташкент" : "Tashkent",
    banquet: lang === 'uz' ? "Banket zali" : lang === 'ru' ? "Банкетный зал" : "Banquet Hall",
    playground: lang === 'uz' ? "Bolalar maydonchasi" : lang === 'ru' ? "Детская площадка" : "Playground",
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
    <section className="w-full bg-[#0D0D0D] pb-24 border-t border-white/5 pt-16 overflow-hidden">
      <style jsx global>{scrollbarHiddenStyles}</style>

      {/* HEADER */}
      <div className="relative px-4 md:px-10 mb-10 flex items-center justify-between md:justify-start">
        
        {/* ТАБЫ */}
        <div className="flex justify-start items-center gap-8 md:gap-12 relative z-10">
          <button onClick={() => setActiveCity("tashkent")} className="group relative pb-2 md:pb-3">
            <span className={`text-[20px] md:text-[28px] font-serif uppercase tracking-normal transition-colors duration-300 ${activeCity === "tashkent" ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
              {ui.tashkent}
            </span>
            <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-white transition-all duration-500 ease-out ${activeCity === "tashkent" ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-30"}`} />
          </button>

          <button onClick={() => setActiveCity("new_york")} className="group relative pb-2 md:pb-3">
            <span className={`text-[20px] md:text-[28px] font-serif uppercase tracking-normal transition-colors duration-300 ${activeCity === "new_york" ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
              New York
            </span>
            <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-white transition-all duration-500 ease-out ${activeCity === "new_york" ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-30"}`} />
          </button>
        </div>

        {/* КНОПКИ */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 gap-4">
            <SliderButton direction="left" onClick={handleScrollPrev} disabled={!canScrollLeft} />
            <SliderButton direction="right" onClick={handleScrollNext} disabled={!canScrollRight} />
        </div>
        
        {/* Мобильные кнопки */}
        <div className="flex md:hidden gap-2">
             <SliderButton direction="left" onClick={handleScrollPrev} className="scale-75 origin-right" disabled={!canScrollLeft} />
             <SliderButton direction="right" onClick={handleScrollNext} className="scale-75 origin-right" disabled={!canScrollRight} />
        </div>
      </div>

      {/* СЛАЙДЕР */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar scroll-pl-4 md:scroll-pl-10"
      >
        {filteredItems.map((item) => (
          <a
            key={item._id}
            href={item.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group block flex-shrink-0 w-[85vw] md:min-w-[calc((100%-128px)/3)] md:w-[calc((100%-128px)/3)] snap-start first:ml-4 md:first:ml-10 last:mr-4 md:last:mr-10"
          >
            {/* Карточка */}
            <div className="relative w-full h-[320px] md:h-[390px] overflow-hidden bg-[#1a1a1a] mb-4 border border-white/5 z-0">
                <div className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-105 z-0">
                  <Image src={item.image} alt={getName(item.name)} fill className="object-cover brightness-[0.85] group-hover:brightness-100 transition-all duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
                
                {/* ЛОГОТИП: Убрал group-hover:scale-105 */}
                {item.logo && (
                    <div className="absolute bottom-5 left-5 w-[70px] h-[70px] md:w-[80px] md:h-[80px] drop-shadow-lg z-20">
                        <Image src={item.logo} alt="logo" fill className="object-contain" />
                    </div>
                )}
            </div>

            {/* Инфо */}
            <div className="flex flex-col items-start px-1">
                <h3 className="text-white text-[22px] md:text-[24px] font-serif uppercase leading-none tracking-tight mb-3 group-hover:text-white/80 transition-colors">
                    {getName(item.name)}
                </h3>
                <div className="flex flex-wrap gap-5 text-[12px] md:text-[13px] text-white/50 uppercase tracking-wide font-light">
                    {item.hasBanquet && <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/60"></span><span>{ui.banquet}</span></div>}
                    {item.hasPlayground && <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/60"></span><span>{ui.playground}</span></div>}
                </div>
            </div>
          </a>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="w-full mx-4 md:mx-10 py-24 text-center border-t border-b border-white/5 text-white/30">
             <span className="text-[13px] uppercase tracking-widest">{lang === 'uz' ? "Ro'yxat bo'sh" : lang === 'ru' ? "Список пуст" : "List is empty"}</span>
        </div>
      )}
    </section>
  );
}