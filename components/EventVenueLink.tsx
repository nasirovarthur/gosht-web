"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { EventItem, LangCode } from "@/lib/eventsData";
import { getEventVenueTarget } from "@/lib/eventVenue";
import styles from "./EventVenueLink.module.css";

export default function EventVenueLink({ event, branch, lang }: {
  event: Pick<EventItem, "branchSlug" | "allBranches">;
  branch: string;
  lang: LangCode;
}) {
  const target = getEventVenueTarget(event, lang);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);

  if (!target) return <span className="text-white">{branch}</span>;

  return (
    <span
      className={styles.venue}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Link
        className={styles.link}
        href={target.href}
        aria-label={`${branch}: ${target.label}`}
        aria-describedby={open ? tooltipId : undefined}
      >
        <span>{branch}</span>
        <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className={styles.arrow} />
      </Link>
      {open ? <span className={styles.tooltip} id={tooltipId} role="tooltip">{target.label}</span> : null}
    </span>
  );
}
