import { notFound } from "next/navigation";
import EventDetailPage from "@/components/EventDetailPage";
import { getEventDetailPageData } from "@/lib/getEvents";
import type { LangCode } from "@/lib/eventsData";

function normalizeLang(lang: string): LangCode {
  if (lang === "uz" || lang === "ru" || lang === "en") return lang;
  return "ru";
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const language = normalizeLang(lang);
  const detailPageData = await getEventDetailPageData(slug);
  const event = detailPageData.event;

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-base pt-[104px] md:pt-[124px]">
      <EventDetailPage
        event={event}
        relatedEvents={detailPageData.relatedEvents}
        lang={language}
        labels={detailPageData.labels}
      />
    </main>
  );
}
