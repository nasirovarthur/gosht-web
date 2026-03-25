"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/Reveal";
import { pickLocalized } from "@/types/i18n";
import type { FooterSettingsData } from "@/lib/getFooterSettings";
import type { LangCode, NavItem } from "@/types/i18n";

type FooterProps = {
  settings: FooterSettingsData;
  navItems: NavItem[];
};

type FooterNavColumn = {
  _key: string;
  items: NavItem[];
};

function splitNavItemsIntoColumns(items: NavItem[], columnCount = 3): FooterNavColumn[] {
  if (items.length === 0) {
    return [];
  }

  const normalizedColumnCount = Math.max(1, Math.min(columnCount, items.length));
  const baseSize = Math.floor(items.length / normalizedColumnCount);
  const remainder = items.length % normalizedColumnCount;
  const columns: FooterNavColumn[] = [];
  let startIndex = 0;

  for (let columnIndex = 0; columnIndex < normalizedColumnCount; columnIndex += 1) {
    const currentColumnSize = baseSize + (columnIndex < remainder ? 1 : 0);
    const columnItems = items.slice(startIndex, startIndex + currentColumnSize);

    if (columnItems.length > 0) {
      columns.push({
        _key: `footer-nav-column-${columnIndex}`,
        items: columnItems,
      });
    }

    startIndex += currentColumnSize;
  }

  return columns;
}

function resolveFooterHref(lang: string, href: string | null): string | null {
  if (!href) return null;
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  if (href.startsWith("#")) return href;
  if (/^\/(uz|ru|en)(\/|$)/.test(href)) {
    return href.replace(/^\/(uz|ru|en)(?=\/|$)/, `/${lang}`);
  }
  return `/${lang}${href.startsWith("/") ? href : `/${href}`}`;
}

export default function Footer({ settings, navItems }: FooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const madeByHref = resolveFooterHref(lang, settings.madeByHref);
  const navigationColumns = splitNavItemsIntoColumns(navItems);
  const localeLinks: LangCode[] = ["uz", "ru", "en"];

  const switchLanguage = (nextLang: LangCode) => {
    if (nextLang === lang) return;

    setLang(nextLang);

    if (!pathname) {
      router.push(`/${nextLang}`, { scroll: false });
      return;
    }

    const hasLangPrefix = /^\/(uz|ru|en)(\/|$)/.test(pathname);
    const nextPathname = hasLangPrefix
      ? pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, `/${nextLang}`)
      : `/${nextLang}${pathname === "/" ? "" : pathname}`;

    router.push(nextPathname || `/${nextLang}`, { scroll: false });
  };

  if (pathname.includes("/studio")) {
    return null;
  }

  const openFeedbackDrawer = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("open-feedback-drawer"));
  };

  return (
    <footer className="bg-surface text-white border-t border-white/10">
      <div className="page-x">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 py-20 md:py-24 lg:py-28">
            <Reveal as="div" className="lg:col-span-4 flex flex-col gap-8 md:gap-10" distance={34} blur={8}>
              <Link href={`/${lang}`} className="relative w-[148px] h-[64px] block hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.svg"
                  alt="GOSHT Logo"
                  fill
                  className="object-contain scale-95 origin-left"
                />
              </Link>

              <h2 className="uppercase text-[clamp(36px,3.8vw,74px)] leading-[0.94] tracking-[-0.02em] font-light font-serif text-white/95">
                {pickLocalized(settings.heading, lang)}
              </h2>

              <p className="max-w-[420px] text-[14px] md:text-[16px] leading-relaxed text-white/42">
                {pickLocalized(settings.subtitle, lang)}
              </p>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                {settings.socialLinks.map((item) => {
                  const href = resolveFooterHref(lang, item.href);

                  if (!href) {
                    return (
                      <span
                        key={item._key}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[13px] md:text-[14px] text-white/78"
                      >
                        {item.label}
                      </span>
                    );
                  }

                  return (
                    <a
                      key={item._key}
                      href={href}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[13px] md:text-[14px] text-white/78 hover:text-white hover:border-white/35 hover:bg-white/5 transition-all"
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </Reveal>

            <Reveal
              as="div"
              className="lg:col-span-5 lg:border-l lg:border-r lg:border-white/10 lg:px-10"
              delay={110}
              distance={34}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-9">
                {navigationColumns.map((column) => (
                  <div key={column._key} className="space-y-3.5">
                    {column.items.map((item) => {
                      const href = resolveFooterHref(lang, item.href);

                      if (!href) {
                        return (
                          <span
                            key={item._key}
                            className="block text-[15px] leading-[1.45] text-white/72"
                          >
                            {pickLocalized(item.label, lang)}
                          </span>
                        );
                      }

                      return (
                        <a
                          key={item._key}
                          href={href}
                          target={item.openInNewTab ? "_blank" : undefined}
                          rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                          className="block text-[15px] leading-[1.45] text-white/72 hover:text-[#AE0E16] transition-colors"
                        >
                          {pickLocalized(item.label, lang)}
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal
              as="div"
              className="lg:col-span-3 flex flex-col items-center lg:items-start gap-10"
              delay={180}
              distance={34}
            >
              <div className="w-full max-w-[280px]">
                <p className="text-[12px] uppercase tracking-[0.16em] text-white/45 mb-3">
                  {pickLocalized(settings.languageLabel, lang)}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-6">
                  {localeLinks.map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => switchLanguage(locale)}
                      className={`text-[14px] uppercase tracking-[0.16em] transition-colors ${
                        locale === lang
                          ? "text-white font-medium underline underline-offset-8"
                          : "text-white/45 hover:text-white/80"
                      }`}
                    >
                      {locale.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={openFeedbackDrawer}
                className="inline-flex w-full max-w-[280px] justify-center items-center h-[54px] rounded-full border border-white/20 px-7 text-ui font-light text-white/90 hover:bg-white hover:text-black transition-all"
              >
                <span>{pickLocalized(settings.feedbackLabel, lang)}</span>
              </button>
            </Reveal>
          </div>

          <div className="border-t border-white/10 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[14px] leading-relaxed text-white/38">
            <p>{pickLocalized(settings.rightsText, lang)}</p>
            {madeByHref ? (
              <a
                href={madeByHref}
                target={settings.madeByOpenInNewTab ? "_blank" : undefined}
                rel={settings.madeByOpenInNewTab ? "noopener noreferrer" : undefined}
                className="hover:text-white/55 transition-colors w-fit"
              >
                {pickLocalized(settings.madeByLabel, lang)}
              </a>
            ) : (
              <span className="w-fit">{pickLocalized(settings.madeByLabel, lang)}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
