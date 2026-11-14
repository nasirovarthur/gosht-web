import type { LangCode } from "@/types/i18n";

export function muqimiyOpeningSlide(lang: LangCode) {
  return {
    id: "gosht-muqimiy-opening",
    subtitle: {
      uz: "Biz ochildik",
      ru: "Мы открылись",
      en: "Now open",
    },
    title: {
      uz: "Gōsht Muqimiy",
      ru: "Gōsht Muqimiy",
      en: "Gōsht Muqimiy",
    },
    description: {
      uz: "Grilda pishirilgan steyklar, bolalar maydonchasi va banket zali.",
      ru: "Стейки на гриле, детская площадка и банкетный зал.",
      en: "Grilled steaks, a kids’ play area and a banquet hall.",
    },
    buttonText: {
      uz: "Restoran haqida",
      ru: "О ресторане",
      en: "About the restaurant",
    },
    showButton: true,
    buttonMode: "custom" as const,
    buttonUrl: `/${lang}/restaurants/gosht-muqimiy`,
    image: "/muqimiy-opening.jpg",
    imagePosition: "23% center",
    imageOverlay: "linear-gradient(to bottom, rgb(0 0 0 / 10%), transparent 40%, rgb(0 0 0 / 30%) 67%, rgb(13 13 13 / 98%))",
  };
}
