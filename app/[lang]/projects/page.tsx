import type { Metadata } from "next";
import ProjectsPage from "@/components/ProjectsPage";
import { getProjectsPageData } from "@/lib/getProjects";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang } from "@/lib/seo/site";
import type { LangCode } from "@/types/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const langCode = resolveLang(lang);
  const data = await getProjectsPageData();

  const descriptions = {
    uz: "Gōsht Group loyihalari: Gōsht Kids, Lavka by Gōsht, Gōsht Catering, Gōsht TV va xoldingning boshqa yo‘nalishlari.",
    ru: "Проекты Gōsht Group: Gōsht Kids, Lavka by Gōsht, Gōsht Catering, Gōsht TV и другие направления ресторанного холдинга.",
    en: "Projects of Gōsht Group: Gōsht Kids, Lavka by Gōsht, Gōsht Catering, Gōsht TV, and other concepts within the restaurant holding.",
  } as const;

  return createPageMetadata({
    lang: langCode,
    pathname: "projects",
    title:
      langCode === "ru"
        ? "Проекты Gōsht Group"
        : langCode === "en"
          ? "Projects of Gōsht Group"
          : "Gōsht Group loyihalari",
    description: descriptions[langCode],
    image: data.projects.find((project) => project.gallery[0])?.gallery[0] || "/logo.svg",
    keywords: [
      "Gōsht Group projects",
      "Gōsht Kids",
      "Lavka by Gōsht",
      "Gōsht Catering",
      "Gōsht TV",
    ],
  });
}

export default async function ProjectsRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = resolveLang(lang) as LangCode;
  const data = await getProjectsPageData();

  return <ProjectsPage data={data} lang={langCode} />;
}
