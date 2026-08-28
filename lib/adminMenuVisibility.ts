import "server-only";

import type { IikoDeliveryMenuResult } from "@/lib/iiko";

type MenuVisibilityResponse = {
  hiddenCategoryIds?: unknown;
  hiddenItemIds?: unknown;
};

type MenuVisibilityMask = {
  hiddenCategoryIds: Set<string>;
  hiddenItemIds: Set<string>;
};

const MAX_RESPONSE_LENGTH = 64 * 1024;
const MAX_HIDDEN_IDS = 5_000;
const ADMIN_MENU_TIMEOUT_MS = 3_000;

function stringIdSet(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set();

  return new Set(value
    .slice(0, MAX_HIDDEN_IDS)
    .filter((id): id is string => (
      typeof id === "string" && id.length > 0 && id.length <= 200
    )));
}

async function loadMenuVisibility(externalMenuId: string): Promise<MenuVisibilityMask | null> {
  const adminApiUrl = process.env.GOSHT_ADMIN_API_URL?.trim().replace(/\/+$/, "");
  if (!adminApiUrl) return null;

  try {
    const url = new URL(`${adminApiUrl}/public/menu-visibility`);
    url.searchParams.set("market", "UZ");
    url.searchParams.set("externalMenuId", externalMenuId);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(ADMIN_MENU_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_RESPONSE_LENGTH) return null;

    const text = await response.text();
    if (text.length > MAX_RESPONSE_LENGTH) return null;

    const payload = JSON.parse(text) as MenuVisibilityResponse;
    return {
      hiddenCategoryIds: stringIdSet(payload.hiddenCategoryIds),
      hiddenItemIds: stringIdSet(payload.hiddenItemIds),
    };
  } catch {
    return null;
  }
}

export async function applyAdminMenuVisibility(
  menu: IikoDeliveryMenuResult | null,
): Promise<IikoDeliveryMenuResult | null> {
  if (!menu) return null;

  const mask = await loadMenuVisibility(menu.externalMenuId);
  if (!mask) return menu;

  const dishes = menu.dishes.filter((dish) => (
    !mask.hiddenCategoryIds.has(dish.categoryId)
    && !mask.hiddenItemIds.has(dish.id)
  ));
  const populatedCategoryIds = new Set(dishes.map((dish) => dish.categoryId));
  const categories = menu.categories.filter((category) => (
    !mask.hiddenCategoryIds.has(category.id)
    && populatedCategoryIds.has(category.id)
  ));

  return { ...menu, categories, dishes };
}
