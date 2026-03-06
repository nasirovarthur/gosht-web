"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SliderButton from "@/components/SliderButton";

type Localized = {
  uz: string;
  ru: string;
  en: string;
};

type EventCardData = {
  id: string;
  title: Localized;
  date: Localized;
  image: string;
  href: string;
};

const featuredEvent: EventCardData = {
  id: "featured",
  date: {
    uz: "12 MART 2026",
    ru: "12 МАРТА 2026",
    en: "MARCH 12, 2026",
  },
  title: {
    uz: "AQUAMARINE X JCOS hamkorlik kechasi",
    ru: "Коллаборация AQUAMARINE X JCOS",
    en: "AQUAMARINE X JCOS Collaboration",
  },
  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=1500&fit=crop",
  href: "#",
};

const sideEvents: EventCardData[] = [
  {
    id: "side-1",
    date: {
      uz: "8 MART 2026",
      ru: "8 МАРТА 2026",
      en: "MARCH 8, 2026",
    },
    title: {
      uz: "Desertlar va bayramona kayfiyat",
      ru: "Десерты и праздничное настроение",
      en: "Desserts and Festive Mood",
    },
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1600&h=1000&fit=crop",
    href: "#",
  },
  {
    id: "side-2",
    date: {
      uz: "6 MART 2026",
      ru: "6 МАРТА 2026",
      en: "MARCH 6, 2026",
    },
    title: {
      uz: "Yangi kokteyl karta va maxsus servis",
      ru: "Новая коктейльная карта и спецсервис",
      en: "New Cocktail Menu and Special Service",
    },
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&h=1000&fit=crop",
    href: "#",
  },
];

function EventsLink({ label, href }: { label: string; href: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="inline-flex flex-col items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex items-center gap-8 md:gap-10">
        <Link href={href} className="text-body-lg text-white/72 hover:text-white transition-colors">
          {label}
        </Link>

        <SliderButton
          direction="right"
          forceHover={isHovered}
          className="scale-[0.45] md:scale-[0.56] origin-left -ml-3 md:-ml-2"
        />
      </div>

      <span className="relative mt-1 h-px w-full min-w-[208px] bg-white/20 overflow-hidden">
        <span
          className={`absolute inset-0 bg-white/65 transition-transform duration-500 ease-out ${
            isHovered ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </span>
    </div>
  );
}

function EventCard({
  item,
  variant,
}: {
  item: EventCardData;
  variant: "featured" | "small";
}) {
  const { lang } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  const imageWrapClass =
    variant === "featured"
      ? "aspect-[4/5] lg:aspect-auto lg:h-[calc(100%-118px)]"
      : "aspect-[16/10] lg:aspect-auto lg:h-[calc(100%-96px)]";

  const metaWrapClass = variant === "featured" ? "lg:h-[118px]" : "lg:h-[96px]";

  const titleClass =
    variant === "featured"
      ? "text-[clamp(30px,2.5vw,44px)] leading-[1.02]"
      : "text-[clamp(22px,1.7vw,30px)] leading-[1.04]";

  return (
    <article className="w-full h-full flex flex-col">
      <Link href={item.href} className="group block w-full h-full">
        <div className={`relative w-full overflow-hidden bg-card border border-white/10 ${imageWrapClass}`}>
          {!imageFailed && (
            <Image
              src={item.image}
              alt={item.title[lang]}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className={`mt-4 flex flex-col ${metaWrapClass}`}>
          <p className="text-[11px] md:text-[12px] tracking-[0.18em] uppercase text-white/45">
            {item.date[lang]}
          </p>
          <h3 className={`${titleClass} mt-2 tracking-[-0.01em] text-white/92 font-light font-serif`}>
            {item.title[lang]}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export default function EventsSection() {
  const { lang } = useLanguage();

  const heading = lang === "uz" ? "Voqealar" : lang === "en" ? "Events" : "События";
  const allEventsLabel = lang === "uz" ? "Barcha voqealar" : lang === "en" ? "All events" : "Все события";

  return (
    <section className="w-full bg-base text-white section-y-lg border-t border-white/5">
      <div className="page-x">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 mb-10 md:mb-12 lg:mb-10">
            <div className="lg:col-span-8">
              <h2 className="text-[clamp(42px,4.7vw,86px)] leading-[0.95] tracking-[-0.02em] font-light font-serif">
                {heading}
              </h2>
              <div className="mt-8 md:mt-10">
                <EventsLink label={allEventsLabel} href={`/${lang}/events`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 lg:min-h-[760px]">
            <div className="lg:col-span-8 h-full max-w-[980px]">
              <EventCard item={featuredEvent} variant="featured" />
            </div>

            <div className="lg:col-span-4 h-full lg:col-start-9">
              <div className="grid grid-cols-1 gap-10 lg:gap-8 h-full lg:grid-rows-2">
                <EventCard item={sideEvents[0]} variant="small" />
                <EventCard item={sideEvents[1]} variant="small" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
