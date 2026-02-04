import HeroSliderClient from "./HeroSliderClient";
import { getHeroSlides } from "@/lib/getHeroSlides";

export default async function HeroSlider() {
  const slides = await getHeroSlides();

  // Если слайдов в базе нет — не ломаем сайт, а ничего не показываем (или можно заглушку)
  if (!slides.length) return null;

  return <HeroSliderClient slides={slides} />;
}