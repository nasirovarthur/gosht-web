// Re-export shared types from types/i18n for backwards compatibility
export type { LangCode, Localized } from "@/types/i18n";

export type EventCategory = "event" | "kids";

export type EventItem = {
  id: string;
  slug: string;
  category: EventCategory;
  title: { uz: string; ru: string; en: string };
  date: { uz: string; ru: string; en: string };
  time: { uz: string; ru: string; en: string };
  branch: { uz: string; ru: string; en: string };
  image: string;
  description: { uz: string; ru: string; en: string }[];
};

/**
 * Fallback events data.
 * Returns an empty array — real data comes from Sanity CMS.
 * If Sanity is unavailable, pages will show empty state instead of stale hardcoded data.
 */
export const eventsData: EventItem[] = [];

export function getEventBySlug(slug: string): EventItem | undefined {
  return eventsData.find((event) => event.slug === slug);
}
