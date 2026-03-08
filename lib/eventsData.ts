export type LangCode = "uz" | "ru" | "en";

export type Localized = {
  uz: string;
  ru: string;
  en: string;
};

export type EventCategory = "event" | "kids";

export type EventItem = {
  id: string;
  slug: string;
  category: EventCategory;
  title: Localized;
  date: Localized;
  time: Localized;
  branch: Localized;
  image: string;
  description: Localized[];
};

export const eventsData: EventItem[] = [
  {
    id: "e-1",
    slug: "aquamarine-x-jcos",
    category: "event",
    title: {
      uz: "AQUAMARINE X JCOS hamkorlik kechasi",
      ru: "Коллаборация AQUAMARINE X JCOS",
      en: "AQUAMARINE X JCOS Collaboration",
    },
    date: { uz: "12 MART 2026", ru: "12 МАРТА 2026", en: "MARCH 12, 2026" },
    time: { uz: "19:30", ru: "19:30", en: "7:30 PM" },
    branch: { uz: "TOSHKENT CITY", ru: "ТАШКЕНТ CITY", en: "TASHKENT CITY" },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "AQUAMARINE X JCOS hamkorligi doirasida biz maxsus kechki menyuni taqdim etamiz. Mehmonlar uchun bir martalik taom berish estetikasi, tanlangan musiqa va oqshomga mos servis tayyorlandi.",
        ru: "В рамках коллаборации AQUAMARINE X JCOS мы представляем специальное вечернее меню. Для гостей подготовлены авторская подача, тщательно подобранная музыка и сервис, соответствующий формату вечера.",
        en: "As part of the AQUAMARINE X JCOS collaboration, we present a special evening menu. Guests can expect signature plating, curated music, and service tailored to the concept.",
      },
      {
        uz: "Kechaning asosiy g'oyasi — did, atmosfera va muloqotni bir joyda birlashtirish. Har bir kurs bar jamoasi tomonidan mos kokteyl juftligi bilan to'ldiriladi.",
        ru: "Главная идея вечера — объединить вкус, атмосферу и общение в одном пространстве. Каждый курс сопровождается коктейльным пейрингом от барной команды.",
        en: "The main idea of the evening is to merge taste, atmosphere, and conversation. Each course is accompanied by a cocktail pairing by our bar team.",
      },
      {
        uz: "Joylar cheklangan, oldindan bron qilish tavsiya etiladi.",
        ru: "Количество мест ограничено, рекомендуем предварительное бронирование.",
        en: "Seats are limited; early booking is recommended.",
      },
    ],
  },
  {
    id: "e-2",
    slug: "march-8-desserts",
    category: "event",
    title: {
      uz: "8 mart: desertlar va bayramona kayfiyat",
      ru: "8 марта: десерты и праздничное настроение",
      en: "March 8: Desserts and Festive Mood",
    },
    date: { uz: "8 MART 2026", ru: "8 МАРТА 2026", en: "MARCH 8, 2026" },
    time: { uz: "12:00–22:00", ru: "12:00–22:00", en: "12:00 PM–10:00 PM" },
    branch: { uz: "CHILONZOR", ru: "ЧИЛАНЗАР", en: "CHILANZAR" },
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "8 mart kuni filialimizda maxsus desert seti va bayramona serving taqdim etiladi. Menyu bahor kayfiyatini aks ettiruvchi yengil ta'mlardan tuzilgan.",
        ru: "8 марта в нашем филиале действует специальный десертный сет с праздничной подачей. Меню собрано из легких вкусов, передающих весеннее настроение.",
        en: "On March 8, our branch offers a special dessert set with festive presentation. The menu is built around light seasonal flavors.",
      },
      {
        uz: "Mehmonlar uchun foto-zona, compliment ichimliklar va jonli piano setlari rejalashtirilgan.",
        ru: "Для гостей предусмотрены фотозона, комплиментарные напитки и живой piano-сет.",
        en: "Guests will also enjoy a photo zone, complimentary drinks, and a live piano set.",
      },
      {
        uz: "Taklif bir kun amal qiladi.",
        ru: "Предложение действует только один день.",
        en: "This offer is valid for one day only.",
      },
    ],
  },
  {
    id: "e-3",
    slug: "new-cocktail-menu",
    category: "event",
    title: {
      uz: "Yangi kokteyl kartasi va maxsus servis",
      ru: "Новая коктейльная карта и спецсервис",
      en: "New Cocktail Menu and Special Service",
    },
    date: { uz: "6 MART 2026", ru: "6 МАРТА 2026", en: "MARCH 6, 2026" },
    time: { uz: "18:00", ru: "18:00", en: "6:00 PM" },
    branch: { uz: "YUNUSOBOD", ru: "ЮНУСАБАД", en: "YUNUSABAD" },
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Bar jamoasi yangi kokteyl kartasini ishga tushiradi: klassika va mualliflik yo'nalishidagi 12 pozitsiya.",
        ru: "Барная команда запускает новую коктейльную карту: 12 позиций с балансом классики и авторских вкусов.",
        en: "Our bar team launches a new cocktail list with 12 items balancing classics and signature twists.",
      },
      {
        uz: "Kechada mehmonlar uchun tasting format ham ishlaydi.",
        ru: "В течение вечера для гостей доступен tasting-формат подачи.",
        en: "A tasting format will be available throughout the evening.",
      },
    ],
  },
  {
    id: "e-4",
    slug: "kids-cooking-class",
    category: "kids",
    title: {
      uz: "Bolalar uchun oshpazlik master-klassi",
      ru: "Детский кулинарный мастер-класс",
      en: "Kids Culinary Masterclass",
    },
    date: { uz: "15 MART 2026", ru: "15 МАРТА 2026", en: "MARCH 15, 2026" },
    time: { uz: "11:00", ru: "11:00", en: "11:00 AM" },
    branch: { uz: "MIROBOD", ru: "МИРАБАД", en: "MIRABAD" },
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Bolalar uchun interaktiv master-klass: mini pizza, bezak va oshxona xavfsizligi asoslari.",
        ru: "Интерактивный мастер-класс для детей: мини-пицца, декор и основы безопасной работы на кухне.",
        en: "Interactive workshop for kids: mini pizza, decoration, and basic kitchen safety.",
      },
    ],
  },
  {
    id: "e-5",
    slug: "chefs-table-seasonal",
    category: "event",
    title: {
      uz: "Chef’s Table: mavsumiy degustatsiya",
      ru: "Chef’s Table: сезонная дегустация",
      en: "Chef’s Table: Seasonal Tasting",
    },
    date: { uz: "18 MART 2026", ru: "18 МАРТА 2026", en: "MARCH 18, 2026" },
    time: { uz: "20:00", ru: "20:00", en: "8:00 PM" },
    branch: { uz: "TOSHKENT CITY", ru: "ТАШКЕНТ CITY", en: "TASHKENT CITY" },
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Chef’s Table formati doirasida 6 kursli degustatsiya va shaxsiy taqdimot.",
        ru: "Формат Chef’s Table: дегустация из 6 курсов и персональная подача от шефа.",
        en: "Chef’s Table format: a 6-course tasting with personal presentation by the chef.",
      },
    ],
  },
  {
    id: "e-6",
    slug: "family-sunday-burgers",
    category: "kids",
    title: {
      uz: "Oilaviy yakshanba: mini-burgerlar",
      ru: "Семейное воскресенье: мини-бургеры",
      en: "Family Sunday: Mini Burgers",
    },
    date: { uz: "20 MART 2026", ru: "20 МАРТА 2026", en: "MARCH 20, 2026" },
    time: { uz: "13:00", ru: "13:00", en: "1:00 PM" },
    branch: { uz: "YUNUSOBOD", ru: "ЮНУСАБАД", en: "YUNUSABAD" },
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Yakshanba kuni oilaviy set va bolalar uchun maxsus mini-burger konstruktor menyusi.",
        ru: "По воскресеньям — семейный сет и детское меню с мини-бургер конструктором.",
        en: "Sunday family set with a kids mini-burger builder menu.",
      },
    ],
  },
  {
    id: "e-7",
    slug: "live-jazz-night",
    category: "event",
    title: {
      uz: "Live Jazz va signature-menu",
      ru: "Live Jazz и авторское меню",
      en: "Live Jazz and Signature Menu",
    },
    date: { uz: "22 MART 2026", ru: "22 МАРТА 2026", en: "MARCH 22, 2026" },
    time: { uz: "20:30", ru: "20:30", en: "8:30 PM" },
    branch: { uz: "CHILONZOR", ru: "ЧИЛАНЗАР", en: "CHILANZAR" },
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Jonli jazz kechasi va maxsus mualliflik menyusi.",
        ru: "Вечер живого джаза и специальное авторское меню.",
        en: "Live jazz night with a dedicated signature menu.",
      },
    ],
  },
  {
    id: "e-8",
    slug: "spring-brunch",
    category: "event",
    title: {
      uz: "Bahorgi brunch maxsus taklifi",
      ru: "Весенний brunch special",
      en: "Spring Brunch Special",
    },
    date: { uz: "25 MART 2026", ru: "25 МАРТА 2026", en: "MARCH 25, 2026" },
    time: { uz: "10:00–15:00", ru: "10:00–15:00", en: "10:00 AM–3:00 PM" },
    branch: { uz: "MIROBOD", ru: "МИРАБАД", en: "MIRABAD" },
    image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Bahorgi brunch menyusi: seasonal egg dishes, dessert trolley va sparkling pairings.",
        ru: "Весеннее brunch-меню: сезонные блюда из яиц, dessert trolley и sparkling pairings.",
        en: "Spring brunch menu with seasonal egg dishes, dessert trolley, and sparkling pairings.",
      },
    ],
  },
  {
    id: "e-9",
    slug: "kids-dessert-studio",
    category: "kids",
    title: {
      uz: "Bolalar bayrami: shirinlik studiyasi",
      ru: "Детский праздник: студия десертов",
      en: "Kids Party: Dessert Studio",
    },
    date: { uz: "27 MART 2026", ru: "27 МАРТА 2026", en: "MARCH 27, 2026" },
    time: { uz: "12:00", ru: "12:00", en: "12:00 PM" },
    branch: { uz: "TOSHKENT CITY", ru: "ТАШКЕНТ CITY", en: "TASHKENT CITY" },
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Bolalar uchun dessert studio: bezak, taqdimot va sovg'a setlari.",
        ru: "Dessert studio для детей: декор, подача и подарочные наборы.",
        en: "Dessert studio for kids with decoration, plating, and gift sets.",
      },
    ],
  },
  {
    id: "e-10",
    slug: "wine-pairing-night",
    category: "event",
    title: {
      uz: "Wine Pairing kechasi",
      ru: "Вечер Wine Pairing",
      en: "Wine Pairing Night",
    },
    date: { uz: "29 MART 2026", ru: "29 МАРТА 2026", en: "MARCH 29, 2026" },
    time: { uz: "19:00", ru: "19:00", en: "7:00 PM" },
    branch: { uz: "YUNUSOBOD", ru: "ЮНУСАБАД", en: "YUNUSABAD" },
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Sommelier bilan kecha: 5 kurs va wine pairing.",
        ru: "Вечер с сомелье: 5 курсов и wine pairing.",
        en: "An evening with sommelier: 5 courses and wine pairing.",
      },
    ],
  },
  {
    id: "e-11",
    slug: "guest-chef-dinner",
    category: "event",
    title: {
      uz: "Chef mehmonlik dinner",
      ru: "Гостевой ужин от шефа",
      en: "Guest Chef Dinner",
    },
    date: { uz: "1 APREL 2026", ru: "1 АПРЕЛЯ 2026", en: "APRIL 1, 2026" },
    time: { uz: "20:00", ru: "20:00", en: "8:00 PM" },
    branch: { uz: "CHILONZOR", ru: "ЧИЛАНЗАР", en: "CHILANZAR" },
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Mehmon chef tomonidan bir kechalik maxsus set.",
        ru: "Специальный сет на один вечер от приглашенного шефа.",
        en: "One-night special set by a guest chef.",
      },
    ],
  },
  {
    id: "e-12",
    slug: "kids-pizza-day",
    category: "kids",
    title: {
      uz: "Kichiklar uchun pitsa kuni",
      ru: "День пиццы для детей",
      en: "Pizza Day for Kids",
    },
    date: { uz: "3 APREL 2026", ru: "3 АПРЕЛЯ 2026", en: "APRIL 3, 2026" },
    time: { uz: "12:30", ru: "12:30", en: "12:30 PM" },
    branch: { uz: "MIROBOD", ru: "МИРАБАД", en: "MIRABAD" },
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Bolalar uchun pizza workshop va mini turnir.",
        ru: "Детский pizza workshop и мини-турнир.",
        en: "Kids pizza workshop and mini tournament.",
      },
    ],
  },
  {
    id: "e-13",
    slug: "cocktail-lab",
    category: "event",
    title: {
      uz: "Cocktail Lab: yangi tatlar",
      ru: "Cocktail Lab: новые вкусы",
      en: "Cocktail Lab: New Flavors",
    },
    date: { uz: "5 APREL 2026", ru: "5 АПРЕЛЯ 2026", en: "APRIL 5, 2026" },
    time: { uz: "18:30", ru: "18:30", en: "6:30 PM" },
    branch: { uz: "TOSHKENT CITY", ru: "ТАШКЕНТ CITY", en: "TASHKENT CITY" },
    image: "https://images.unsplash.com/photo-1461823385004-d7660947a7c0?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Cocktail Lab sessiyasi: yangi ingredientlar va texnikalar.",
        ru: "Сессия Cocktail Lab: новые ингредиенты и техники.",
        en: "Cocktail Lab session featuring new ingredients and techniques.",
      },
    ],
  },
  {
    id: "e-14",
    slug: "kids-cupcake-class",
    category: "kids",
    title: {
      uz: "Bolalar cupcake dekor kursi",
      ru: "Детский курс по декору капкейков",
      en: "Kids Cupcake Decoration Course",
    },
    date: { uz: "8 APREL 2026", ru: "8 АПРЕЛЯ 2026", en: "APRIL 8, 2026" },
    time: { uz: "11:30", ru: "11:30", en: "11:30 AM" },
    branch: { uz: "YUNUSOBOD", ru: "ЮНУСАБАД", en: "YUNUSABAD" },
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Cupcake bezatish kursi: ranglar, krem va prezentatsiya asoslari.",
        ru: "Курс по декору капкейков: цвет, крем и основы презентации.",
        en: "Cupcake decoration class covering color, cream, and presentation basics.",
      },
    ],
  },
  {
    id: "e-15",
    slug: "private-tasting-premium",
    category: "event",
    title: {
      uz: "Yopiq tasting: premium menu",
      ru: "Закрытый tasting: premium меню",
      en: "Private Tasting: Premium Menu",
    },
    date: { uz: "10 APREL 2026", ru: "10 АПРЕЛЯ 2026", en: "APRIL 10, 2026" },
    time: { uz: "20:30", ru: "20:30", en: "8:30 PM" },
    branch: { uz: "CHILONZOR", ru: "ЧИЛАНЗАР", en: "CHILANZAR" },
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1800&h=1200&fit=crop",
    description: [
      {
        uz: "Premium mahsulotlar asosida yopiq tasting kechasi.",
        ru: "Закрытый tasting-вечер на базе premium-продуктов.",
        en: "Private tasting evening built around premium ingredients.",
      },
    ],
  },
];

export function getEventBySlug(slug: string): EventItem | undefined {
  return eventsData.find((event) => event.slug === slug);
}
