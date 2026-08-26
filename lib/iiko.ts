import "server-only";
import type {
  DeliveryMenuCategory,
  DeliveryMenuDish,
  DeliveryMenuDishBadge,
} from "@/types/deliveryMenu";

const IIKO_API_HOST = process.env.IIKO_API_HOST || "https://api-ru.iiko.services";
const IIKO_API_LOGIN = process.env.IIKO_API_LOGIN;
const IIKO_ORGANIZATION_ID = process.env.IIKO_ORGANIZATION_ID;
const IIKO_EXTERNAL_MENU_ID = process.env.IIKO_EXTERNAL_MENU_ID;
const IIKO_EXTERNAL_MENU_NAME = (process.env.IIKO_EXTERNAL_MENU_NAME || "").trim().toLowerCase();
const IIKO_PRICE_CATEGORY_ID = process.env.IIKO_PRICE_CATEGORY_ID;
const IIKO_MENU_LANGUAGE = process.env.IIKO_MENU_LANGUAGE || "ru";
const IIKO_IMAGE_FALLBACK_MENU_NAMES = (process.env.IIKO_IMAGE_FALLBACK_MENU_NAMES || "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

type IikoAccessTokenResponse = {
  token?: string;
};

type IikoOrganization = {
  id?: string;
  name?: string;
  isActive?: boolean;
};

type IikoOrganizationsResponse = {
  organizations?: IikoOrganization[];
};

type IikoExternalMenuRef = {
  id?: string;
  name?: string;
};

type IikoPriceCategory = {
  id?: string;
  name?: string;
};

type IikoMenusResponse = {
  externalMenus?: IikoExternalMenuRef[];
  priceCategories?: IikoPriceCategory[];
};

type IikoPrice = {
  organizations?: string[];
  organizationId?: string;
  price?: number | null;
};

type IikoMenuItemSize = {
  id?: string;
  sizeId?: string;
  sizeName?: string | null;
  isDefault?: boolean;
  isHidden?: boolean;
  weight?: number;
  portionWeightGrams?: number;
  measureUnitType?: string;
  buttonImageUrl?: string | null;
  buttonImageCroppedUrl?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  prices?: IikoPrice[];
};

type IikoTagLike = string | { name?: string; title?: string; caption?: string };

type IikoMenuItem = {
  id?: string;
  itemId?: string;
  sku?: string;
  name?: string;
  description?: string | null;
  type?: string;
  isHidden?: boolean;
  labels?: IikoTagLike[];
  tags?: IikoTagLike[];
  itemSizes?: IikoMenuItemSize[];
  buttonImageUrl?: string | null;
  buttonImageCroppedUrl?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  imageLinks?: string[];
  images?: Array<{ imageUrl?: string | null; url?: string | null }>;
};

type IikoMenuCategory = {
  id?: string | null;
  name?: string;
  isHidden?: boolean;
  items?: IikoMenuItem[];
};

type IikoExternalMenu = {
  itemGroups?: IikoMenuCategory[];
  itemCategories?: IikoMenuCategory[];
};

export type IikoDeliveryMenuResult = {
  categories: DeliveryMenuCategory[];
  dishes: DeliveryMenuDish[];
  currencyCode: "UZS";
  organizationId: string;
  externalMenuId: string;
};

type IikoDeliveryMenuOptions = {
  organizationNameHint?: string;
  externalMenuNameHint?: string;
};

function toLocalized(value: string) {
  return { uz: value, ru: value, en: value };
}

function normalizeCategoryId(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "menu";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/gōsht/g, "gosht")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function transliterateCyrillic(value: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sh",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
    ъ: "",
    ь: "",
  };

  return value
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/\bgusht\b/g, "gosht")
    .replace(/\bvest\b/g, "west");
}

function normalizeSearchText(value: string): string {
  return normalizeText(transliterateCyrillic(value));
}

function findBestNameMatch<T extends { name?: string }>(items: T[], hint: string): T | null {
  const normalizedHint = normalizeSearchText(hint);

  if (!normalizedHint) {
    return null;
  }

  const scored = items
    .map((item, index) => {
      const normalizedName = normalizeSearchText(item.name || "");
      if (!normalizedName) {
        return null;
      }

      let score = 0;
      if (normalizedName === normalizedHint) {
        score = 1000;
      } else if (normalizedName.includes(normalizedHint)) {
        score = 700;
      } else if (normalizedHint.includes(normalizedName)) {
        score = 300;
      }

      if (score === 0) {
        return null;
      }

      return {
        item,
        index,
        score: score + Math.min(normalizedName.length, 120),
      };
    })
    .filter((entry): entry is { item: T; index: number; score: number } => Boolean(entry))
    .toSorted((a, b) => b.score - a.score || a.index - b.index);

  return scored[0]?.item || null;
}

