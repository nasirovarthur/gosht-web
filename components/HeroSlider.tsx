import HeroSliderClient from "./HeroSliderClient";
import { getHeroSlides } from "@/lib/getHeroSlides";
import { getAdminHomepageBanner } from "@/lib/getAdminHomepageBanner";
import type { LangCode } from "@/types/i18n";

export default async function HeroSlider({ lang }: { lang: LangCode }) {
  const [banner, existingSlides] = await Promise.all([getAdminHomepageBanner(lang), getHeroSlides()]);
  const slides = banner ? [banner, ...existingSlides] : existingSlides;
  if (!slides.length) return null;

  return <HeroSliderClient slides={slides} />;
}
