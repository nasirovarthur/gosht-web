import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RestaurantDeliveryMenuPage from "@/components/RestaurantDeliveryMenuPage";
import { getGoshtDeliveryMenu } from "@/lib/getGoshtDeliveryMenu";
import { hasGoshtDeliveryMenu } from "@/lib/restaurantMenu";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang, SUPPORTED_LANGS } from "@/lib/seo/site";
import { client } from "@/lib/sanity";
import { pickLocalized } from "@/types/i18n";
import type { LangCode, LocalizedOptional } from "@/types/i18n";

type BranchMenuRaw = {
  city?: "tashkent";
  branchName?: LocalizedOptional;
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  menuFiles?: string[];
  menuLanguages?: (string | null)[];
  menu?: string;
  gallery?: string[];
  project?: {
    projectType?: "restaurant" | "barbershop";
    name?: LocalizedOptional;
    logo?: string;
    defaultMenu?: string;
  };
};

type LegacyMenuRaw = {
  name?: LocalizedOptional;
  branchName?: LocalizedOptional;
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  menuFiles?: string[];
  menuLanguages?: (string | null)[];
  menu?: string;
  gallery?: string[];
  logo?: string;
};

function buildSlugCandidates(slug: string): string[] {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return [slug];
  return Array.from(new Set([slug, trimmed, `/${trimmed}`]));
}

async function getBranchRestaurantBySlug(slug: string, language: LangCode): Promise<BranchMenuRaw | null> {
  const slugCandidates = buildSlugCandidates(slug);
  const query = `
    *[
      _type == "restaurantBranch" &&
      slug.current in $slugCandidates &&
      isActive != false &&
      defined(project->_id) &&
      project->isActive != false &&
      coalesce(project->projectType, "restaurant") in ["restaurant", "barbershop"]
    ][0] {
      city,
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      "menuFiles": menuFiles[!defined(language) || language == $language].asset->url,
      "menuLanguages": menuFiles[defined(asset->_id)].language,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      project-> {
        projectType,
        name,
        "logo": logo.asset->url,
        "defaultMenu": defaultMenuFile.asset->url
      }
    }
  `;

  return client.fetch<BranchMenuRaw | null>(query, { slugCandidates, language });
}

async function getLegacyRestaurantBySlug(slug: string, language: LangCode): Promise<LegacyMenuRaw | null> {
  const slugCandidates = buildSlugCandidates(slug);
  const query = `
    *[_type == "restaurants" && slug.current in $slugCandidates][0] {
      name,
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      "menuFiles": menuFiles[!defined(language) || language == $language].asset->url,
      "menuLanguages": menuFiles[defined(asset->_id)].language,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      "logo": logo.asset->url
    }
  `;

  return client.fetch<LegacyMenuRaw | null>(query, { slugCandidates, language });
}

function buildMenuFiles(menuFiles?: string[], menu?: string, defaultMenu?: string): string[] {
  const urls = [
    ...(Array.isArray(menuFiles) ? menuFiles : []),
    ...(menu ? [menu] : []),
  ];

  if (urls.length === 0 && defaultMenu) {
    urls.push(defaultMenu);
  }

  return Array.from(new Set(urls.filter(Boolean)));
}