function normalizeWeightUnit(unit: string | undefined): string {
  switch ((unit || "").toUpperCase()) {
    case "GRAM":
    case "GRAMS":
      return "g";
    case "KILOGRAM":
    case "KILOGRAMS":
      return "kg";
    case "LITER":
    case "LITERS":
      return "l";
    case "MILLILITER":
    case "MILLILITERS":
      return "ml";
    default:
      return "";
  }
}

function formatWeight(size: IikoMenuItemSize): string | undefined {
  const weight =
    typeof size.portionWeightGrams === "number" && size.portionWeightGrams > 0
      ? size.portionWeightGrams
      : typeof size.weight === "number" && size.weight > 0
        ? size.weight
        : null;

  if (!weight) return undefined;

  const formattedWeight = Number.isInteger(weight)
    ? String(weight)
    : weight.toFixed(1).replace(/\.0$/, "");
  const unit = normalizeWeightUnit(size.measureUnitType) || "g";

  return `${formattedWeight} ${unit}`;
}

function tagToText(tag: IikoTagLike): string {
  if (typeof tag === "string") return tag;
  return tag.name || tag.title || tag.caption || "";
}

function getDishBadges(item: IikoMenuItem): DeliveryMenuDishBadge[] | undefined {
  const source = [...(item.labels || []), ...(item.tags || [])]
    .map(tagToText)
    .join(" ");
  const normalized = normalizeText(`${source} ${item.name || ""}`);
  const badges = new Set<DeliveryMenuDishBadge>();

  if (/(остр|spicy|chili|чили|achchiq)/i.test(normalized)) {
    badges.add("spicy");
  }

  if (/(veg|vegetarian|вегет|постн|plant|sabzavot)/i.test(normalized)) {
    badges.add("veg");
  }

  if (/(chef|шеф|хит|recommend|signature|фирмен)/i.test(normalized)) {
    badges.add("chef");
  }

  return badges.size > 0 ? Array.from(badges) : undefined;
}

function pickPrice(size: IikoMenuItemSize, organizationId: string): number | undefined {
  const prices = Array.isArray(size.prices) ? size.prices : [];
  const organizationPrice = prices.find((entry) => {
    const price = entry.price;
    return (
      typeof price === "number" &&
      Number.isFinite(price) &&
      price > 0 &&
      (
        (Array.isArray(entry.organizations) && entry.organizations.includes(organizationId)) ||
        entry.organizationId === organizationId
      )
    );
  });

  const fallbackPrice = prices.find((entry) => {
    const price = entry.price;
    return typeof price === "number" && Number.isFinite(price) && price > 0;
  });

  return organizationPrice?.price || fallbackPrice?.price || undefined;
}

function pickSize(item: IikoMenuItem, organizationId: string): IikoMenuItemSize | null {
  const sizes = (item.itemSizes || []).filter((size) => size.isHidden !== true);

  return (
    sizes.find((size) => size.isDefault === true) ||
    sizes.find((size) => pickPrice(size, organizationId)) ||
    sizes[0] ||
    null
  );
}

function pickImage(item: IikoMenuItem, size: IikoMenuItemSize): string | undefined {
  const candidates = [
    size.buttonImageUrl,
    size.buttonImageCroppedUrl,
    size.imageUrl,
    size.image,
    item.buttonImageUrl,
    item.buttonImageCroppedUrl,
    item.imageUrl,
    item.image,
    item.imageLinks?.[0],
    item.images?.[0]?.imageUrl,
    item.images?.[0]?.url,
    ...(item.itemSizes || []).flatMap((itemSize) => [
      itemSize.buttonImageUrl,
      itemSize.buttonImageCroppedUrl,
      itemSize.imageUrl,
      itemSize.image,
    ]),
  ];

  for (const image of candidates) {
    if (typeof image === "string" && image.trim().length > 0) {
      return image.trim();
    }
  }

  return undefined;
}

function getImageLookupKeys(item: IikoMenuItem, title?: string): string[] {
  const values = [
    title,
    item.name,
    ...(item.itemSizes || []).map((size) => {
      const sizeName = (size.sizeName || "").trim();
      return sizeName && item.name ? `${item.name} ${sizeName}` : "";
    }),
  ];

  const keys = new Set<string>();
  for (const value of values) {
    const normalized = normalizeSearchText(value || "");
    if (normalized) {
      keys.add(normalized);
      keys.add(normalized.replace(/\b\d+([.,]\d+)?\s*(g|gr|гр|kg|кг|ml|мл|l|л)\b/g, "").trim());
    }
  }

  return Array.from(keys).filter(Boolean);
}

