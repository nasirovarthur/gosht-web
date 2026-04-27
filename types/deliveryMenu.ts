import type { Localized } from "@/types/i18n";

export type DeliveryMenuDishBadge = "chef" | "spicy" | "veg";

export type DeliveryMenuDish = {
  id: string;
  title: Localized;
  price: number;
  categoryId: string;
  categoryLabel: Localized;
  image?: string;
  weight?: string;
  featured?: boolean;
  badges?: DeliveryMenuDishBadge[];
};
