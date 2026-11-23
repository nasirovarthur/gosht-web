import type { EventItem, LangCode, Localized } from "@/lib/eventsData";

export function isAllEventBranches(branch: Partial<Localized> | null | undefined): boolean {
  return Boolean(branch && Object.values(branch).some((text) => (
    typeof text === "string" && /^(?:все филиалы(?:\s+g[ōo]sht)?|all\s+(?:g[ōo]sht\s+)?(?:restaurants|branches)|barcha\s+(?:g[ōo]sht\s+)?filiallari)$/iu.test(text.trim())
  )));
}

export function getEventVenueTarget(event: Pick<EventItem, "branchSlug" | "allBranches">, lang: LangCode) {
  if (event.branchSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(event.branchSlug)) {
    return {
      href: `/${lang}/restaurants/${encodeURIComponent(event.branchSlug)}`,
      label: { ru: "Перейти к филиалу", uz: "Filial sahifasiga o‘tish", en: "View this restaurant" }[lang],
    };
  }
  if (!event.branchSlug && event.allBranches) {
    return {
      href: `/${lang}/restaurants?view=map`,
      label: { ru: "Выбрать ближайший филиал", uz: "Eng yaqin filialni tanlash", en: "Choose the nearest restaurant" }[lang],
    };
  }
  return null;
}
