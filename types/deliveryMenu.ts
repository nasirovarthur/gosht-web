import type { Localized } from "@/types/i18n";

export type DeliveryMenuDishBadge = "chef" | "spicy" | "veg";

export type DeliveryMenuCategory = {
  id: string;
  label: Localized;
  order: number;
  isAvailable?: boolean;
};

export type DeliveryMenuDish = {
  id: string;
  title: Localized;
  price?: number;
  categoryId: string;
  categoryLabel: Localized;
  description?: Localized;
  image?: string;
  weight?: string;
  featured?: boolean;
  badges?: DeliveryMenuDishBadge[];
  isAvailable?: boolean;
};
