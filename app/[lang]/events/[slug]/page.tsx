import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailPage from "@/components/EventDetailPage";
import SeoJsonLd from "@/components/SeoJsonLd";
import { getEventDetailPageData } from "@/lib/getEvents";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";
import { resolveLang } from "@/lib/seo/site";
import { pickLocalized } from "@/types/i18n";
import type { LangCode } from "@/lib/eventsData";

function normalizeLang(lang: string): LangCode {
  return resolveLang(lang) as LangCode;
}

function buildEventDescription(
  lang: LangCode,
  title: string,
  branch: string,
  descriptionParagraphs: string[]
): string {
  const lead = descriptionParagraphs[0] || "";

  if (lang === "ru") {
    return `${title} — событие Gōsht Group${branch ? ` в ${branch}` : ""}. ${lead || "Подробности мероприятия, формат участия и актуальная информация на странице события."}`.trim();
  }

  if (lang === "en") {
    return `${title} is a Gōsht Group event${branch ? ` at ${branch}` : ""}. ${lead || "See the event details, format, and the latest information on the event page."}`.trim();
  }

  return `${title} — Gōsht Group tadbiri${branch ? `, ${branch}` : ""}. ${lead || "Tadbir tafsilotlari, format va dolzarb ma’lumotlar sahifada berilgan."}`.trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const language = normalizeLang(lang);
  const detailPageData = await getEventDetailPageData(slug);
  const event = detailPageData.event;

  if (!event) {
    return createPageMetadata({
      lang: language,
      pathname: `events/${slug}`,
      title: language === "ru" ? "Событие Gōsht Group" : language === "en" ? "Gōsht Group event" : "Gōsht Group tadbiri",
      description:
        language === "ru"
          ? "Событие Gōsht Group."
          : language === "en"
            ? "A Gōsht Group event."
            : "Gōsht Group tadbiri.",
      noindex: true,
    });
  }

  const title = pickLocalized(event.title, language);
  const branch = pickLocalized(event.branch, language);
  const descriptionParagraphs = event.description
    .map((item) => pickLocalized(item, language))
    .filter(Boolean);

  return createPageMetadata({
    lang: language,
    pathname: `events/${slug}`,
    title,
    description: buildEventDescription(language, title, branch, descriptionParagraphs),
    image: event.image,
    type: "article",
    keywords: [title, branch, "Gōsht Group events", "restaurant events"].filter(Boolean),
  });
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

  const breadcrumbSchema = getBreadcrumbSchema([
    {
      name: language === "ru" ? "События" : language === "en" ? "Events" : "Voqealar",
      path: `/${language}/events`,
    },
    { name: pickLocalized(event.title, language), path: `/${language}/events/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-base pt-[104px] md:pt-[124px]">
      <SeoJsonLd data={[breadcrumbSchema]} />
      <EventDetailPage
        event={event}
        relatedEvents={detailPageData.relatedEvents}
        lang={language}
        labels={detailPageData.labels}
      />
    </main>
  );
}
