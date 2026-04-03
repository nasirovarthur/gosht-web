import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RestaurantDetail from "@/components/RestaurantDetail";
import SeoJsonLd from "@/components/SeoJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema, getVenueSchema } from "@/lib/seo/schema";
import { resolveLang } from "@/lib/seo/site";
import { client } from "@/lib/sanity";
import { pickLocalized } from "@/types/i18n";
import type { LangCode, LocalizedOptional } from "@/types/i18n";

type BranchRestaurantRaw = {
  branchName?: LocalizedOptional;
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  yearOpened?: string;
  menuFiles?: string[];
  menu?: string;
  gallery?: string[];
  map?: {
    coordinates?: string;
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };
  project?: {
    projectType?: "restaurant" | "barbershop";
    name?: LocalizedOptional;
    detailPrimaryInfo?: LocalizedOptional;
    description?: LocalizedOptional;
    descriptionExtended?: LocalizedOptional;
    descriptionAdditional?: LocalizedOptional;
    defaultMenu?: string;
    lead?: {
      title?: LocalizedOptional;
      name?: LocalizedOptional;
      description?: LocalizedOptional;
      image?: string;
    };
  };
};

type LegacyRestaurantRaw = {
  name?: LocalizedOptional;
  branchName?: LocalizedOptional;
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  description?: LocalizedOptional;
  descriptionExtended?: LocalizedOptional;
  descriptionAdditional?: LocalizedOptional;
  yearOpened?: string;
  menuFiles?: string[];
  menu?: string;
  gallery?: string[];
  map?: {
    coordinates?: string;
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };
  chef?: {
    title?: LocalizedOptional;
    name?: LocalizedOptional;
    description?: LocalizedOptional;
    image?: string;
  };
};

function parseCoordinates(raw: string | undefined): { latitude: number; longitude: number } | null {
  if (!raw) return null;
  const [rawLon, rawLat] = raw.split(",").map((value) => value.trim());
  if (!rawLon || !rawLat) return null;

  const longitude = Number(rawLon);
  const latitude = Number(rawLat);
  const isLongitudeValid = !Number.isNaN(longitude) && longitude >= -180 && longitude <= 180;
  const isLatitudeValid = !Number.isNaN(latitude) && latitude >= -90 && latitude <= 90;

  if (!isLongitudeValid || !isLatitudeValid) {
    return null;
  }

  return { latitude, longitude };
}

function buildSlugCandidates(slug: string): string[] {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return [slug];
  return Array.from(new Set([slug, trimmed, `/${trimmed}`]));
}

function buildMapUrls(map: BranchRestaurantRaw["map"] | LegacyRestaurantRaw["map"]): {
  mapLink: string;
  mapEmbedUrl?: string;
} {
  const parsed = parseCoordinates(map?.coordinates);
  const latitude =
    parsed?.latitude ?? (typeof map?.latitude === "number" ? map.latitude : undefined);
  const longitude =
    parsed?.longitude ?? (typeof map?.longitude === "number" ? map.longitude : undefined);
  const zoom = map?.zoom || 15;
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";

  if (!hasCoordinates) {
    return { mapLink: "https://yandex.uz/maps" };
  }

  return {
    mapLink: `https://yandex.uz/maps/?ll=${longitude},${latitude}&z=${zoom}`,
    mapEmbedUrl: `https://yandex.uz/map-widget/v1/?ll=${longitude},${latitude}&z=${zoom}`,
  };
}

