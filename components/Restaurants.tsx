import { client, urlFor } from "@/lib/sanity";
import RestaurantsClient from "./RestaurantsClient";

type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

type RestaurantRaw = {
  _id: string;
  name: LocalizedString;
  city: "tashkent" | "new_york";
  image?: unknown;
  logo?: unknown;
  hasBanquet?: boolean;
  hasPlayground?: boolean;
  url?: string;
};

async function getRestaurants(): Promise<RestaurantRaw[]> {
  const query = `
    *[_type == "restaurants"] | order(_createdAt desc) {
      _id,
      name,
      city,
      image,
      logo,          // Добавили
      hasBanquet,    // Добавили
      hasPlayground, // Добавили
      url
    }
  `;
  const data = await client.fetch<RestaurantRaw[]>(query);
  return data;
}

export default async function Restaurants() {
  const rawData = await getRestaurants();

  const items = rawData
    .map((item) => ({
      ...item,
      image: item.image ? urlFor(item.image).url() : null,
      logo: item.logo ? urlFor(item.logo).url() : null, // Обрабатываем логотип
    }))
    .filter((item) => item.image);

  return <RestaurantsClient items={items} />;
}
