import type { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider"; 
import RunningLine from "@/components/RunningLine";
import { getRunningLine } from "@/lib/getRunningLine";
import Restaurants from "@/components/Restaurants";
import GroupStorySection from "@/components/GroupStorySection";
import { getGroupStorySection } from "@/lib/getGroupStorySection";
import EventsSection from "@/components/EventsSection";
import { getHomeEventsSectionData } from "@/lib/getEvents";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang } from "@/lib/seo/site";

export const revalidate = 300;

const HOME_COPY = {
  uz: {
    title: "Gōsht Group — Toshkentdagi restoran xoldingi",
    description:
      "Gōsht Group — Toshkentdagi restoran xoldingi: premium Gōsht restorani, fast-food loyihalar, Topor barbershop, catering va boshqa brend yo‘nalishlar.",
    h1: "Gōsht Group",
    lead: "Gōsht Group Toshkentdagi premium restoranlar, fast-food loyihalar, barbershop va catering yo‘nalishlarini birlashtiradigan restoran xoldingidir.",
  },
  ru: {
    title: "Gōsht Group — ресторанный холдинг в Ташкенте",
    description:
      "Gōsht Group (Gosht Group, Гошт Групп) — ресторанный холдинг в Ташкенте: премиальный ресторан Gōsht, fast-food проекты, барбершоп Topor, кейтеринг и другие направления.",
    h1: "Gōsht Group",
    lead: "Gōsht Group — ресторанный холдинг в Ташкенте, объединяющий премиальные рестораны, fast-food проекты, барбершоп и кейтеринг.",
  },
  en: {
    title: "Gōsht Group — restaurant holding in Tashkent",
    description:
      "Gōsht Group is a restaurant holding in Tashkent with the premium Gōsht restaurant, fast-food projects, Topor barbershop, catering, and other hospitality concepts.",
    h1: "Gōsht Group",
    lead: "Gōsht Group is a restaurant holding in Tashkent that brings together premium restaurants, fast-food projects, barbershop, and catering concepts.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const langCode = resolveLang(lang);
  const seo = HOME_COPY[langCode];

  return createPageMetadata({
    lang: langCode,
    title: seo.title,
    description: seo.description,
    keywords: [
      "Gōsht Group",
      "Gosht Group",
      "Гошт Групп",
      "рестораны Ташкента",
      "premium restaurant Tashkent",
      "Topor barbershop",
    ],
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = resolveLang(lang);
  const seo = HOME_COPY[langCode];
  const runningLineData = await getRunningLine();
  const groupStorySectionData = await getGroupStorySection();
  const homeEventsData = await getHomeEventsSectionData();

  return (
    <main className="min-h-screen bg-base">
      <section className="sr-only">
        <h1>{seo.h1}</h1>
        <p>{seo.lead}</p>
      </section>

      <HeroSlider />
      
      <RunningLine text={runningLineData?.text} />

      <Restaurants />

      <GroupStorySection data={groupStorySectionData} />

      <EventsSection
        featuredEvent={homeEventsData.featuredEvent}
        sideEvents={homeEventsData.sideEvents}
        labels={homeEventsData.labels}
      />
    </main>
  );
}