function buildImageFallbackMap(payloads: IikoExternalMenu[]): Map<string, string> {
  const images = new Map<string, string>();

  for (const payload of payloads) {
    const categories = payload.itemGroups || payload.itemCategories || [];
    for (const category of categories) {
      for (const item of category.items || []) {
        if (item.isHidden === true) {
          continue;
        }

        const size = pickSize(item, "");
        const image = size ? pickImage(item, size) : undefined;
        if (!image) {
          continue;
        }

        for (const key of getImageLookupKeys(item)) {
          if (!images.has(key)) {
            images.set(key, image);
          }
        }
      }
    }
  }

  return images;
}

function pickFallbackImage(item: IikoMenuItem, title: string, imageFallbacks?: Map<string, string>): string | undefined {
  if (!imageFallbacks || imageFallbacks.size === 0) {
    return undefined;
  }

  for (const key of getImageLookupKeys(item, title)) {
    const image = imageFallbacks.get(key);
    if (image) {
      return image;
    }
  }

  return undefined;
}

function mapIikoMenu(
  payload: IikoExternalMenu,
  organizationId: string,
  imageFallbacks?: Map<string, string>
): { categories: DeliveryMenuCategory[]; dishes: DeliveryMenuDish[] } {
  const sourceCategories = payload.itemGroups || payload.itemCategories || [];
  const categories: DeliveryMenuCategory[] = [];
  const dishes: DeliveryMenuDish[] = [];
  const seenDishKeys = new Set<string>();
  const categoryNameToId = new Map<string, string>();
  const usedCategoryIds = new Set<string>();

  for (const [categoryIndex, category] of sourceCategories.entries()) {
    if (category.isHidden === true) {
      continue;
    }

    const categoryName = (category.name || "Menu").trim() || "Menu";
    let categoryId = category.id || categoryNameToId.get(categoryName);

    if (!categoryId) {
      const baseCategoryId = normalizeCategoryId(categoryName);
      categoryId = baseCategoryId;
      let suffix = 2;
      while (usedCategoryIds.has(categoryId)) {
        categoryId = `${baseCategoryId}-${suffix}`;
        suffix += 1;
      }
    }

    usedCategoryIds.add(categoryId);
    categoryNameToId.set(categoryName, categoryId);
    categories.push({
      id: categoryId,
      label: toLocalized(categoryName),
      order: categoryIndex,
      isAvailable: true,
    });

    for (const item of category.items || []) {
      if (item.isHidden === true) {
        continue;
      }

      const dishName = (item.name || "").trim();
      if (!dishName) {
        continue;
      }

      const size = pickSize(item, organizationId);
      if (!size) {
        continue;
      }

      const price = pickPrice(size, organizationId);

      const normalizedSizeName = (size.sizeName || "").trim();
      const title =
        normalizedSizeName && !normalizeText(dishName).includes(normalizeText(normalizedSizeName))
          ? `${dishName} ${normalizedSizeName}`
          : dishName;
      const dishKey = `${categoryId}:${normalizeText(title)}:${price || "no-price"}`;

      if (seenDishKeys.has(dishKey)) {
        continue;
      }

      seenDishKeys.add(dishKey);
      const description = (item.description || "").trim();

      dishes.push({
        id: item.id || item.itemId || item.sku || `${categoryId}-${normalizeCategoryId(title)}`,
        title: toLocalized(title),
        ...(typeof price === "number" ? { price } : {}),
        categoryId,
        categoryLabel: toLocalized(categoryName),
        description: description ? toLocalized(description) : undefined,
        image: pickImage(item, size) || pickFallbackImage(item, title, imageFallbacks),
        weight: formatWeight(size),
        badges: getDishBadges(item),
        isAvailable: true,
      });
    }
  }

  const firstImageDishIndex = dishes.findIndex((dish) => Boolean(dish.image));
  if (firstImageDishIndex >= 0) {
    dishes[firstImageDishIndex] = { ...dishes[firstImageDishIndex], featured: true };
  }

  return { categories, dishes };
}

async function parseJsonOrThrow<T>(response: Response, endpoint: string): Promise<T> {
  const body = await response.text();
  const parsed = body ? JSON.parse(body) : null;

  if (!response.ok) {
    const message = typeof parsed?.errorDescription === "string"
      ? parsed.errorDescription
      : typeof parsed?.message === "string"
        ? parsed.message
        : body || response.statusText;
    throw new Error(`iiko request failed (${endpoint}): ${response.status} ${message}`);
  }

  return parsed as T;
}

