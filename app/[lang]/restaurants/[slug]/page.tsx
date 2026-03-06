import { notFound } from "next/navigation";
import RestaurantDetail from "@/components/RestaurantDetail";
import { client } from "@/lib/sanity";

type Language = "uz" | "ru" | "en";

type LocalizedString = {
  uz?: string;
  ru?: string;
  en?: string;
};

type BranchRestaurantRaw = {
  branchName?: LocalizedString;
  address?: LocalizedString;
  phone?: string;
  workingHours?: LocalizedString;
  averageCheck?: LocalizedString;
  yearOpened?: string;
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
    name?: LocalizedString;
    description?: LocalizedString;
    descriptionExtended?: LocalizedString;
    descriptionAdditional?: LocalizedString;
    defaultMenu?: string;
    lead?: {
      title?: LocalizedString;
      name?: LocalizedString;
      description?: LocalizedString;
      image?: string;
    };
  };
};

type LegacyRestaurantRaw = {
  name?: LocalizedString;
  branchName?: LocalizedString;
  address?: LocalizedString;
  phone?: string;
  workingHours?: LocalizedString;
  averageCheck?: LocalizedString;
  description?: LocalizedString;
  descriptionExtended?: LocalizedString;
  descriptionAdditional?: LocalizedString;
  yearOpened?: string;
  menu?: string;
  gallery?: string[];
  map?: {
    coordinates?: string;
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };
  chef?: {
    title?: LocalizedString;
    name?: LocalizedString;
    description?: LocalizedString;
    image?: string;
  };
};

function pickLocalized(value: LocalizedString | undefined, lang: Language): string {
  if (!value) return "";
  return value[lang] || value.uz || value.ru || value.en || "";
}

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
      coalesce(project->projectType, "restaurant") == "restaurant"
    ][0] {
      branchName,
      address,
      phone,
      workingHours,
      averageCheck,
      yearOpened,
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

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const language = (lang as Language) || "uz";

  const branchRestaurant = await getBranchRestaurantBySlug(slug);

  if (branchRestaurant) {
    const { mapLink, mapEmbedUrl } = buildMapUrls(branchRestaurant.map);

    return (
      <RestaurantDetail
        restaurant={{
          name: pickLocalized(branchRestaurant.project?.name, language),
          branchName:
            pickLocalized(branchRestaurant.branchName, language) ||
            pickLocalized(branchRestaurant.project?.name, language),
          address: pickLocalized(branchRestaurant.address, language),
          phone: branchRestaurant.phone || "",
          workingHours: pickLocalized(branchRestaurant.workingHours, language),
          averageCheck: pickLocalized(branchRestaurant.averageCheck, language),
          description: pickLocalized(branchRestaurant.project?.description, language),
          descriptionExtended: pickLocalized(branchRestaurant.project?.descriptionExtended, language),
          descriptionAdditional: pickLocalized(branchRestaurant.project?.descriptionAdditional, language),
          yearOpened: branchRestaurant.yearOpened,
          menu: branchRestaurant.menu || branchRestaurant.project?.defaultMenu || "#",
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
    );
  }

  const legacyRestaurant = await getLegacyRestaurantBySlug(slug);
  if (!legacyRestaurant) {
    notFound();
  }

  const { mapLink, mapEmbedUrl } = buildMapUrls(legacyRestaurant.map);

  return (
    <RestaurantDetail
      restaurant={{
        name: pickLocalized(legacyRestaurant.name, language),
        branchName: pickLocalized(legacyRestaurant.branchName, language) || pickLocalized(legacyRestaurant.name, language),
        address: pickLocalized(legacyRestaurant.address, language),
        phone: legacyRestaurant.phone || "",
        workingHours: pickLocalized(legacyRestaurant.workingHours, language),
        averageCheck: pickLocalized(legacyRestaurant.averageCheck, language),
        description: pickLocalized(legacyRestaurant.description, language),
        descriptionExtended: pickLocalized(legacyRestaurant.descriptionExtended, language),
        descriptionAdditional: pickLocalized(legacyRestaurant.descriptionAdditional, language),
        yearOpened: legacyRestaurant.yearOpened,
        menu: legacyRestaurant.menu || "#",
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
  );
}
