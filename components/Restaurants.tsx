import { client, urlFor } from "@/lib/sanity";
import RestaurantsClient from "./RestaurantsClient";

type LocalizedString = {
  uz?: string;
  ru?: string;
  en?: string;
};

type RestaurantRaw = {
  _id: string;
  name: LocalizedString;
  slug?: string;
  city: "tashkent" | "new_york" | string;
  image?: unknown;
  logo?: unknown;
  hasBanquet?: boolean;
  hasPlayground?: boolean;
  url?: string;
};

function normalizeSlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  const cleaned = slug.replace(/^\/+|\/+$/g, "");
  return cleaned || undefined;
}

async function getRestaurants(): Promise<RestaurantRaw[]> {
  const branchQuery = `
    *[
      _type == "restaurantBranch" &&
      isActive != false &&
      defined(project->_id) &&
      project->isActive != false &&
      coalesce(project->projectType, "restaurant") == "restaurant" &&
      defined(slug.current)
    ] | order(_createdAt desc) {
      _id,
      "slug": slug.current,
      city,
      "name": coalesce(branchName, project->name),
      "image": cardImage,
      "logo": project->logo,
      hasBanquet,
      hasPlayground,
      "url": externalUrl
    }
  `;

  const legacyQuery = `
    *[_type == "restaurants"] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      city,
      image,
      logo,
      hasBanquet,
      hasPlayground,
      url
    }
  `;

  const branchData = await client.fetch<RestaurantRaw[]>(branchQuery);
  if (branchData.length > 0) {
    return branchData;
  }

  return client.fetch<RestaurantRaw[]>(legacyQuery);
}

export default async function Restaurants() {
  const rawData = await getRestaurants();

  const items = rawData
    .map((item) => ({
      ...item,
      slug: normalizeSlug(item.slug),
      image: item.image ? urlFor(item.image).url() : undefined,
      logo: item.logo ? urlFor(item.logo).url() : undefined, // Обрабатываем логотип
    }))
    .filter((item) => Boolean(item.image))
    .map((item) => ({
      ...item,
      image: item.image as string,
    }));

  return <RestaurantsClient items={items} />;
}
