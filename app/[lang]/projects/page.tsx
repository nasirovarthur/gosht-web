import ProjectsPage from "@/components/ProjectsPage";
import { getProjectsPageData } from "@/lib/getProjects";
import type { LangCode } from "@/types/i18n";

export default async function ProjectsRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = (["uz", "ru", "en"].includes(lang) ? lang : "uz") as LangCode;
  const data = await getProjectsPageData();

  return <ProjectsPage data={data} lang={langCode} />;
}
