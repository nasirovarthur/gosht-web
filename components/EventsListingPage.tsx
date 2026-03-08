"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { EventCategory, EventItem, Localized } from "@/lib/eventsData";

type TabValue = "all" | EventCategory;
type EventsListingLabels = {
  title: Localized;
  all: Localized;
  events: Localized;
  kids: Localized;
  more: Localized;
};

function pickLocalized(value: Localized, lang: "uz" | "ru" | "en"): string {
  return value[lang] || value.uz;
}

function EventsCard({ event }: { event: EventItem }) {
  const { lang } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const title = event.title[lang] || event.title.uz;
  const date = event.date[lang] || event.date.uz;
  const branch = event.branch[lang] || event.branch.uz;

  return (
    <article className="group w-full">
      <Link href={`/${lang}/events/${event.slug}`} className="block w-full">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-card border border-white/10">
          {!imageFailed && (
            <Image
              src={event.image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 33vw"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <p className="mt-4 flex items-center gap-2 text-[12px] md:text-[13px] tracking-[0.16em] uppercase text-white/45">
          <span>{date}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/55">{branch}</span>
        </p>

        <h3 className="mt-2 uppercase text-[clamp(22px,1.65vw,34px)] leading-[1.05] tracking-[-0.01em] text-white/92 font-light font-serif transition-colors duration-300 group-hover:text-[#AE0E16]">
          {title}
        </h3>
      </Link>
    </article>
  );
}

export default function EventsListingPage({
  events,
  labels,
  initialVisibleCount,
}: {
  events: EventItem[];
  labels: EventsListingLabels;
  initialVisibleCount: number;
}) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return events;
    return events.filter((item) => item.category === activeTab);
  }, [activeTab, events]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const canLoadMore = filteredEvents.length > visibleEvents.length;

  const onTabClick = (tab: TabValue) => {
    setActiveTab(tab);
    setVisibleCount(initialVisibleCount);
  };

  const menuButtonLikeClass =
    "group flex items-center h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all active:scale-95";
  const tabBaseClass =
    "flex items-center h-[40px] md:h-[60px] border rounded-full transition-colors duration-300 active:scale-95";

  return (
    <section className="w-full bg-base min-h-screen section-y-lg">
      <div className="page-x mb-14 md:mb-16 lg:mb-20">
        <div className="w-full">
          <h1 className="text-[clamp(48px,5.4vw,102px)] leading-[0.9] tracking-[-0.02em] text-white font-light font-serif mb-12 md:mb-14">
            {pickLocalized(labels.title, lang)}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {([
              { key: "all", label: pickLocalized(labels.all, lang) },
              { key: "event", label: pickLocalized(labels.events, lang) },
              { key: "kids", label: pickLocalized(labels.kids, lang) },
            ] as const).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabClick(tab.key)}
                  className={`${tabBaseClass} pl-6 pr-6 md:pl-8 md:pr-8 text-ui font-light pt-0.5 ${
                    isActive
                      ? "bg-white border-white text-black"
                      : "bg-transparent border-white/10 text-white/90 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full page-x">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[18px] lg:gap-x-[22.5px] gap-y-20 lg:gap-y-24">
          {visibleEvents.map((event) => (
            <EventsCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {canLoadMore && (
        <div className="mt-14 md:mt-16 flex justify-center page-x">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className={`${menuButtonLikeClass} pl-6 pr-6 md:pl-8 md:pr-8 text-ui font-light pt-0.5 text-white/90`}
          >
            {pickLocalized(labels.more, lang)}
          </button>
        </div>
      )}
    </section>
  );
}
