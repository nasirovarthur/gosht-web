"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

type Localized = {
  uz: string;
  ru: string;
  en: string;
};

const ui: Record<"title" | "subtitle" | "feedback" | "language" | "rights" | "madeBy", Localized> = {
  title: {
    uz: "XABARDOR BO'LING",
    ru: "БУДЬТЕ В КУРСЕ",
    en: "STAY INFORMED",
  },
  subtitle: {
    uz: "Gastronomik yangiliklar, aksiyalar va foydali tavsiyalar",
    ru: "Гастрономические новости, советы, акции и многое другое",
    en: "Gastronomic news, tips, promos, and more",
  },
  feedback: {
    uz: "QAYTA ALOQA",
    ru: "ОБРАТНАЯ СВЯЗЬ",
    en: "FEEDBACK",
  },
  language: {
    uz: "TIL",
    ru: "ЯЗЫК",
    en: "LANGUAGE",
  },
  rights: {
    uz: "© GOSHT Group. Barcha huquqlar himoyalangan",
    ru: "© GOSHT Group. Все права защищены",
    en: "© GOSHT Group. All rights reserved",
  },
  madeBy: {
    uz: "Реализовано Артуром",
    ru: "Реализовано Артуром",
    en: "Реализовано Артуром",
  },
};

const navColumns: Localized[][] = [
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
];

const socialLinks = [
  { label: "Telegram", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
];

const localeLinks = [
  { label: "UZ", href: "#" },
  { label: "RU", href: "#" },
  { label: "EN", href: "#" },
];

function pickLocalized(value: Localized, lang: "uz" | "ru" | "en"): string {
  return value[lang] || value.uz;
}

export default function Footer() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  if (pathname.includes("/studio")) {
    return null;
  }

  return (
    <footer className="bg-surface text-white border-t border-white/10">
      <div className="page-x">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 py-20 md:py-24 lg:py-28">
            <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
              <Link href={`/${lang}`} className="relative w-[148px] h-[64px] block hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.svg"
                  alt="GOSHT Logo"
                  fill
                  className="object-contain scale-95 origin-left"
                />
              </Link>

              <h2 className="uppercase text-[clamp(36px,3.8vw,74px)] leading-[0.94] tracking-[-0.02em] font-light font-serif text-white/95">
                {pickLocalized(ui.title, lang)}
              </h2>

              <p className="max-w-[420px] text-[14px] md:text-[16px] leading-relaxed text-white/42">
                {pickLocalized(ui.subtitle, lang)}
              </p>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[13px] md:text-[14px] text-white/78 hover:text-white hover:border-white/35 hover:bg-white/5 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-r lg:border-white/10 lg:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-9">
                {navColumns.map((column, index) => (
                  <div key={`footer-col-${index}`} className="space-y-3.5">
                    {column.map((item) => (
                      <a
                        key={`${index}-${item.en}`}
                        href="#"
                        className="block text-[15px] leading-[1.45] text-white/72 hover:text-[#AE0E16] transition-colors"
                      >
                        {pickLocalized(item, lang)}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col items-center lg:items-start gap-10">
              <div className="w-full max-w-[280px]">
                <p className="text-[12px] uppercase tracking-[0.16em] text-white/45 mb-3">
                  {pickLocalized(ui.language, lang)}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-6">
                  {localeLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`text-[14px] uppercase tracking-[0.16em] transition-colors ${
                        item.label.toLowerCase() === lang
                          ? "text-white font-medium underline underline-offset-8"
                          : "text-white/45 hover:text-white/80"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <a
                href="#"
                className="inline-flex w-full max-w-[280px] justify-center items-center h-[54px] rounded-full border border-white/20 px-7 text-ui font-light text-white/90 hover:bg-white hover:text-black transition-all"
              >
                <span>{pickLocalized(ui.feedback, lang)}</span>
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[14px] leading-relaxed text-white/38">
            <p>{pickLocalized(ui.rights, lang)}</p>
            <a href="#" className="hover:text-white/55 transition-colors w-fit">
              {pickLocalized(ui.madeBy, lang)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
