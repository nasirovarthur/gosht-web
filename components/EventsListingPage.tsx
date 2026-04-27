"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/Reveal";
import { pickLocalized } from "@/types/i18n";
import type { Localized } from "@/types/i18n";
import type { EventCategory, EventItem } from "@/lib/eventsData";

type TabValue = "all" | EventCategory;
type EventsListingLabels = {
  title: Localized;
  all: Localized;
  events: Localized;
  kids: Localized;
  more: Localized;
};

function EventsEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Reveal as="div" className="page-x pt-12 md:pt-16" distance={32} blur={8}>
      <div className="mx-auto flex min-h-[280px] max-w-[920px] flex-col items-center justify-center text-center md:min-h-[340px]">
        <h2 className="text-[clamp(34px,4vw,62px)] leading-[0.92] tracking-[-0.03em] font-light font-serif uppercase text-primary">
          {title}
        </h2>
        <p className="mt-6 max-w-[680px] text-[15px] leading-relaxed text-secondary md:text-[18px]">
          {description}
        </p>
      </div>
    </Reveal>
  );
}

function EventsCard({ event, index }: { event: EventItem; index: number }) {
  const { lang } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const title = event.title[lang] || event.title.uz;
  const date = event.date[lang] || event.date.uz;
  const branch = event.branch[lang] || event.branch.uz;
  const description =
    event.description[0]?.[lang] ||
    event.description[0]?.uz ||
    event.description[0]?.ru ||
    event.description[0]?.en ||
    "";

  return (
    <Reveal as="article" className="group w-full" delay={Math.min(index, 5) * 80} distance={48} blur={10}>
      <Link href={`/${lang}/events/${event.slug}`} className="block w-full">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-card border border-subtle">
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

        <p className="mt-4 flex items-center gap-2 text-[12px] md:text-[13px] tracking-[0.16em] uppercase text-muted">
          <span>{date}</span>
          <span className="text-muted">•</span>
          <span className="text-secondary">{branch}</span>
        </p>

        <h3 className="mt-2 uppercase text-[clamp(22px,1.65vw,34px)] leading-[1.05] tracking-[-0.01em] text-primary font-light font-serif transition-colors duration-300 group-hover:text-[#AE0E16]">
          {title}
        </h3>

        {description ? (
          <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed text-secondary">
            {description}
          </p>
        ) : null}
      </Link>
    </Reveal>
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
    "group flex items-center h-[40px] md:h-[60px] border border-subtle rounded-full hover:bg-[color:var(--interactive-hover)] transition-all active:scale-95";
  const tabBaseClass =
    "flex items-center h-[40px] md:h-[60px] border rounded-full transition-colors duration-300 active:scale-95";
  const headerUi = {
    eyebrow:
      lang === "ru"
        ? "ЛЕНТА СОБЫТИЙ"
        : lang === "en"
          ? "EVENT PROGRAM"
          : "TADBIRLAR LENTASI",
    intro:
      lang === "ru"
        ? "Все события и форматы собраны в одном месте. Выбирайте нужную категорию и просматривайте афишу в едином ритме."
        : lang === "en"
          ? "All events and formats are collected in one place. Switch categories and browse the program in one rhythm."
          : "Barcha tadbirlar va formatlar bir joyda jamlangan. Kategoriya tanlang va afishani yagona ritmda ko‘ring.",
    emptyTitle:
      lang === "ru"
        ? "ПРЕДСТОЯЩИХ СОБЫТИЙ ПОКА НЕТ"
        : lang === "en"
          ? "NO UPCOMING EVENTS YET"
          : "HOZIRCHA KUTILAYOTGAN TADBIRLAR YO‘Q",
    emptyDescription:
      lang === "ru"
        ? "Мы готовим новую программу. Когда ближайшие события появятся в расписании, они будут опубликованы здесь."
        : lang === "en"
          ? "We are preparing the next program. As soon as upcoming events are scheduled, they will appear here."
          : "Yangi dastur tayyorlanmoqda. Eng yaqin tadbirlar jadvalga qo‘shilishi bilan ular shu yerda paydo bo‘ladi.",
    emptyFilteredDescription:
      lang === "ru"
        ? "Для выбранной категории пока нет ближайших анонсов. Попробуйте переключиться на другую вкладку или зайдите позже."
        : lang === "en"
          ? "There are no upcoming announcements in this category yet. Try another tab or check back later."
          : "Tanlangan kategoriya bo‘yicha hozircha yaqin anonslar yo‘q. Boshqa bo‘limni ochib ko‘ring yoki keyinroq qayting.",
  };

  return (
    <section className="w-full bg-base min-h-screen section-y-lg">
      <div className="page-x mb-14 md:mb-16 lg:mb-20">
        <Reveal as="div" className="w-full" distance={34} blur={8}>
          <div className="mx-auto w-full max-w-[1600px]">
            <span className="text-[12px] uppercase tracking-[0.22em] text-muted">
              {headerUi.eyebrow}
            </span>
            <h1 className="mt-6 max-w-[1100px] text-[clamp(48px,6vw,118px)] leading-[0.88] tracking-[-0.03em] text-primary font-light font-serif">
              {pickLocalized(labels.title, lang)}
            </h1>
            <p className="mt-8 max-w-[880px] text-[15px] md:text-[19px] leading-relaxed text-secondary">
              {headerUi.intro}
            </p>
            <div className="mt-12 md:mt-14 flex flex-wrap items-center gap-4 md:gap-6">
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
                        ? "bg-[color:var(--interactive-strong)] border-[color:var(--interactive-strong)] text-inverse"
                        : "bg-transparent border-subtle text-secondary hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {filteredEvents.length === 0 ? (
        <EventsEmptyState
          title={headerUi.emptyTitle}
          description={activeTab === "all" ? headerUi.emptyDescription : headerUi.emptyFilteredDescription}
        />
      ) : (
        <div className="w-full page-x">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[18px] lg:gap-x-[22.5px] gap-y-20 lg:gap-y-24">
            {visibleEvents.map((event, index) => (
              <EventsCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      )}

      {canLoadMore && (
        <Reveal as="div" className="mt-14 md:mt-16 flex justify-center page-x" distance={26} blur={6}>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className={`${menuButtonLikeClass} pl-6 pr-6 md:pl-8 md:pr-8 text-ui font-light pt-0.5 text-secondary`}
          >
            {pickLocalized(labels.more, lang)}
          </button>
        </Reveal>
      )}
    </section>
  );
}
