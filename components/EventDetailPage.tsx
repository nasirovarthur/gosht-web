"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import SliderButton from "@/components/SliderButton";
import type { EventItem, LangCode, Localized } from "@/lib/eventsData";

function pickLocalized(value: Localized, lang: LangCode): string {
  return value[lang] || value.uz;
}

function RelatedEventCard({
  item,
  lang,
}: {
  item: EventItem;
  lang: LangCode;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="w-full h-auto">
      <Link href={`/${lang}/events/${item.slug}`} className="group block w-full h-auto">
        <div className="relative w-full aspect-[5/3] overflow-hidden border border-white/10 bg-card">
          {!imageFailed && (
            <Image
              src={item.image}
              alt={pickLocalized(item.title, lang)}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 25vw"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="mt-4 flex flex-col p-4 pt-0">
          <p className="flex flex-wrap items-center gap-2 text-[12px] md:text-[13px] tracking-[0.16em] uppercase text-white/45 break-words">
            <span>{pickLocalized(item.date, lang)}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/55">{pickLocalized(item.branch, lang)}</span>
          </p>

          <h3 className="mt-2 uppercase text-[clamp(22px,1.7vw,30px)] leading-[1.04] tracking-[-0.01em] text-white/90 font-light font-serif transition-colors duration-300 group-hover:text-[#AE0E16] break-words">
            {pickLocalized(item.title, lang)}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export default function EventDetailPage({
  event,
  relatedEvents,
  lang,
  labels,
}: {
  event: EventItem;
  relatedEvents: EventItem[];
  lang: LangCode;
  labels: {
    related: Localized;
    back: Localized;
  };
}) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperInstance | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(relatedEvents.length > 1);

  const syncSwiperState = (swiper: SwiperInstance) => {
    setCanScrollLeft(!swiper.isBeginning);
    setCanScrollRight(!swiper.isEnd);
  };

  const title = pickLocalized(event.title, lang);
  const date = pickLocalized(event.date, lang);
  const time = pickLocalized(event.time, lang);
  const branch = pickLocalized(event.branch, lang);

  return (
    <section className="w-full bg-base text-white section-y-lg overflow-x-clip">
      <div className="pr-[var(--page-x)] pl-[calc(var(--page-x)*0.6667)]">
        <div className="mx-auto w-full max-w-[1600px]">
          <header className="w-full max-w-[1040px]">
            <Link
              href={`/${lang}/events`}
              className="group mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/10 px-6 py-3 text-ui font-light text-white/90 transition-all hover:bg-white/5 active:scale-95"
            >
              <svg
                width="12"
                height="10"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white/55 transition-transform duration-300 group-hover:-translate-x-0.5"
              >
                <path d="M11 5H1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 9L1 5L5 1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span>{pickLocalized(labels.back, lang)}</span>
            </Link>

            <h1 className="uppercase text-[clamp(42px,5.2vw,90px)] leading-[0.93] tracking-[-0.02em] font-light font-serif text-white">
              {title}
            </h1>

            <p className="mt-10 mb-4 py-2 md:py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] md:text-[16px] tracking-[0.14em] uppercase text-white/70">
              <span>{date}</span>
              <span className="text-white/35">•</span>
              <span>{time}</span>
              <span className="text-white/35">•</span>
              <span className="text-white">{branch}</span>
            </p>
          </header>

          <div className="mt-12 max-w-[1040px]">
            <div className="relative w-full aspect-[16/10] overflow-hidden border border-white/10 bg-card">
              <Image
                src={event.image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1040px"
              />
            </div>
          </div>

          <div className="mt-12 md:mt-14 max-w-[1040px]">
            <div className="space-y-7 text-[15px] md:text-[17px] leading-relaxed text-white/72 font-light text-right">
              {event.description.map((paragraph, index) => (
                <p key={`${event.id}-paragraph-${index}`}>{pickLocalized(paragraph, lang)}</p>
              ))}
            </div>
          </div>

          <div className="mt-24 md:mt-28">
            <div className="flex items-center justify-between gap-6 mb-16 md:mb-20">
              <h2 className="uppercase text-[clamp(28px,2.8vw,44px)] leading-[0.98] tracking-[-0.018em] font-light font-serif text-white">
                {pickLocalized(labels.related, lang)}
              </h2>

              <div className="hidden md:flex items-center gap-3">
                <SliderButton
                  direction="left"
                  onClick={() => swiperInstance?.slidePrev()}
                  disabled={!canScrollLeft}
                />
                <SliderButton
                  direction="right"
                  onClick={() => swiperInstance?.slideNext()}
                  disabled={!canScrollRight}
                />
              </div>
            </div>

            <Swiper
              key={`related-events-${relatedEvents.length}`}
              className="w-[calc(50vw+50%)] overflow-hidden"
              spaceBetween={20}
              slidesOffsetAfter={20}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
              }}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
                syncSwiperState(swiper);
              }}
              onSlideChange={syncSwiperState}
              onResize={syncSwiperState}
              onBreakpoint={syncSwiperState}
              onSlidesLengthChange={syncSwiperState}
            >
              {relatedEvents.map((item) => (
                <SwiperSlide key={item.id} className="h-auto">
                  <RelatedEventCard item={item} lang={lang} />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-8 flex md:hidden items-center justify-end gap-2">
              <SliderButton
                direction="left"
                onClick={() => swiperInstance?.slidePrev()}
                className="scale-90"
                disabled={!canScrollLeft}
              />
              <SliderButton
                direction="right"
                onClick={() => swiperInstance?.slideNext()}
                className="scale-90"
                disabled={!canScrollRight}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
