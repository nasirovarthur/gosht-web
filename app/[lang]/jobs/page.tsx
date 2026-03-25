import JobsPage from "@/components/JobsPage";
import { getJobsPageData } from "@/lib/getJobsPage";
import type { LangCode } from "@/types/i18n";

function resolveLang(lang: string): LangCode {
  return (["uz", "ru", "en"].includes(lang) ? lang : "uz") as LangCode;
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
