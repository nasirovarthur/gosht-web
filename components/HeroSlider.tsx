import HeroSliderClient from "./HeroSliderClient";
import { getHeroSlides } from "@/lib/getHeroSlides";
import { muqimiyOpeningSlide } from "@/lib/muqimiyOpeningSlide";
import type { LangCode } from "@/types/i18n";

export default async function HeroSlider({ lang }: { lang: LangCode }) {
  const managedSlides = await getHeroSlides();
  const slides = [
    ...managedSlides.filter((slide) => slide.showFirst),
    muqimiyOpeningSlide(lang),
    ...managedSlides.filter((slide) => !slide.showFirst),
  ];

  return <HeroSliderClient slides={slides} />;
}