function getMenuMetadata({
  language,
  slug,
  branchName,
  restaurant,
  isDeliveryMenu,
}: {
  language: LangCode;
  slug: string;
  branchName: string;
  restaurant: BranchMenuRaw | LegacyMenuRaw;
  isDeliveryMenu: boolean;
}): Metadata {
  const menuTitle = isDeliveryMenu
    ? { ru: "меню доставки", uz: "yetkazib berish menyusi", en: "delivery menu" }
    : { ru: "меню ресторана", uz: "restoran menyusi", en: "restaurant menu" };
  const description = {
    ru: `${branchName}: ${menuTitle.ru}, блюда и актуальные цены.`,
    uz: `${branchName}: ${menuTitle.uz}, taomlar va amaldagi narxlar.`,
    en: `${branchName}: ${menuTitle.en}, dishes and current prices.`,
  };
  const defaultMenu = "project" in restaurant ? restaurant.project?.defaultMenu : undefined;
  const hasGeneralMenu = Boolean(restaurant.menu || defaultMenu || restaurant.menuLanguages?.includes(null));
  const languages = isDeliveryMenu || hasGeneralMenu
    ? SUPPORTED_LANGS
    : SUPPORTED_LANGS.filter(lang => restaurant.menuLanguages?.includes(lang));

  return createPageMetadata({
    lang: language,
    pathname: `restaurants/${slug}/menu`,
    title: `${branchName} — ${menuTitle[language]}`,
    description: description[language],
    image: restaurant.gallery?.[0] || "/logo.svg",
    type: "article",
    noindex: !languages.includes(language),
    languages,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const language = resolveLang(lang);
  const branchRestaurant = await getBranchRestaurantBySlug(slug, language);

  if (branchRestaurant) {
    const projectName = pickLocalized(branchRestaurant.project?.name, language);
    const branchName = pickLocalized(branchRestaurant.branchName, language) || projectName;
    return getMenuMetadata({
      language,
      slug,
      branchName,
      restaurant: branchRestaurant,
      isDeliveryMenu: hasGoshtDeliveryMenu({
        slug,
        source: "branch",
        city: branchRestaurant.city,
        projectType: branchRestaurant.project?.projectType,
        names: [projectName, branchName],
      }),
    });
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug, language);
  if (legacyRestaurant) {
    const projectName = pickLocalized(legacyRestaurant.name, language);
    const branchName = pickLocalized(legacyRestaurant.branchName, language) || projectName;
    return getMenuMetadata({
      language,
      slug,
      branchName,
      restaurant: legacyRestaurant,
      isDeliveryMenu: hasGoshtDeliveryMenu({
        slug,
        source: "legacy",
        names: [projectName, branchName],
      }),
    });
  }

  return createPageMetadata({
    lang: language,
    pathname: `restaurants/${slug}/menu`,
    title: language === "ru" ? "Меню ресторана" : language === "en" ? "Restaurant menu" : "Restoran menyusi",
    description:
      language === "ru"
        ? "Меню ресторана Gōsht Group."
        : language === "en"
          ? "Gōsht Group restaurant menu."
          : "Gōsht Group restoran menyusi.",
    noindex: true,
    languages: [],
  });
}

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ category?: string | string[]; dish?: string | string[] }>;
}) {
  const { lang, slug } = await params;
  const query = await searchParams;
  const initialGroupId = typeof query.category === 'string' ? query.category : undefined;
  const initialDishId = typeof query.dish === 'string' ? query.dish : undefined;
  const language = resolveLang(lang) as LangCode;
  const backHref = `/${language}/restaurants/${slug}`;

  const branchRestaurant = await getBranchRestaurantBySlug(slug, language);

  if (branchRestaurant) {
    const projectName = pickLocalized(branchRestaurant.project?.name, language);
    const branchName = pickLocalized(branchRestaurant.branchName, language) || projectName;
    const address = pickLocalized(branchRestaurant.address, language);
    const shouldLoadIikoMenu = hasGoshtDeliveryMenu({
      slug,
      source: "branch",
      city: branchRestaurant.city,
      projectType: branchRestaurant.project?.projectType,
      names: [projectName, branchName],
    });
    const iikoMenu = shouldLoadIikoMenu
      ? await getGoshtDeliveryMenu()
      : null;
    const menuFiles = buildMenuFiles(
      branchRestaurant.menuFiles,
      branchRestaurant.menu,
      branchRestaurant.project?.defaultMenu
    );

    return (
      <RestaurantDeliveryMenuPage
        key={`${slug}:${initialGroupId || ''}:${initialDishId || ''}`}
        initialGroupId={initialGroupId}
        initialDishId={initialDishId}
        backHref={backHref}
        restaurant={{
          name: projectName,
          branchName,
          address,
          phone: branchRestaurant.phone || "",
          averageCheck: pickLocalized(branchRestaurant.averageCheck, language),
          workingHours: pickLocalized(branchRestaurant.workingHours, language),
          menuFiles,
          gallery: branchRestaurant.gallery || [],
          logo: branchRestaurant.project?.logo,
        }}
        categories={iikoMenu?.categories}
        dishes={iikoMenu?.dishes}
        currencyCode={iikoMenu?.currencyCode}
        requireApiDishes={shouldLoadIikoMenu}
      />
    );
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug, language);
  if (!legacyRestaurant) {
    notFound();
  }

  const projectName = pickLocalized(legacyRestaurant.name, language);
  const branchName = pickLocalized(legacyRestaurant.branchName, language) || projectName;
  const address = pickLocalized(legacyRestaurant.address, language);
  const shouldLoadIikoMenu = hasGoshtDeliveryMenu({
    slug,
    source: "legacy",
    names: [projectName, branchName],
  });
  const iikoMenu = shouldLoadIikoMenu
    ? await getGoshtDeliveryMenu()
    : null;
  const menuFiles = buildMenuFiles(legacyRestaurant.menuFiles, legacyRestaurant.menu);

  return (
    <RestaurantDeliveryMenuPage
      key={`${slug}:${initialGroupId || ''}:${initialDishId || ''}`}
      initialGroupId={initialGroupId}
      initialDishId={initialDishId}
      backHref={backHref}
      restaurant={{
        name: projectName,
        branchName,
        address,
        phone: legacyRestaurant.phone || "",
        averageCheck: pickLocalized(legacyRestaurant.averageCheck, language),
        workingHours: pickLocalized(legacyRestaurant.workingHours, language),
        menuFiles,
        gallery: legacyRestaurant.gallery || [],
        logo: legacyRestaurant.logo,
      }}
      categories={iikoMenu?.categories}
      dishes={iikoMenu?.dishes}
      currencyCode={iikoMenu?.currencyCode}
      requireApiDishes={shouldLoadIikoMenu}
    />
  );
}
