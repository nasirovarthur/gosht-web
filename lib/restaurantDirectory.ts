import type {
  RestaurantBranchItem,
  RestaurantProjectItem,
  RestaurantsDirectoryData,
} from "./getRestaurantBranches";
import { pickLocalized } from "../types/i18n";
import type { LangCode } from "../types/i18n";

export type RestaurantFilters = {
  city: string;
  cuisine: string;
  banquet: boolean;
  delivery: boolean;
};

export function formatRestaurantCount(count: number, lang: LangCode): string {
  if (lang === "en")
    return `${count} ${count === 1 ? "location" : "locations"}`;
  if (lang === "uz") return `${count} joy`;
  const form = new Intl.PluralRules("ru").select(count);
  return `${count} ${form === "one" ? "место" : form === "few" ? "места" : "мест"}`;
}

export function hasDeliveryMenu(branch: RestaurantBranchItem): boolean {
  const slug = branch.slug?.replace(/^\/+|\/+$/g, "");
  return (
    branch.projectType === "restaurant" &&
    ((branch.city === "new_york" && slug === "gosht-brooklyn") ||
      (branch.city === "tashkent" && slug === "gosht-west"))
  );
}

export function restaurantCuisine(
  branch: RestaurantBranchItem,
  lang: LangCode,
): string {
  return pickLocalized(branch.projectPrimaryInfo, lang);
}

export function restaurantFeatures(
  branch: RestaurantBranchItem,
  lang: LangCode,
): string[] {
  const names = {
    ru: {
      banquet: "Банкетный зал",
      playground: "Детская площадка",
      vip: "VIP-кабинет",
      haircut: "Детская стрижка",
      delivery: "Доставка",
    },
    en: {
      banquet: "Banquet hall",
      playground: "Kids playground",
      vip: "VIP room",
      haircut: "Kids haircut",
      delivery: "Delivery",
    },
    uz: {
      banquet: "Banket zali",
      playground: "Bolalar maydonchasi",
      vip: "VIP kabinet",
      haircut: "Bolalar soch turmagi",
      delivery: "Yetkazish",
    },
  }[lang];
  return branch.projectType === "barbershop"
    ? [
        branch.hasVipRoom && names.vip,
        branch.hasKidsHaircut && names.haircut,
      ].filter((value): value is string => Boolean(value))
    : [
        branch.hasBanquet && names.banquet,
        branch.hasPlayground && names.playground,
        hasDeliveryMenu(branch) && names.delivery,
      ].filter((value): value is string => Boolean(value));
}

function projectText(project: RestaurantProjectItem): string {
  return [
    project.name.ru,
    project.name.en,
    project.name.uz,
    ...project.branches.map((branch) => branch.slug),
  ]
    .join(" ")
    .toLowerCase();
}

export function groupRestaurantProject(
  project: RestaurantProjectItem,
): boolean {
  return (
    project.branches.length > 1 &&
    /doner|донер|black|bsb/.test(projectText(project))
  );
}

function projectPriority(project: RestaurantProjectItem): number {
  const name = projectText(project);
  if (/doner|донер/.test(name)) return 1;
  if (/mahalla|махалла/.test(name)) return 2;
  if (/black|bsb/.test(name)) return 3;
  if (/topor|топор/.test(name)) return 4;
  if (/gosht|gōsht|гошт/.test(name)) return 0;
  return 5;
}

export function filterRestaurantProjects(
  data: RestaurantsDirectoryData,
  filters: RestaurantFilters,
  lang: LangCode,
): RestaurantProjectItem[] {
  return data.projects
    .map((project) => ({
      ...project,
      branches: project.branches
        .filter(
          (branch) =>
            branch.city === filters.city &&
            (filters.cuisine === "all" ||
              restaurantCuisine(branch, lang) === filters.cuisine) &&
            (!filters.banquet || branch.hasBanquet) &&
            (!filters.delivery || hasDeliveryMenu(branch)),
        )
        .sort(
          (left, right) =>
            Number(right.slug === "gosht-west") -
            Number(left.slug === "gosht-west"),
        ),
    }))
    .filter((project) => project.branches.length > 0)
    .sort(
      (left, right) =>
        projectPriority(left) - projectPriority(right) ||
        pickLocalized(left.name, lang).localeCompare(
          pickLocalized(right.name, lang),
          lang,
        ),
    );
}
