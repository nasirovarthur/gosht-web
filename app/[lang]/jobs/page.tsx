import type { Metadata } from "next";
import JobsPage from "@/components/JobsPage";
import { getJobsPageData } from "@/lib/getJobsPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const langCode = resolveLang(lang);

  const descriptions = {
    uz: "Gōsht Group vakansiyalari: restoranlar, fast-food loyihalar va xizmat formatlaridagi ochiq ish o‘rinlari.",
    ru: "Вакансии Gōsht Group: открытые позиции в ресторанах, fast-food проектах и сервисных форматах холдинга.",
    en: "Jobs at Gōsht Group: open roles across the holding’s restaurants, fast-food projects, and service formats.",
  } as const;

  return createPageMetadata({
    lang: langCode,
    pathname: "jobs",
    title:
      langCode === "ru"
        ? "Вакансии Gōsht Group"
        : langCode === "en"
          ? "Jobs at Gōsht Group"
          : "Gōsht Group vakansiyalari",
    description: descriptions[langCode],
    keywords: ["Gōsht Group jobs", "вакансии Gōsht Group", "restaurant jobs Tashkent", "Topor jobs"],
    image: "/logo.svg",
  });
}

export default async function JobsRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = resolveLang(lang);
  const data = await getJobsPageData();

  return <JobsPage data={data} lang={langCode} />;
}
