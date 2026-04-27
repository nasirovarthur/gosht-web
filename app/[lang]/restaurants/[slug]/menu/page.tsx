import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RestaurantDeliveryMenuPage from "@/components/RestaurantDeliveryMenuPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { resolveLang } from "@/lib/seo/site";
import { client } from "@/lib/sanity";
import { getToastDeliveryMenu } from "@/lib/toast";
import { pickLocalized } from "@/types/i18n";
import type { LangCode, LocalizedOptional } from "@/types/i18n";

type BranchMenuRaw = {
  city?: "tashkent" | "new_york";
  branchName?: LocalizedOptional;
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  menuFiles?: string[];
  menu?: string;
  gallery?: string[];
  project?: {
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
  menu?: string;
  gallery?: string[];
  logo?: string;
};

function buildSlugCandidates(slug: string): string[] {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return [slug];
  return Array.from(new Set([slug, trimmed, `/${trimmed}`]));
}

async function getBranchRestaurantBySlug(slug: string): Promise<BranchMenuRaw | null> {
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
      "menuFiles": menuFiles[].asset->url,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      project-> {
        name,
        "logo": logo.asset->url,
        "defaultMenu": defaultMenuFile.asset->url
      }
    }
  `;

  return client.fetch<BranchMenuRaw | null>(query, { slugCandidates });
}

async function getLegacyRestaurantBySlug(slug: string): Promise<LegacyMenuRaw | null> {
  const slugCandidates = buildSlugCandidates(slug);
  const query = `
    *[_type == "restaurants" && slug.current in $slugCandidates][0] {
      name,
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      "menuFiles": menuFiles[].asset->url,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      "logo": logo.asset->url
    }
  `;

  return client.fetch<LegacyMenuRaw | null>(query, { slugCandidates });
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

function normalizeRestaurantName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isGoshtRestaurant(...names: string[]): boolean {
  return names.some((name) => normalizeRestaurantName(name).includes("gosht"));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const language = resolveLang(lang);

  const branchRestaurant = await getBranchRestaurantBySlug(slug);
  if (branchRestaurant) {
    const projectName = pickLocalized(branchRestaurant.project?.name, language);
    const branchName = pickLocalized(branchRestaurant.branchName, language) || projectName;
    return createPageMetadata({
      lang: language,
      pathname: `restaurants/${slug}/menu`,
      title: `${branchName} — ${language === "ru" ? "меню доставки" : language === "en" ? "delivery menu" : "yetkazib berish menyusi"}`,
      description:
        language === "ru"
          ? `${branchName}: карточки блюд, категории и оформление заказа.`
          : language === "en"
            ? `${branchName}: dish cards, categories, and checkout preview.`
            : `${branchName}: taom kartochkalari, kategoriyalar va buyurtma oynasi.`,
      image: branchRestaurant.gallery?.[0] || "/logo.svg",
      type: "article",
    });
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug);
  if (legacyRestaurant) {
    const projectName = pickLocalized(legacyRestaurant.name, language);
    const branchName = pickLocalized(legacyRestaurant.branchName, language) || projectName;
    return createPageMetadata({
      lang: language,
      pathname: `restaurants/${slug}/menu`,
      title: `${branchName} — ${language === "ru" ? "меню доставки" : language === "en" ? "delivery menu" : "yetkazib berish menyusi"}`,
      description:
        language === "ru"
          ? `${branchName}: карточки блюд, категории и оформление заказа.`
          : language === "en"
            ? `${branchName}: dish cards, categories, and checkout preview.`
            : `${branchName}: taom kartochkalari, kategoriyalar va buyurtma oynasi.`,
      image: legacyRestaurant.gallery?.[0] || "/logo.svg",
      type: "article",
    });
  }

  return createPageMetadata({
    lang: language,
    pathname: `restaurants/${slug}/menu`,
    title: language === "ru" ? "Меню доставки" : language === "en" ? "Delivery menu" : "Yetkazib berish menyusi",
    description:
      language === "ru"
        ? "Меню доставки ресторана."
        : language === "en"
          ? "Restaurant delivery menu."
          : "Restoran yetkazib berish menyusi.",
    noindex: true,
  });
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const language = resolveLang(lang) as LangCode;
  const backHref = `/${language}/restaurants/${slug}`;

  const branchRestaurant = await getBranchRestaurantBySlug(slug);

  if (branchRestaurant) {
    const projectName = pickLocalized(branchRestaurant.project?.name, language);
    const branchName = pickLocalized(branchRestaurant.branchName, language) || projectName;
    const address = pickLocalized(branchRestaurant.address, language);
    const toastMenu =
      branchRestaurant.city === "new_york" && isGoshtRestaurant(projectName, branchName)
        ? await getToastDeliveryMenu()
        : null;
    const menuFiles = buildMenuFiles(
      branchRestaurant.menuFiles,
      branchRestaurant.menu,
      branchRestaurant.project?.defaultMenu
    );

    return (
      <RestaurantDeliveryMenuPage
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
        dishes={toastMenu?.dishes}
        currencyCode={toastMenu?.currencyCode}
        requireApiDishes={branchRestaurant.city === "new_york" && isGoshtRestaurant(projectName, branchName)}
      />
    );
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug);
  if (!legacyRestaurant) {
    notFound();
  }

  const projectName = pickLocalized(legacyRestaurant.name, language);
  const branchName = pickLocalized(legacyRestaurant.branchName, language) || projectName;
  const address = pickLocalized(legacyRestaurant.address, language);
  const toastMenu =
    isGoshtRestaurant(projectName, branchName) ? await getToastDeliveryMenu() : null;
  const menuFiles = buildMenuFiles(legacyRestaurant.menuFiles, legacyRestaurant.menu);

  return (
    <RestaurantDeliveryMenuPage
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
      dishes={toastMenu?.dishes}
      currencyCode={toastMenu?.currencyCode}
    />
  );
}
