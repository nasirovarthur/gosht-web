"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SliderButton from "@/components/SliderButton";
import Reveal from "@/components/Reveal";
import { pickLocalized } from "@/types/i18n";
import type { Localized } from "@/types/i18n";
import type { EventItem } from "@/lib/eventsData";

type EventCardData = EventItem;
type EventsSectionLabels = {
  heading: Localized;
  allEventsLabel: Localized;
};

function EventsLink({ label, href }: { label: string; href: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <div
      className="inline-flex flex-col items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex items-center gap-8 md:gap-10">
        <Link href={href} className="text-body-lg text-secondary hover:text-primary transition-colors">
          {label}
        </Link>

        <SliderButton
          direction="right"
          onClick={() => router.push(href)}
          forceHover={isHovered}
          ariaLabel={label}
          className="scale-[0.45] md:scale-[0.56] origin-left -ml-3 md:-ml-2"
        />
      </div>

      <span className="relative mt-1 h-px w-full min-w-[208px] bg-[color:var(--border-strong)] overflow-hidden">
        <span
          className={`absolute inset-0 bg-[color:var(--text-primary)] transition-transform duration-500 ease-out ${
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
      <Link href={`/${lang}/events/${item.slug}`} className="group block w-full h-full">
        <div className={`relative w-full overflow-hidden bg-card border border-subtle ${imageWrapClass}`}>
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
          <p className="flex items-center gap-2 text-[12px] md:text-[13px] tracking-[0.16em] uppercase text-muted">
            <span>{item.date[lang]}</span>
            <span className="text-muted">•</span>
            <span className="text-secondary">{item.branch[lang]}</span>
          </p>
          <h3 className={`${titleClass} mt-2 uppercase tracking-[-0.01em] text-primary font-light font-serif`}>
            {item.title[lang]}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export default function EventsSection({
  featuredEvent,
  sideEvents,
  labels,
}: {
  featuredEvent: EventItem | null;
  sideEvents: EventItem[];
  labels: EventsSectionLabels;
}) {
  const { lang } = useLanguage();
  const heading = pickLocalized(labels.heading, lang);
  const allEventsLabel = pickLocalized(labels.allEventsLabel, lang);
  const visibleSideEvents = sideEvents.slice(0, 2);

  if (!featuredEvent || visibleSideEvents.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-base text-primary section-y-lg border-t border-subtle transition-colors duration-300">
      <div className="page-x">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 mb-10 md:mb-12 lg:mb-10">
            <Reveal as="div" className="lg:col-span-8" distance={34} blur={8}>
              <h2 className="text-[clamp(42px,4.7vw,86px)] leading-[0.95] tracking-[-0.02em] font-light font-serif">
                {heading}
              </h2>
              <div className="mt-8 md:mt-10">
                <EventsLink label={allEventsLabel} href={`/${lang}/events`} />
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 lg:min-h-[760px]">
            <Reveal as="div" className="lg:col-span-8 h-full max-w-[980px]" distance={54} blur={12}>
              <EventCard item={featuredEvent} variant="featured" />
            </Reveal>

            <div className="lg:col-span-4 h-full lg:col-start-9">
              <div className="grid grid-cols-1 gap-10 lg:gap-8 h-full lg:grid-rows-2">
                {visibleSideEvents.map((event, index) => (
                  <Reveal
                    key={event.id}
                    as="div"
                    variant="left"
                    delay={index * 110}
                    distance={46}
                    blur={10}
                  >
                    <EventCard item={event} variant="small" />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
