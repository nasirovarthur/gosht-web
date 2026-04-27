import "server-only";
import https from "node:https";
import type { DeliveryMenuDish, DeliveryMenuDishBadge } from "@/types/deliveryMenu";

const TOAST_API_HOST = process.env.TOAST_API_HOST || "https://ws-api.toasttab.com";
const TOAST_CLIENT_ID = process.env.TOAST_CLIENT_ID;
const TOAST_CLIENT_SECRET = process.env.TOAST_CLIENT_SECRET;
const TOAST_USER_ACCESS_TYPE = process.env.TOAST_USER_ACCESS_TYPE || "TOAST_MACHINE_CLIENT";
const TOAST_RESTAURANT_GUID = process.env.TOAST_RESTAURANT_GUID;
const TOAST_RESTAURANT_NAME_HINT = (process.env.TOAST_RESTAURANT_NAME || "gosht").toLowerCase();

type ToastAuthResponse = {
  token?: {
    accessToken?: string;
  };
};

type ToastRestaurant = {
  restaurantGuid?: string;
  restaurantName?: string;
};

type ToastMenuItem = {
  guid?: string;
  name?: string;
  price?: number;
  image?: string;
  images?: Array<string | { image?: string; url?: string; imageUrl?: string }>;
  visibility?: string[];
  weight?: number | null;
  weightUnitOfMeasure?: string | null;
};

type ToastMenuGroup = {
  name?: string;
  menuItems?: ToastMenuItem[];
  menuGroups?: ToastMenuGroup[];
};

type ToastMenu = {
  name?: string;
  menuGroups?: ToastMenuGroup[];
};

type ToastMenusResponse = {
  menus?: ToastMenu[];
};

type DnsOverHttpsResponse = {
  Answer?: Array<{
    type?: number;
    data?: string;
  }>;
};

export type ToastDeliveryMenuResult = {
  dishes: DeliveryMenuDish[];
  currencyCode: "USD";
  restaurantGuid: string;
};

const DISH_BADGES_BY_NAME = new Map<string, DeliveryMenuDishBadge[]>([
  ["gosht salad", ["chef", "spicy"]],
  ["big green salad", ["veg"]],
  ["greek", ["veg"]],
  ["greek salad", ["veg"]],
  ["vegan burger", ["veg"]],
  ["buffalo chicken wings", ["spicy"]],
  ["fried pelmeni", ["chef"]],
  ["salad josper", ["spicy"]],
  ["josper salad", ["spicy"]],
  ["tom yum", ["spicy"]],
  ["tom yum soup", ["spicy"]],
  ["dukkah meat", ["chef"]],
  ["bali bey", ["chef"]],
  ["striped bass in shiso sauce", ["chef"]],
  ["branzino in shiso sauce", ["chef"]],
  ["lamb ribs", ["spicy"]],
  ["chili chicken", ["spicy"]],
  ["new york burger", ["spicy"]],
  ["steak burger", ["chef"]],
]);

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

