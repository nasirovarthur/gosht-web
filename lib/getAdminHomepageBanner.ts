import "server-only";
import type { LangCode, Localized } from "@/types/i18n";

type AdminHomepageBanner = {
  id: string;
  subtitle: Localized;
  title: Localized;
  description: Localized;
  buttonText: Localized;
  customButtonUrl: string;
  imageFocus: number;
  image: string;
};

const editorialOverlay = "linear-gradient(to bottom, rgb(0 0 0 / 10%), transparent 40%, rgb(0 0 0 / 30%) 67%, rgb(13 13 13 / 98%))";

function isLocalized(value: unknown): value is Localized {
  return Boolean(value && typeof value === "object" && ["uz", "ru", "en"].every(
    (lang) => typeof (value as Record<string, unknown>)[lang] === "string",
  ));
}

export async function getAdminHomepageBanner(lang: LangCode) {
  const base = process.env.GOSHT_ADMIN_API_URL?.trim().replace(/\/+$/, "");
  if (!base) return null;

  try {
    const response = await fetch(base + "/public/homepage-banner", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const { banner } = await response.json() as { banner?: AdminHomepageBanner | null };
    if (!banner || typeof banner.id !== "string"
      || !isLocalized(banner.title) || !isLocalized(banner.subtitle)
      || !isLocalized(banner.description) || !isLocalized(banner.buttonText)
      || typeof banner.customButtonUrl !== "string"
      || !/^\/(?!\/)(?:[a-z0-9-]+\/)*[a-z0-9-]+$/i.test(banner.customButtonUrl)
      || typeof banner.image !== "string"
      || !/^\/media\/uploads\/events\/[a-f0-9]{64}\.(?:jpg|png|webp)$/.test(banner.image)
      || !Number.isInteger(banner.imageFocus) || banner.imageFocus < 0 || banner.imageFocus > 100) {
      return null;
    }

    return {
      id: banner.id,
      subtitle: banner.subtitle,
      title: banner.title,
      description: banner.description,
      buttonText: banner.buttonText,
      showButton: true,
      buttonMode: "custom" as const,
      buttonUrl: `/${lang}${banner.customButtonUrl.replace(/^\/(?:ru|uz|en)(?=\/)/, "")}`,
      image: new URL(banner.image, process.env.GOSHT_ADMIN_PUBLIC_URL || "https://admin.gosht.uz").href,
      imagePosition: `${banner.imageFocus}% center`,
      imageOverlay: editorialOverlay,
    };
  } catch {
    return null;
  }
}
