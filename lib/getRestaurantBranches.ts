import { client, urlFor } from "@/lib/sanity";
import type { LocalizedOptional } from "@/types/i18n";

type ImageSource = Parameters<typeof urlFor>[0];

type RestaurantBranchRaw = {
  _id: string;
  slug?: string;
  projectType?: "restaurant" | "barbershop";
  city?: string;
  branchName?: LocalizedOptional;
  projectId?: string;
  projectName?: LocalizedOptional;
  projectLogo?: unknown;
  projectDescription?: LocalizedOptional;
  cardImage?: unknown;
  gallery?: unknown[];
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  hasBanquet?: boolean;
  hasPlayground?: boolean;
  hasVipRoom?: boolean;
  hasKidsHaircut?: boolean;
  defaultMenuFile?: string;
  menuFiles?: string[];
  menuFile?: string;
  mapCoordinates?: string;
  mapZoom?: number;
};

export type RestaurantBranchItem = {
  id: string;
  slug?: string;
  projectType: "restaurant" | "barbershop";
  city: string;
  branchName: LocalizedOptional;
  projectId: string;
  projectName: LocalizedOptional;
  projectLogo?: string;
  projectDescription?: LocalizedOptional;
  cardImage?: string;
  gallery: string[];
  address?: LocalizedOptional;
  phone?: string;
  workingHours?: LocalizedOptional;
  averageCheck?: LocalizedOptional;
  hasBanquet: boolean;
  hasPlayground: boolean;
  hasVipRoom: boolean;
  hasKidsHaircut: boolean;
  menuUrls: string[];
  menuUrl?: string;
  mapCoordinates?: [number, number];
  mapZoom?: number;
  mapLink?: string;
};

export type RestaurantProjectItem = {
  id: string;
  name: LocalizedOptional;
  logo?: string;
  description?: LocalizedOptional;
  branches: RestaurantBranchItem[];
};

export type RestaurantsDirectoryData = {
  projects: RestaurantProjectItem[];
  branches: RestaurantBranchItem[];
  availableCities: string[];
};

const restaurantBranchesQuery = `
  *[
    _type == "restaurantBranch" &&
    isActive != false &&
    defined(project->_id) &&
    project->isActive != false &&
    coalesce(project->projectType, "restaurant") in ["restaurant", "barbershop"] &&
    defined(slug.current)
  ] | order(project->name.ru asc, branchName.ru asc) {
    _id,
    "slug": slug.current,
    "projectType": coalesce(project->projectType, "restaurant"),
    city,
    "branchName": coalesce(branchName, project->name),
    "projectId": project->_id,
    "projectName": project->name,
    "projectLogo": project->logo,
    "projectDescription": project->description,
    cardImage,
    gallery,
    address,
    phone,
    workingHours,
    averageCheck,
    hasBanquet,
    hasPlayground,
    hasVipRoom,
    hasKidsHaircut,
    "defaultMenuFile": project->defaultMenuFile.asset->url,
    "menuFiles": menuFiles[].asset->url,
    "menuFile": menuFile.asset->url,
    "mapCoordinates": map.coordinates,
    "mapZoom": map.zoom
  }
`;

function normalizeSlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  const cleaned = slug.replace(/^\/+|\/+$/g, "");
  return cleaned || undefined;
}

function parseCoordinates(rawValue?: string): [number, number] | undefined {
  if (!rawValue) return undefined;

  const [lonRaw, latRaw] = rawValue.split(",").map((item) => item.trim());
  if (!lonRaw || !latRaw) return undefined;

  const lon = Number(lonRaw);
  const lat = Number(latRaw);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return undefined;

  return [lat, lon];
}

function buildMapLink(coordinates?: [number, number], zoom = 15): string | undefined {
  if (!coordinates) return undefined;
  const [lat, lon] = coordinates;
  return `https://yandex.uz/maps/?ll=${lon}%2C${lat}&z=${zoom}`;
}

function buildMenuUrls(item: Pick<RestaurantBranchRaw, "menuFiles" | "menuFile" | "defaultMenuFile">): string[] {
  const urls = [
    ...(Array.isArray(item.menuFiles) ? item.menuFiles : []),
    ...(item.menuFile ? [item.menuFile] : []),
  ];

  if (urls.length === 0 && item.defaultMenuFile) {
    urls.push(item.defaultMenuFile);
  }

  return Array.from(new Set(urls.filter(Boolean)));
}

export async function getRestaurantBranchesData(): Promise<RestaurantsDirectoryData> {
  const rawData = await client.fetch<RestaurantBranchRaw[]>(restaurantBranchesQuery);

  const branches = rawData
    .map<RestaurantBranchItem | null>((item) => {
      if (!item.projectId || !item.projectName) {
        return null;
      }

      const mapCoordinates = parseCoordinates(item.mapCoordinates);
      const mapZoom = typeof item.mapZoom === "number" ? item.mapZoom : 15;
      const menuUrls = buildMenuUrls(item);

      return {
        id: item._id,
        slug: normalizeSlug(item.slug),
        projectType: item.projectType === "barbershop" ? "barbershop" : "restaurant",
        city: item.city || "tashkent",
        branchName: item.branchName || item.projectName,
        projectId: item.projectId,
        projectName: item.projectName,
        projectLogo: item.projectLogo ? urlFor(item.projectLogo as ImageSource).url() : undefined,
        projectDescription: item.projectDescription,
        cardImage: item.cardImage ? urlFor(item.cardImage as ImageSource).url() : undefined,
        gallery: Array.isArray(item.gallery)
          ? item.gallery
              .map((image) => {
                try {
                  return urlFor(image as ImageSource).url();
                } catch {
                  return null;
                }
              })
              .filter((image): image is string => Boolean(image))
          : [],
        address: item.address,
        phone: item.phone,
        workingHours: item.workingHours,
        averageCheck: item.averageCheck,
        hasBanquet: item.hasBanquet === true,
        hasPlayground: item.hasPlayground === true,
        hasVipRoom: item.hasVipRoom === true,
        hasKidsHaircut: item.hasKidsHaircut === true,
        menuUrls,
        menuUrl: menuUrls[0],
        mapCoordinates,
        mapZoom,
        mapLink: buildMapLink(mapCoordinates, mapZoom),
      };
    })
    .filter((item): item is RestaurantBranchItem => Boolean(item));

  const projectsMap = new Map<string, RestaurantProjectItem>();

  for (const branch of branches) {
    if (!projectsMap.has(branch.projectId)) {
      projectsMap.set(branch.projectId, {
        id: branch.projectId,
        name: branch.projectName,
        logo: branch.projectLogo,
        description: branch.projectDescription,
        branches: [],
      });
    }

    projectsMap.get(branch.projectId)?.branches.push(branch);
  }

  return {
    projects: Array.from(projectsMap.values()),
    branches,
    availableCities: Array.from(new Set(branches.map((branch) => branch.city))).filter(Boolean),
  };
}
