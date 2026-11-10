"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SliderButton from "@/components/SliderButton";
import { pickLocalized } from "@/types/i18n";
import type { Localized } from "@/types/i18n";
import type { EventItem } from "@/lib/eventsData";
import grid from "./HomeFeatureGrid.module.css";
import styles from "./EventsSection.module.css";

type EventCardData = EventItem;
type EventsSectionLabels = {
  heading: Localized;
  allEventsLabel: Localized;
};

function EventCard({
  item,
  variant,
}: {
  item: EventCardData;
  variant: "featured" | "small";
}) {
  const { lang } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={grid.card}>
      <Link href={`/${lang}/events/${item.slug}`} className={styles.link}>
        <div className={grid.photo}>
          {!imageFailed && (
            <Image
              src={item.image}
              alt={item.title[lang]}
              fill
              sizes={variant === "featured" ? "(max-width: 1199px) 100vw, (min-width: 1728px) 1120px, 70vw" : "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 28vw"}
              className={styles.poster}
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className={grid.caption}>
          <p className={styles.meta}>
            <span>{item.date[lang]}</span>
            <span aria-hidden="true">•</span>
            <span>{item.branch[lang]}</span>
          </p>
          <h3 className={`${grid.title} ${variant === "featured" ? grid.leadTitle : ""}`}>
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
    <section className={styles.section} aria-labelledby="home-events-title" id="home-events">
      <div className="page-x">
        <div className={grid.frame}>
          <div className={styles.header}>
            <h2 className={styles.heading} id="home-events-title">
              {heading}
            </h2>
            <SliderButton href={`/${lang}/events`} className={styles.eventsLink}><span>{allEventsLabel}</span></SliderButton>
          </div>

          <div className={grid.grid}>
            <div className={`${grid.card} ${styles.lead}`}>
              <EventCard item={featuredEvent} variant="featured" />
            </div>

            <div className={styles.side}>
              {visibleSideEvents.map((event) => (
                <EventCard key={event.id} item={event} variant="small" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
