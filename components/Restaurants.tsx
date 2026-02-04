import { client, urlFor } from "@/lib/sanity";
import RestaurantsClient from "./RestaurantsClient";

async function getRestaurants() {
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
  const data = await client.fetch(query);
  return data;
}

export default async function Restaurants() {
  const rawData = await getRestaurants();

  const items = rawData.map((item: any) => ({
    ...item,
    image: item.image ? urlFor(item.image).url() : null,
    logo: item.logo ? urlFor(item.logo).url() : null, // Обрабатываем логотип
  })).filter((item: any) => item.image);

  return <RestaurantsClient items={items} />;
}