function normalizeDishName(value: string): string {
  return value
    .toLowerCase()
    .replace(/gōsht/g, "gosht")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function getDishBadges(dishName: string): DeliveryMenuDishBadge[] | undefined {
  const badges = DISH_BADGES_BY_NAME.get(normalizeDishName(dishName));
  return badges?.length ? badges : undefined;
}

function isVisibleForOnlineOrdering(item: ToastMenuItem): boolean {
  if (!Array.isArray(item.visibility)) {
    return true;
  }

  return item.visibility.includes("TOAST_ONLINE_ORDERING") || item.visibility.includes("ORDERING_PARTNERS");
}

function normalizeWeightUnit(unit: string | null | undefined): string {
  switch ((unit || "").toUpperCase()) {
    case "GRAM":
    case "GRAMS":
      return "g";
    case "KILOGRAM":
    case "KILOGRAMS":
      return "kg";
    case "OUNCE":
    case "OUNCES":
      return "oz";
    case "POUND":
    case "POUNDS":
      return "lb";
    default:
      return "";
  }
}

function formatWeight(weight: number | null | undefined, unit: string | null | undefined): string | undefined {
  if (typeof weight !== "number" || Number.isNaN(weight) || weight <= 0) {
    return undefined;
  }

  const formattedWeight = Number.isInteger(weight) ? String(weight) : weight.toFixed(1).replace(/\.0$/, "");
  const formattedUnit = normalizeWeightUnit(unit);
  return formattedUnit ? `${formattedWeight} ${formattedUnit}` : formattedWeight;
}

function pickImage(item: ToastMenuItem): string | undefined {
  if (typeof item.image === "string" && item.image.trim().length > 0) {
    return item.image;
  }

  for (const entry of item.images || []) {
    if (typeof entry === "string" && entry.trim().length > 0) {
      return entry;
    }

    if (entry && typeof entry === "object") {
      const candidate = entry.image || entry.url || entry.imageUrl;
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }

  return undefined;
}

function collectMenuGroups(groups: ToastMenuGroup[] | undefined, acc: ToastMenuGroup[] = []): ToastMenuGroup[] {
  if (!Array.isArray(groups) || groups.length === 0) {
    return acc;
  }

  for (const group of groups) {
    acc.push(group);
    collectMenuGroups(group.menuGroups, acc);
  }

  return acc;
}

function pickRestaurantGuid(restaurants: ToastRestaurant[]): string | null {
  if (TOAST_RESTAURANT_GUID) {
    return TOAST_RESTAURANT_GUID;
  }

  const hintedRestaurant = restaurants.find((restaurant) =>
    (restaurant.restaurantName || "").toLowerCase().includes(TOAST_RESTAURANT_NAME_HINT)
  );

  return hintedRestaurant?.restaurantGuid || restaurants[0]?.restaurantGuid || null;
}

function shouldUseNetworkFallback(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  return /fetch failed|ENOTFOUND|UND_ERR_CONNECT_TIMEOUT|timeout|Could not resolve host/i.test(message);
}

function collectResponseBody(response: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    response.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    response.on("error", reject);
  });
}

async function resolveHostByDoh(hostname: string): Promise<string[]> {
  try {
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const response = await fetch(dnsUrl, {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as DnsOverHttpsResponse;
    const ips = (payload.Answer || [])
      .filter((record) => record.type === 1 && typeof record.data === "string")
      .map((record) => record.data as string)
      .filter((value) => /^[0-9.]+$/.test(value));

    return Array.from(new Set(ips));
  } catch {
    return [];
  }
}

async function requestViaPinnedIp(
  url: URL,
  init: RequestInit,
  ipAddress: string
): Promise<Response> {
  const method = init.method || "GET";
  const headers = new Headers(init.headers || {});
  const body = typeof init.body === "string" ? init.body : undefined;

  const nodeResponse = await new Promise<import("node:http").IncomingMessage>((resolve, reject) => {
    const request = https.request(
      {
        protocol: "https:",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: Object.fromEntries(headers.entries()),
        servername: url.hostname,
        lookup: (_hostname, _options, callback) => {
          callback(null, ipAddress, 4);
        },
      },
      resolve
    );

    request.setTimeout(20_000, () => {
      request.destroy(new Error("Toast request timeout"));
    });

    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });

  const responseBody = await collectResponseBody(nodeResponse);
  const responseHeaders = new Headers();
  for (const [headerName, headerValue] of Object.entries(nodeResponse.headers)) {
    if (!headerValue) continue;
    const value = Array.isArray(headerValue) ? headerValue.join(", ") : headerValue;
    responseHeaders.set(headerName, value);
  }

  return new Response(responseBody, {
    status: nodeResponse.statusCode || 500,
    statusText: nodeResponse.statusMessage || "Pinned IP request failed",
    headers: responseHeaders,
  });
}

async function toastFetch(endpoint: string, init: RequestInit): Promise<Response> {
  const url = new URL(endpoint, TOAST_API_HOST);
  try {
    return await fetch(url.toString(), init);
  } catch (error) {
    if (!shouldUseNetworkFallback(error)) {
      throw error;
    }

    const fallbackIps = await resolveHostByDoh(url.hostname);
    if (fallbackIps.length === 0) {
      throw error;
    }

    let lastError: unknown = error;
    for (const ipAddress of fallbackIps) {
      try {
        return await requestViaPinnedIp(url, init, ipAddress);
      } catch (pinnedIpError) {
        lastError = pinnedIpError;
      }
    }

    throw lastError;
  }
}

async function parseJsonOrThrow<T>(response: Response, endpoint: string): Promise<T> {
  const body = await response.text();
  const parsed = body ? JSON.parse(body) : null;

  if (!response.ok) {
    const message = typeof parsed?.message === "string" ? parsed.message : body || response.statusText;
    throw new Error(`Toast request failed (${endpoint}): ${response.status} ${message}`);
  }

  return parsed as T;
}

async function loginToToast(): Promise<string> {
  if (!TOAST_CLIENT_ID || !TOAST_CLIENT_SECRET) {
    throw new Error("Toast credentials are missing. Set TOAST_CLIENT_ID and TOAST_CLIENT_SECRET.");
  }

  const endpoint = "/authentication/v1/authentication/login";
  const response = await toastFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: TOAST_CLIENT_ID,
      clientSecret: TOAST_CLIENT_SECRET,
      userAccessType: TOAST_USER_ACCESS_TYPE,
    }),
    cache: "no-store",
  });

  const payload = await parseJsonOrThrow<ToastAuthResponse>(response, endpoint);
  const accessToken = payload.token?.accessToken;
  if (!accessToken) {
    throw new Error("Toast auth succeeded but access token is missing in response.");
  }

  return accessToken;
}

