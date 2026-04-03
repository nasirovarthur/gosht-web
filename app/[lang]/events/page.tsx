import type { Metadata } from "next";
import EventsListingPage from "@/components/EventsListingPage";
import { getEventsListingPageData } from "@/lib/getEvents";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const langCode = resolveLang(lang);
  const eventsListingData = await getEventsListingPageData();

  const descriptions = {
    uz: "Gōsht Group voqealari va tadbirlari: restoran eventlari, bolalar dasturlari va xolding loyihalaridagi yangiliklar.",
    ru: "События Gōsht Group: ресторанные мероприятия, детские программы и анонсы проектов холдинга.",
    en: "Events by Gōsht Group: restaurant happenings, kids programs, and updates across the holding’s projects.",
  } as const;

  return createPageMetadata({
    lang: langCode,
    pathname: "events",
    title:
      langCode === "ru"
        ? "События Gōsht Group"
        : langCode === "en"
          ? "Gōsht Group events"
          : "Gōsht Group voqealari",
    description: descriptions[langCode],
    image: eventsListingData.events[0]?.image,
    keywords: ["Gōsht Group events", "события Gōsht Group", "kids events", "restaurant events"],
  });
}

export default async function EventsPage() {
  const eventsListingData = await getEventsListingPageData();

  return (
    <main className="min-h-screen bg-base pt-[104px] md:pt-[124px]">
      <EventsListingPage
        events={eventsListingData.events}
        labels={eventsListingData.labels}
        initialVisibleCount={eventsListingData.initialVisibleCount}
      />
    </main>
  );
}
