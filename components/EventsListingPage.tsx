"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Localized = {
  uz: string;
  ru: string;
  en: string;
};

type EventCategory = "event" | "kids";
type TabValue = "all" | EventCategory;

type EventItem = {
  id: string;
  category: EventCategory;
  title: Localized;
  image: string;
};

const eventsData: EventItem[] = [
  {
    id: "e-1",
    category: "event",
    title: {
      uz: "AQUAMARINE X JCOS hamkorlik kechasi",
      ru: "Коллаборация AQUAMARINE X JCOS",
      en: "AQUAMARINE X JCOS Collaboration",
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-2",
    category: "event",
    title: {
      uz: "8 mart: desertlar va bayramona kayfiyat",
      ru: "8 марта: десерты и праздничное настроение",
      en: "March 8: Desserts and Festive Mood",
    },
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-3",
    category: "event",
    title: {
      uz: "Yangi kokteyl kartasi va maxsus servis",
      ru: "Новая коктейльная карта и спецсервис",
      en: "New Cocktail Menu and Special Service",
    },
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-4",
    category: "kids",
    title: {
      uz: "Bolalar uchun oshpazlik master-klassi",
      ru: "Детский кулинарный мастер-класс",
      en: "Kids Culinary Masterclass",
    },
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-5",
    category: "event",
    title: {
      uz: "Chef’s Table: mavsumiy degustatsiya",
      ru: "Chef’s Table: сезонная дегустация",
      en: "Chef’s Table: Seasonal Tasting",
    },
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-6",
    category: "kids",
    title: {
      uz: "Oilaviy yakshanba: mini-burgerlar",
      ru: "Семейное воскресенье: мини-бургеры",
      en: "Family Sunday: Mini Burgers",
    },
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-7",
    category: "event",
    title: {
      uz: "Live Jazz va signature-menu",
      ru: "Live Jazz и авторское меню",
      en: "Live Jazz and Signature Menu",
    },
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-8",
    category: "event",
    title: {
      uz: "Bahorgi brunch maxsus taklifi",
      ru: "Весенний brunch special",
      en: "Spring Brunch Special",
    },
    image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-9",
    category: "kids",
    title: {
      uz: "Bolalar bayrami: shirinlik studiyasi",
      ru: "Детский праздник: студия десертов",
      en: "Kids Party: Dessert Studio",
    },
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-10",
    category: "event",
    title: {
      uz: "Wine Pairing kechasi",
      ru: "Вечер Wine Pairing",
      en: "Wine Pairing Night",
    },
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-11",
    category: "event",
    title: {
      uz: "Chef mehmonlik dinner",
      ru: "Гостевой ужин от шефа",
      en: "Guest Chef Dinner",
    },
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-12",
    category: "kids",
    title: {
      uz: "Kichiklar uchun pitsa kuni",
      ru: "День пиццы для детей",
      en: "Pizza Day for Kids",
    },
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-13",
    category: "event",
    title: {
      uz: "Cocktail Lab: yangi tatlar",
      ru: "Cocktail Lab: новые вкусы",
      en: "Cocktail Lab: New Flavors",
    },
    image: "https://images.unsplash.com/photo-1461823385004-d7660947a7c0?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-14",
    category: "kids",
    title: {
      uz: "Bolalar cupcake dekor kursi",
      ru: "Детский курс по декору капкейков",
      en: "Kids Cupcake Decoration Course",
    },
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600&h=1000&fit=crop",
  },
  {
    id: "e-15",
    category: "event",
    title: {
      uz: "Yopiq tasting: premium menu",
      ru: "Закрытый tasting: premium меню",
      en: "Private Tasting: Premium Menu",
    },
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&h=1000&fit=crop",
  },
];

function EventsCard({ event }: { event: EventItem }) {
  const { lang } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const title = event.title[lang] || event.title.uz;

  return (
    <article className="w-full">
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#d8d8d8]">
        {!imageFailed && (
          <Image
            src={event.image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <h3 className="mt-4 text-[clamp(22px,1.65vw,34px)] leading-[1.05] tracking-[-0.01em] text-black/90 font-light font-serif">
        {title}
      </h3>
    </article>
  );
}

export default function EventsListingPage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [visibleCount, setVisibleCount] = useState(12);

  const labels = {
    title: lang === "uz" ? "VOQEALAR" : lang === "en" ? "EVENTS" : "СОБЫТИЯ",
    all: lang === "uz" ? "BARCHASI" : lang === "en" ? "ALL" : "ВСЕ",
    events: lang === "uz" ? "VOQEALAR" : lang === "en" ? "EVENTS" : "СОБЫТИЯ",
    kids:
      lang === "uz"
        ? "BOLALAR TADBIRLARI"
        : lang === "en"
          ? "KIDS ACTIVITIES"
          : "ДЕТСКИЕ МЕРОПРИЯТИЯ",
    more: lang === "uz" ? "YANA KO'RISH" : lang === "en" ? "LOAD MORE" : "СМОТРЕТЬ ЕЩЕ",
  };

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return eventsData;
    return eventsData.filter((item) => item.category === activeTab);
  }, [activeTab]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const canLoadMore = filteredEvents.length > visibleEvents.length;

  const onTabClick = (tab: TabValue) => {
    setActiveTab(tab);
    setVisibleCount(12);
  };

  return (
    <section className="w-full bg-[#ECECEC] min-h-screen section-y">
      <div className="page-x">
        <div className="mx-auto w-full max-w-[1600px]">
          <h1 className="text-[clamp(48px,5.4vw,102px)] leading-[0.9] tracking-[-0.02em] text-black font-light font-serif mb-10 md:mb-12">
            {labels.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-12 md:mb-14">
            {([
              { key: "all", label: labels.all },
              { key: "event", label: labels.events },
              { key: "kids", label: labels.kids },
            ] as const).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabClick(tab.key)}
                  className={`h-12 md:h-14 px-6 md:px-7 rounded-full text-[11px] md:text-[12px] tracking-[0.12em] uppercase transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-transparent border border-black/25 text-black/70 hover:text-black hover:border-black/45"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-14">
            {visibleEvents.map((event) => (
              <EventsCard key={event.id} event={event} />
            ))}
          </div>

          {canLoadMore && (
            <div className="mt-14 md:mt-16 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="h-12 md:h-14 px-8 md:px-9 rounded-full border border-black/25 text-black/85 text-[11px] md:text-[12px] tracking-[0.14em] uppercase hover:border-black/55 hover:text-black transition-colors"
              >
                {labels.more}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
