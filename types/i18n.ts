// ========================
// Shared i18n types and utilities for the entire app
// ========================

export type LangCode = "uz" | "ru" | "en";

/** All three languages are required */
export type Localized = {
  uz: string;
  ru: string;
  en: string;
};

/** Languages are optional (used for Sanity data that may be partially translated) */
export type LocalizedOptional = {
  uz?: string;
  ru?: string;
  en?: string;
};

/**
 * Pick the correct localized string for the current language.
 * Falls back: lang → uz → ru → en → ""
 */
export function pickLocalized(
  value: Localized | LocalizedOptional | undefined | null,
  lang: LangCode
): string {
  if (!value) return "";
  return value[lang] || value.uz || value.ru || value.en || "";
}

// ========================
// NavItem type (used by Header, ClientHeader, RootLayoutClient, layout)
// ========================

export type NavItem = {
  _key: string;
  label: Localized;
  href: string | null;
  openInNewTab?: boolean;
};

// ========================
// Centralized UI translations
// ========================

export const translations = {
  header: {
    menu: { uz: "MENU", ru: "МЕНЮ", en: "MENU" } as Localized,
    close: { uz: "YOPISH", ru: "ЗАКРЫТЬ", en: "CLOSE" } as Localized,
  },

  footer: {
    title: { uz: "XABARDOR BO'LING", ru: "БУДЬТЕ В КУРСЕ", en: "STAY INFORMED" } as Localized,
    subtitle: {
      uz: "Gastronomik yangiliklar, aksiyalar va foydali tavsiyalar",
      ru: "Гастрономические новости, советы, акции и многое другое",
      en: "Gastronomic news, tips, promos, and more",
    } as Localized,
    feedback: { uz: "QAYTA ALOQA", ru: "ОБРАТНАЯ СВЯЗЬ", en: "FEEDBACK" } as Localized,
    language: { uz: "TIL", ru: "ЯЗЫК", en: "LANGUAGE" } as Localized,
    rights: {
      uz: "© GOSHT Group. Barcha huquqlar himoyalangan",
      ru: "© GOSHT Group. Все права защищены",
      en: "© GOSHT Group. All rights reserved",
    } as Localized,
    madeBy: {
      uz: "Реализовано Артуром",
      ru: "Реализовано Артуром",
      en: "Реализовано Артуром",
    } as Localized,
  },

  restaurants: {
    tashkent: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" } as Localized,
    banquet: { uz: "Banket zali", ru: "Банкетный зал", en: "Banquet Hall" } as Localized,
    playground: { uz: "Bolalar maydonchasi", ru: "Детская площадка", en: "Playground" } as Localized,
    emptyList: { uz: "Ro'yxat bo'sh", ru: "Список пуст", en: "List is empty" } as Localized,
  },

  restaurantDetail: {
    cuisine: { uz: "OSHXONA", ru: "КУХНЯ", en: "CUISINE" } as Localized,
    averageCheck: { uz: "O'RTACHA CHEK", ru: "СРЕДНИЙ ЧЕК", en: "AVERAGE CHECK" } as Localized,
    addressContacts: {
      uz: "MANZIL VA ALOQA",
      ru: "АДРЕС И КОНТАКТЫ",
      en: "ADDRESS & CONTACTS",
    } as Localized,
    links: { uz: "HAVOLALAR", ru: "ССЫЛКИ", en: "LINKS" } as Localized,
    workingHours: { uz: "Ish vaqti", ru: "Режим работы", en: "Working hours" } as Localized,
    menu: { uz: "Restoran menyusi", ru: "Меню ресторана", en: "Restaurant menu" } as Localized,
    openedYear: { uz: "Ochilgan yil", ru: "Год открытия", en: "Opened in" } as Localized,
    openMap: { uz: "Xaritani ochish", ru: "Открыть карту", en: "Open map" } as Localized,
    chefTitle: { uz: "OSHPAZ BOSHLIG\u2019I", ru: "ШЕФ-ПОВАР", en: "CHEF" } as Localized,
    chefName: {
      uz: "GOSHT bosh oshpazi",
      ru: "Шеф-повар GOSHT",
      en: "GOSHT Head Chef",
    } as Localized,
    chefDescription: {
      uz: "Mualliflik yondashuvi, mavsumiy mahsulotlar va klassik texnikalar bilan zamonaviy uslub uyg\u2019unligi.",
      ru: "Авторский подход к мясной кухне, сезонные продукты и баланс классических техник с современными подачами.",
      en: "Authorial approach, seasonal products, and a balance of classic techniques with modern presentation.",
    } as Localized,
    aboutFallback: {
      uz: "Bu joyda restoran kontseptsiyasi, atmosferasi va asosiy g\u2019oyasi haqida qisqa tavsif joylashadi.",
      ru: "Здесь размещается краткое описание концепции ресторана, атмосферы и основной идеи.",
      en: "A short description of the restaurant concept, atmosphere, and key idea goes here.",
    } as Localized,
    detailsFallback: {
      uz: "Interyer va servis tafsilotlari, mehmon tajribasi hamda oshxona yondashuvi haqida qo\u2019shimcha ma\u2019lumot.",
      ru: "Дополнительные детали об интерьере, сервисе, опыте гостей и подходе кухни.",
      en: "Additional details about interior, service, guest experience, and the kitchen approach.",
    } as Localized,
    detailsSecondaryFallback: {
      uz: "Taomlar mavsumiy mahsulotlar asosida tayyorlanadi, taqdimot esa zamonaviy uslubda quriladi.",
      ru: "Блюда строятся вокруг сезонных продуктов, а подача выстроена в современном стиле.",
      en: "Dishes are built around seasonal ingredients, with a modern style of presentation.",
    } as Localized,
    extraFallback: {
      uz: "Asosiy menyudan tashqari maxsus takliflar muntazam yangilanadi.",
      ru: "Помимо основного меню, мы регулярно обновляем специальные позиции.",
      en: "In addition to the main menu, special offers are regularly updated.",
    } as Localized,
  },

  groupStory: {
    marquee: { uz: "SINCE 1991", ru: "SINCE 1991", en: "SINCE 1991" } as Localized,
    titleTop: { uz: "GOSHT", ru: "GOSHT", en: "GOSHT" } as Localized,
    titleBottom: { uz: "GROUP", ru: "GROUP", en: "GROUP" } as Localized,
    description: {
      uz: "GOSHT Group hikoyasi birinchi loyihadan boshlandi. Bugun biz har bir filialda oshxona sifati, servis va atmosfera bo\u2019yicha yagona standartni saqlaymiz.",
      ru: "История GOSHT Group началась с первого проекта. Сегодня мы сохраняем единый стандарт кухни, сервиса и атмосферы в каждом филиале.",
      en: "The story of GOSHT Group started with the first concept. Today we keep one standard of cuisine, service, and atmosphere across every branch.",
    } as Localized,
    cta: { uz: "Biz haqimizda", ru: "Подробнее о нас", en: "Learn more" } as Localized,
  },

  footerNav: [
    [
      { uz: "Restoranlar", ru: "Рестораны", en: "Restaurants" },
      { uz: "Xalqaro loyihalar", ru: "Международные проекты", en: "International projects" },
      { uz: "Franshizalar", ru: "Франшизы", en: "Franchises" },
    ],
    [
      { uz: "Hamkorlar", ru: "Партнеры", en: "Partners" },
      { uz: "Sovg'a sertifikatlari", ru: "Подарочные сертификаты", en: "Gift certificates" },
      { uz: "Diskont kartalar", ru: "Дисконтные карты", en: "Discount cards" },
    ],
    [
      { uz: "Voqealar", ru: "События", en: "Events" },
      { uz: "Kompaniya haqida", ru: "О компании", en: "About company" },
      { uz: "Loyihalar", ru: "Проекты", en: "Projects" },
      { uz: "Vakansiyalar", ru: "Вакансии", en: "Jobs" },
      { uz: "Kontaktlar", ru: "Контакты", en: "Contacts" },
    ],
  ] as Localized[][],
} as const;
