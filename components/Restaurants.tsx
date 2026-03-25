import { getRestaurantBranchesData } from "@/lib/getRestaurantBranches";
import RestaurantsClient from "./RestaurantsClient";

export default async function Restaurants() {
  const data = await getRestaurantBranchesData();

  const items = data.branches
    .filter((item) => Boolean(item.cardImage))
    .map((item) => ({
      _id: item.id,
      name: item.branchName,
      slug: item.slug,
      projectType: item.projectType,
      city: item.city,
      image: item.cardImage as string,
      logo: item.projectLogo,
      hasBanquet: item.hasBanquet,
      hasPlayground: item.hasPlayground,
      hasVipRoom: item.hasVipRoom,
      hasKidsHaircut: item.hasKidsHaircut,
    }));

  return <RestaurantsClient items={items} />;
}
