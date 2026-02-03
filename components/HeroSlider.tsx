import { client, urlFor } from "@/lib/sanity"; // Обрати внимание на @/lib
import HeroSliderClient from "./HeroSliderClient";

async function getData() {
  const query = `
    *[_type == "heroSlide"] | order(_createdAt asc) {
      _id,
      title,
      subtitle,
      description,
      buttonText,
      showButton,
      image
    }
  `;
  const data = await client.fetch(query);
  return data;
}

export default async function HeroSlider() {
  const rawSlides = await getData();

  const slides = rawSlides.map((slide: any) => ({
    id: slide._id,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    buttonText: slide.buttonText || "ПОДРОБНЕЕ",
    showButton: slide.showButton !== false,
    image: urlFor(slide.image).url(),
  }));

  // Если слайдов в базе нет — не ломаем сайт, а ничего не показываем (или можно заглушку)
  if (!slides.length) return null;

  return <HeroSliderClient slides={slides} />;
}