async function iikoPost<T>(endpoint: string, body: Record<string, unknown>, token?: string): Promise<T> {
  const response = await fetch(new URL(endpoint, IIKO_API_HOST).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  return parseJsonOrThrow<T>(response, endpoint);
}

async function loginToIiko(): Promise<string | null> {
  if (!IIKO_API_LOGIN) {
    return null;
  }

  const payload = await iikoPost<IikoAccessTokenResponse>("/api/1/access_token", {
    apiLogin: IIKO_API_LOGIN,
  });

  return payload.token || null;
}

async function resolveOrganizationId(token: string, nameHint?: string): Promise<string | null> {
  if (IIKO_ORGANIZATION_ID) {
    return IIKO_ORGANIZATION_ID;
  }

  const payload = await iikoPost<IikoOrganizationsResponse>(
    "/api/1/organizations",
    {
      returnAdditionalInfo: false,
      includeDisabled: false,
    },
    token
  );
  const organizations = payload.organizations || [];
  const hintedOrganization = findBestNameMatch(organizations, nameHint || "");
  if (hintedOrganization?.id) {
    return hintedOrganization.id;
  }

  const activeOrganizations = organizations.filter((organization) => organization.isActive !== false && organization.id);

  if (activeOrganizations.length === 1) {
    return activeOrganizations[0].id || null;
  }

  if (organizations.length > 1) {
    console.warn("[iiko] Multiple organizations returned. Set IIKO_ORGANIZATION_ID to avoid guessing.");
  }

  return organizations.length === 1 ? organizations[0].id || null : null;
}

async function resolveMenuSettings(
  token: string,
  nameHint?: string
): Promise<{
  externalMenuId: string | null;
  externalMenuName?: string;
  imageFallbackMenuIds: string[];
  priceCategoryId?: string;
}> {
  const payload = await iikoPost<IikoMenusResponse>("/api/2/menu", {}, token);
  const menus = payload.externalMenus || [];
  const priceCategories = payload.priceCategories || [];
  const priceCategoryId =
    IIKO_PRICE_CATEGORY_ID ||
    (priceCategories.length === 1 ? priceCategories[0]?.id : undefined);

  if (IIKO_EXTERNAL_MENU_ID) {
    const selectedMenu = menus.find((menu) => menu.id === IIKO_EXTERNAL_MENU_ID);
    return {
      externalMenuId: IIKO_EXTERNAL_MENU_ID,
      externalMenuName: selectedMenu?.name,
      imageFallbackMenuIds: resolveImageFallbackMenuIds(menus, IIKO_EXTERNAL_MENU_ID),
      priceCategoryId,
    };
  }

  const normalizedHint = nameHint || IIKO_EXTERNAL_MENU_NAME;
  const hintedMenu = IIKO_EXTERNAL_MENU_NAME
    ? findBestNameMatch(menus, IIKO_EXTERNAL_MENU_NAME)
    : normalizedHint
      ? findBestNameMatch(menus, normalizedHint)
      : null;

  if (hintedMenu?.id) {
    return {
      externalMenuId: hintedMenu.id,
      externalMenuName: hintedMenu.name,
      imageFallbackMenuIds: resolveImageFallbackMenuIds(menus, hintedMenu.id),
      priceCategoryId,
    };
  }

  if (menus.length === 1) {
    return {
      externalMenuId: menus[0].id || null,
      externalMenuName: menus[0].name,
      imageFallbackMenuIds: resolveImageFallbackMenuIds(menus, menus[0].id),
      priceCategoryId,
    };
  }

  if (menus.length > 1) {
    console.warn("[iiko] Multiple external menus returned. Set IIKO_EXTERNAL_MENU_ID or IIKO_EXTERNAL_MENU_NAME.");
  }

  if (priceCategories.length > 1 && !IIKO_PRICE_CATEGORY_ID) {
    console.warn("[iiko] Multiple price categories returned. Prices may be missing until IIKO_PRICE_CATEGORY_ID is set.");
  }

  return {
    externalMenuId: null,
    imageFallbackMenuIds: [],
    priceCategoryId,
  };
}

function resolveImageFallbackMenuIds(
  menus: IikoExternalMenuRef[],
  primaryMenuId?: string
): string[] {
  const ids = new Set<string>();

  for (const menuName of IIKO_IMAGE_FALLBACK_MENU_NAMES) {
    const normalizedMenuName = normalizeSearchText(menuName);
    const menu = menus.find(
      (candidate) => normalizeSearchText(candidate.name || "") === normalizedMenuName
    );
    if (menu?.id && menu.id !== primaryMenuId) {
      ids.add(menu.id);
    }
  }

  return Array.from(ids);
}

function getMainGoshtMenuHint(branchName?: string, projectName?: string): string {
  const normalized = normalizeSearchText(`${branchName || ""} ${projectName || ""}`);

  if (normalized.includes("west")) {
    return "Gosht West";
  }

  return "Gosht";
}

export function getIikoMainGoshtHints(branchName?: string, projectName?: string): IikoDeliveryMenuOptions {
  return {
    organizationNameHint: branchName || projectName,
    externalMenuNameHint: getMainGoshtMenuHint(branchName, projectName),
  };
}

async function loadIikoDeliveryMenu(
  options: IikoDeliveryMenuOptions
): Promise<IikoDeliveryMenuResult | null> {
  try {
    const token = await loginToIiko();
    if (!token) {
      return null;
    }

    const [organizationId, menuSettings] = await Promise.all([
      resolveOrganizationId(token, options.organizationNameHint),
      resolveMenuSettings(token, options.externalMenuNameHint),
    ]);
    const externalMenuId = menuSettings.externalMenuId;

    if (!organizationId || !externalMenuId) {
      return null;
    }

    const menuPayload = await iikoPost<IikoExternalMenu>(
      "/api/2/menu/by_id",
      {
        externalMenuId,
        organizationIds: [organizationId],
        ...(menuSettings.priceCategoryId ? { priceCategoryId: menuSettings.priceCategoryId } : {}),
        version: 4,
        language: IIKO_MENU_LANGUAGE,
      },
      token
    );
    let mappedMenu = mapIikoMenu(menuPayload, organizationId);

    if (mappedMenu.dishes.some((dish) => !dish.image) && menuSettings.imageFallbackMenuIds.length > 0) {
      const fallbackResults = await Promise.allSettled(
        menuSettings.imageFallbackMenuIds.map((fallbackMenuId) =>
          iikoPost<IikoExternalMenu>(
            "/api/2/menu/by_id",
            {
              externalMenuId: fallbackMenuId,
              organizationIds: [organizationId],
              ...(menuSettings.priceCategoryId ? { priceCategoryId: menuSettings.priceCategoryId } : {}),
              version: 4,
              language: IIKO_MENU_LANGUAGE,
            },
            token
          )
        )
      );
      const fallbackPayloads = fallbackResults
        .filter((result): result is PromiseFulfilledResult<IikoExternalMenu> => result.status === "fulfilled")
        .map((result) => result.value);
      const imageFallbacks = buildImageFallbackMap(fallbackPayloads);

      if (imageFallbacks.size > 0) {
        mappedMenu = mapIikoMenu(menuPayload, organizationId, imageFallbacks);
      }
    }

    if (mappedMenu.dishes.length === 0) {
      return null;
    }

    return {
      categories: mappedMenu.categories,
      dishes: mappedMenu.dishes,
      currencyCode: "UZS",
      organizationId,
      externalMenuId,
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`[iiko] Menu request failed (${errorName}).`);
    return null;
  }
}

type IikoMenuCacheEntry = {
  expiresAt: number;
  promise: Promise<IikoDeliveryMenuResult | null>;
};

const MENU_CACHE_TTL_MS = 5 * 60 * 1000;
const MENU_FAILURE_CACHE_TTL_MS = 30 * 1000;
const menuCache = new Map<string, IikoMenuCacheEntry>();

export function getIikoDeliveryMenu(
  options: IikoDeliveryMenuOptions = {}
): Promise<IikoDeliveryMenuResult | null> {
  if (!IIKO_API_LOGIN) {
    return Promise.resolve(null);
  }

  const cacheKey = JSON.stringify({
    options,
    organizationId: IIKO_ORGANIZATION_ID,
    externalMenuId: IIKO_EXTERNAL_MENU_ID,
    externalMenuName: IIKO_EXTERNAL_MENU_NAME,
    priceCategoryId: IIKO_PRICE_CATEGORY_ID,
    language: IIKO_MENU_LANGUAGE,
    imageFallbackMenus: IIKO_IMAGE_FALLBACK_MENU_NAMES,
  });
  const now = Date.now();
  const cached = menuCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = loadIikoDeliveryMenu(options);
  const entry: IikoMenuCacheEntry = {
    expiresAt: now + MENU_CACHE_TTL_MS,
    promise,
  };
  menuCache.set(cacheKey, entry);

  void promise.then((result) => {
    if (!result && menuCache.get(cacheKey) === entry) {
      entry.expiresAt = Date.now() + MENU_FAILURE_CACHE_TTL_MS;
    }
  });

  return promise;
}
