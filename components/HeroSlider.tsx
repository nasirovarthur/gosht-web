import HeroSliderClient from "./HeroSliderClient";
import { getHeroSlides } from "@/lib/getHeroSlides";
import { muqimiyOpeningSlide } from "@/lib/muqimiyOpeningSlide";
import type { LangCode } from "@/types/i18n";

export default async function HeroSlider({ lang }: { lang: LangCode }) {
  const slides = [muqimiyOpeningSlide(lang), ...await getHeroSlides()];

  return <HeroSliderClient slides={slides} />;
}