async function getRestaurantGuid(accessToken: string): Promise<string> {
  const endpoint = "/partners/v1/restaurants";
  const response = await toastFetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 300 },
  });

  const restaurants = await parseJsonOrThrow<ToastRestaurant[]>(response, endpoint);
  const restaurantGuid = pickRestaurantGuid(restaurants || []);
  if (!restaurantGuid) {
    throw new Error("Toast restaurants list is empty, cannot resolve restaurantGuid.");
  }

  return restaurantGuid;
}

function mapToastMenusToDishes(payload: ToastMenusResponse): DeliveryMenuDish[] {
  const dishes: DeliveryMenuDish[] = [];
  const seenDishIds = new Set<string>();
  const seenDishKeys = new Set<string>();
  const usedCategoryIds = new Set<string>();
  const categoryNameToId = new Map<string, string>();

  for (const menu of payload.menus || []) {
    const groups = collectMenuGroups(menu.menuGroups);
    for (const group of groups) {
      const rawCategoryName = (group.name || menu.name || "Menu").trim() || "Menu";
      let categoryId = categoryNameToId.get(rawCategoryName);
      if (!categoryId) {
        const baseCategoryId = normalizeCategoryId(rawCategoryName);
        categoryId = baseCategoryId;
        let suffix = 2;
        while (usedCategoryIds.has(categoryId)) {
          categoryId = `${baseCategoryId}-${suffix}`;
          suffix += 1;
        }
        usedCategoryIds.add(categoryId);
        categoryNameToId.set(rawCategoryName, categoryId);
      }

      for (const item of group.menuItems || []) {
        if (!isVisibleForOnlineOrdering(item)) {
          continue;
        }

        const dishName = (item.name || "").trim();
        const price = typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
        if (!dishName || price <= 0) {
          continue;
        }

        const id = item.guid || `${categoryId}-${dishName.toLowerCase().replace(/\s+/g, "-")}`;
        if (seenDishIds.has(id)) {
          continue;
        }

        const dishKey = `${categoryId}:${normalizeDishName(dishName)}:${price}`;
        if (seenDishKeys.has(dishKey)) {
          continue;
        }

        seenDishIds.add(id);
        seenDishKeys.add(dishKey);
        dishes.push({
          id,
          title: toLocalized(dishName),
          price,
          categoryId,
          categoryLabel: toLocalized(rawCategoryName),
          image: pickImage(item),
          weight: formatWeight(item.weight, item.weightUnitOfMeasure),
          badges: getDishBadges(dishName),
        });
      }
    }
  }

  if (dishes[0]) {
    dishes[0] = { ...dishes[0], featured: true };
  }

  return dishes;
}

export async function getToastDeliveryMenu(): Promise<ToastDeliveryMenuResult | null> {
  if (!TOAST_CLIENT_ID || !TOAST_CLIENT_SECRET) {
    return null;
  }

  try {
    const accessToken = await loginToToast();
    const restaurantGuid = await getRestaurantGuid(accessToken);
    const endpoint = "/menus/v2/menus";
    const response = await toastFetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Toast-Restaurant-External-ID": restaurantGuid,
      },
      next: { revalidate: 300 },
    });
    const menusPayload = await parseJsonOrThrow<ToastMenusResponse>(response, endpoint);
    const dishes = mapToastMenusToDishes(menusPayload);

    if (dishes.length === 0) {
      return null;
    }

    return {
      dishes,
      currencyCode: "USD",
      restaurantGuid,
    };
  } catch (error) {
    console.error("[toast] Failed to load menu:", error);
    return null;
  }
}