async function getBranchRestaurantBySlug(slug: string): Promise<BranchRestaurantRaw | null> {
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
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      yearOpened,
      "menuFiles": menuFiles[].asset->url,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      map {
        coordinates,
        latitude,
        longitude,
        zoom
      },
      project-> {
        projectType,
        name,
        detailPrimaryInfo,
        description,
        descriptionExtended,
        descriptionAdditional,
        "defaultMenu": defaultMenuFile.asset->url,
        lead {
          title,
          name,
          description,
          "image": image.asset->url
        }
      }
    }
  `;

  return client.fetch<BranchRestaurantRaw | null>(query, { slugCandidates });
}

async function getLegacyRestaurantBySlug(slug: string): Promise<LegacyRestaurantRaw | null> {
  const slugCandidates = buildSlugCandidates(slug);
  const query = `
    *[_type == "restaurants" && slug.current in $slugCandidates][0] {
      name,
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      description,
      descriptionExtended,
      descriptionAdditional,
      yearOpened,
      "menuFiles": menuFiles[].asset->url,
      "menu": menuFile.asset->url,
      "gallery": gallery[].asset->url,
      map {
        coordinates,
        latitude,
        longitude,
        zoom
      },
      chef {
        title,
        name,
        description,
        "image": image.asset->url
      }
    }
  `;

  return client.fetch<LegacyRestaurantRaw | null>(query, { slugCandidates });
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

function buildRestaurantSeo({
  lang,
  projectType,
  projectName,
  branchName,
  primaryInfo,
  address,
}: {
  lang: LangCode;
  projectType: "restaurant" | "barbershop";
  projectName: string;
  branchName: string;
  primaryInfo: string;
  address: string;
}) {
  if (projectType === "barbershop") {
    if (lang === "ru") {
      return {
        title: `${branchName} — барбершоп ${projectName} в Ташкенте`,
        description: `${branchName} — мужской барбершоп ${projectName} от Gōsht Group в Ташкенте. ${primaryInfo}. Адрес, контакты и информация о проекте.`,
      };
    }

    if (lang === "en") {
      return {
        title: `${branchName} - ${projectName} barbershop in Tashkent`,
        description: `${branchName} is the ${projectName} barbershop by Gōsht Group in Tashkent. ${primaryInfo}. Find the address, contacts, and project details.`,
      };
    }

    return {
      title: `${branchName} — Toshkentdagi ${projectName} barbershopi`,
      description: `${branchName} — Gōsht Group ekotizimidagi ${projectName} barbershopi. ${primaryInfo}. Manzil, aloqa va loyiha tafsilotlari shu sahifada.`,
    };
  }

  if (lang === "ru") {
    return {
      title: `${branchName} — ${projectName} в Ташкенте`,
      description: `${branchName} — проект ${projectName} от Gōsht Group в Ташкенте. ${primaryInfo}${address ? ` Адрес: ${address}.` : ""} Меню, контакты, карта и информация о ресторане на одной странице.`,
    };
  }

  if (lang === "en") {
    return {
      title: `${branchName} - ${projectName} in Tashkent`,
      description: `${branchName} is a ${projectName} concept by Gōsht Group in Tashkent. ${primaryInfo}${address ? ` Address: ${address}.` : ""} Find menu, contacts, map, and restaurant details here.`,
    };
  }

  return {
    title: `${branchName} — Toshkentdagi ${projectName}`,
    description: `${branchName} — Gōsht Group’ning ${projectName} loyihasi. ${primaryInfo}${address ? ` Manzil: ${address}.` : ""} Menyu, aloqa, xarita va restoran haqida ma’lumot bir sahifada.`,
  };
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
    const branchName =
      pickLocalized(branchRestaurant.branchName, language) || projectName;
    const primaryInfo =
      pickLocalized(branchRestaurant.project?.detailPrimaryInfo, language) || projectName;
    const address = pickLocalized(branchRestaurant.address, language);
    const seo = buildRestaurantSeo({
      lang: language,
      projectType:
        branchRestaurant.project?.projectType === "barbershop" ? "barbershop" : "restaurant",
      projectName,
      branchName,
      primaryInfo,
      address,
    });

    return createPageMetadata({
      lang: language,
      pathname: `restaurants/${slug}`,
      title: seo.title,
      description: seo.description,
      image: branchRestaurant.gallery?.[0] || "/logo.svg",
      keywords: [
        projectName,
        branchName,
        primaryInfo,
        "Gōsht Group",
        branchRestaurant.project?.projectType === "barbershop" ? "barbershop" : "restaurant",
      ].filter(Boolean) as string[],
      type: "article",
    });
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug);
  if (legacyRestaurant) {
    const projectName = pickLocalized(legacyRestaurant.name, language);
    const branchName =
      pickLocalized(legacyRestaurant.branchName, language) || projectName;
    const primaryInfo = projectName;
    const address = pickLocalized(legacyRestaurant.address, language);
    const seo = buildRestaurantSeo({
      lang: language,
      projectType: "restaurant",
      projectName,
      branchName,
      primaryInfo,
      address,
    });

    return createPageMetadata({
      lang: language,
      pathname: `restaurants/${slug}`,
      title: seo.title,
      description: seo.description,
      image: legacyRestaurant.gallery?.[0] || "/logo.svg",
      keywords: [projectName, branchName, "Gōsht Group", "restaurant"].filter(Boolean),
      type: "article",
    });
  }

  return createPageMetadata({
    lang: language,
    pathname: `restaurants/${slug}`,
    title: language === "ru" ? "Ресторан Gōsht Group" : language === "en" ? "Gōsht Group venue" : "Gōsht Group loyihasi",
    description:
      language === "ru"
        ? "Заведение Gōsht Group в Ташкенте."
        : language === "en"
          ? "A Gōsht Group venue in Tashkent."
          : "Toshkentdagi Gōsht Group loyihasi.",
    noindex: true,
  });
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const language = resolveLang(lang) as LangCode;

  const branchRestaurant = await getBranchRestaurantBySlug(slug);

  if (branchRestaurant) {
    const { mapLink, mapEmbedUrl } = buildMapUrls(branchRestaurant.map);
    const projectName = pickLocalized(branchRestaurant.project?.name, language);
    const branchName =
      pickLocalized(branchRestaurant.branchName, language) || projectName;
    const primaryInfo =
      pickLocalized(branchRestaurant.project?.detailPrimaryInfo, language) || projectName;
    const address = pickLocalized(branchRestaurant.address, language);
    const menuFiles = buildMenuFiles(
      branchRestaurant.menuFiles,
      branchRestaurant.menu,
      branchRestaurant.project?.defaultMenu
    );
    const seo = buildRestaurantSeo({
      lang: language,
      projectType:
        branchRestaurant.project?.projectType === "barbershop" ? "barbershop" : "restaurant",
      projectName,
      branchName,
      primaryInfo,
      address,
    });
    const schemaPath = `restaurants/${slug}`;
    const venueSchema = getVenueSchema({
      lang: language,
      path: schemaPath,
      name: branchName,
      description:
        pickLocalized(branchRestaurant.project?.description, language) || seo.description,
      image: branchRestaurant.gallery?.[0],
      telephone: branchRestaurant.phone || undefined,
      address: address || undefined,
      menu: menuFiles[0],
      priceRange: pickLocalized(branchRestaurant.averageCheck, language) || undefined,
      primaryInfo,
      businessType:
        branchRestaurant.project?.projectType === "barbershop" ? "Barbershop" : "Restaurant",
    });
    const breadcrumbSchema = getBreadcrumbSchema([
      {
        name: language === "ru" ? "Рестораны" : language === "en" ? "Restaurants" : "Restoranlar",
        path: `/${language}/restaurants`,
      },
      { name: branchName, path: `/${language}/restaurants/${slug}` },
    ]);

    return (
      <>
        <SeoJsonLd data={[venueSchema, breadcrumbSchema]} />
        <RestaurantDetail
          restaurant={{
            name: projectName,
            projectType: branchRestaurant.project?.projectType === "barbershop" ? "barbershop" : "restaurant",
            primaryInfoValue: primaryInfo,
            branchName,
            address,
            phone: branchRestaurant.phone || "",
            workingHours: pickLocalized(branchRestaurant.workingHours, language),
            averageCheck: pickLocalized(branchRestaurant.averageCheck, language),
            description: pickLocalized(branchRestaurant.project?.description, language),
            descriptionExtended: pickLocalized(branchRestaurant.project?.descriptionExtended, language),
            descriptionAdditional: pickLocalized(branchRestaurant.project?.descriptionAdditional, language),
            yearOpened: branchRestaurant.yearOpened,
            menuFiles,
            gallery: branchRestaurant.gallery || [],
            mapLink,
            mapEmbedUrl,
            chef: {
              title: pickLocalized(branchRestaurant.project?.lead?.title, language),
              name: pickLocalized(branchRestaurant.project?.lead?.name, language),
              description: pickLocalized(branchRestaurant.project?.lead?.description, language),
              image: branchRestaurant.project?.lead?.image,
            },
          }}
        />
      </>
    );
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug);
  if (!legacyRestaurant) {
    notFound();
  }

  const { mapLink, mapEmbedUrl } = buildMapUrls(legacyRestaurant.map);
  const projectName = pickLocalized(legacyRestaurant.name, language);
  const branchName =
    pickLocalized(legacyRestaurant.branchName, language) || projectName;
  const address = pickLocalized(legacyRestaurant.address, language);
  const menuFiles = buildMenuFiles(legacyRestaurant.menuFiles, legacyRestaurant.menu);
  const seo = buildRestaurantSeo({
    lang: language,
    projectType: "restaurant",
    projectName,
    branchName,
    primaryInfo: projectName,
    address,
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    {
      name: language === "ru" ? "Рестораны" : language === "en" ? "Restaurants" : "Restoranlar",
      path: `/${language}/restaurants`,
    },
    { name: branchName, path: `/${language}/restaurants/${slug}` },
  ]);
  const venueSchema = getVenueSchema({
    lang: language,
    path: `restaurants/${slug}`,
    name: branchName,
    description: pickLocalized(legacyRestaurant.description, language) || seo.description,
    image: legacyRestaurant.gallery?.[0],
    telephone: legacyRestaurant.phone || undefined,
    address: address || undefined,
    menu: menuFiles[0],
    priceRange: pickLocalized(legacyRestaurant.averageCheck, language) || undefined,
    primaryInfo: projectName,
    businessType: "Restaurant",
  });

  return (
    <>
      <SeoJsonLd data={[venueSchema, breadcrumbSchema]} />
      <RestaurantDetail
        restaurant={{
          name: projectName,
          projectType: "restaurant",
          primaryInfoValue: projectName,
          branchName,
          address,
          phone: legacyRestaurant.phone || "",
          workingHours: pickLocalized(legacyRestaurant.workingHours, language),
          averageCheck: pickLocalized(legacyRestaurant.averageCheck, language),
          description: pickLocalized(legacyRestaurant.description, language),
          descriptionExtended: pickLocalized(legacyRestaurant.descriptionExtended, language),
          descriptionAdditional: pickLocalized(legacyRestaurant.descriptionAdditional, language),
          yearOpened: legacyRestaurant.yearOpened,
          menuFiles,
          gallery: legacyRestaurant.gallery || [],
          mapLink,
          mapEmbedUrl,
          chef: {
            title: pickLocalized(legacyRestaurant.chef?.title, language),
            name: pickLocalized(legacyRestaurant.chef?.name, language),
            description: pickLocalized(legacyRestaurant.chef?.description, language),
            image: legacyRestaurant.chef?.image,
          },
        }}
      />
    </>
  );
}
