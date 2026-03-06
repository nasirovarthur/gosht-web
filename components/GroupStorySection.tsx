"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SliderButton from "@/components/SliderButton";

type LocalizedString = {
  uz?: string;
  ru?: string;
  en?: string;
};

export interface GroupStorySectionData {
  marquee?: LocalizedString;
  titleTop?: LocalizedString;
  titleBottom?: LocalizedString;
  description?: LocalizedString;
  ctaText?: LocalizedString;
  ctaUrl?: string;
  previewImage?: string;
  portraitImage?: string;
}

type LangContent = {
  marquee: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  cta: string;
};

const contentByLang: Record<"uz" | "ru" | "en", LangContent> = {
  uz: {
    marquee: "SINCE 1991",
    titleTop: "GOSHT",
    titleBottom: "GROUP",
    description:
      "GOSHT Group hikoyasi birinchi loyihadan boshlandi. Bugun biz har bir filialda oshxona sifati, servis va atmosfera bo'yicha yagona standartni saqlaymiz.",
    cta: "Biz haqimizda",
  },
  ru: {
    marquee: "SINCE 1991",
    titleTop: "GOSHT",
    titleBottom: "GROUP",
    description:
      "История GOSHT Group началась с первого проекта. Сегодня мы сохраняем единый стандарт кухни, сервиса и атмосферы в каждом филиале.",
    cta: "Подробнее о нас",
  },
  en: {
    marquee: "SINCE 1991",
    titleTop: "GOSHT",
    titleBottom: "GROUP",
    description:
      "The story of GOSHT Group started with the first concept. Today we keep one standard of cuisine, service, and atmosphere across every branch.",
    cta: "Learn more",
  },
};

function pickLocalized(value: LocalizedString | undefined, lang: "uz" | "ru" | "en"): string {
  return value?.[lang] || value?.uz || value?.ru || value?.en || "";
}

function StoryAction({ label, href = "#" }: { label: string; href?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="inline-flex flex-col items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex items-center gap-5 md:gap-6">
        <Link href={href} className="group">
          <span
            className={`text-body-lg pb-0.5 transition-colors ${
              isHovered ? "text-white" : "text-white/85"
            }`}
          >
            {label}
          </span>
        </Link>

        <SliderButton
          direction="right"
          onClick={() => {}}
          forceHover={isHovered}
          className="scale-[0.48] md:scale-[0.6] origin-left -ml-2 md:-ml-1"
        />
      </div>

      <span className="relative mt-0.5 h-px w-full bg-white/20 overflow-hidden">
        <span
          className={`absolute inset-0 bg-white/60 transition-transform duration-500 ease-out ${
            isHovered ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </span>
    </div>
  );
}

export default function GroupStorySection({ data }: { data?: GroupStorySectionData | null }) {
  const { lang } = useLanguage();
  const fallback = contentByLang[lang] || contentByLang.ru;
  const content = {
    marquee: pickLocalized(data?.marquee, lang) || fallback.marquee,
    titleTop: pickLocalized(data?.titleTop, lang) || fallback.titleTop,
    titleBottom: pickLocalized(data?.titleBottom, lang) || fallback.titleBottom,
    description: pickLocalized(data?.description, lang) || fallback.description,
    cta: pickLocalized(data?.ctaText, lang) || fallback.cta,
  };
  const marqueeItems = Array(8).fill(content.marquee);
  const [parallaxY, setParallaxY] = useState(0);
  const previewImage =
    data?.previewImage ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop";
  const portraitImage =
    data?.portraitImage ||
    "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=1200&h=1700&fit=crop";
  const ctaUrl = data?.ctaUrl || "#";

  useEffect(() => {
    let raf = 0;

    const updateParallax = () => {
      const nextOffset = Math.min(90, window.scrollY * 0.08);
      setParallaxY(nextOffset);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="w-full bg-base section-y-lg border-t border-white/5 overflow-hidden">
      <div className="page-x mb-10">
        <div className="max-w-[360px] overflow-hidden select-none border-t border-white/15 pt-3">
          <div className="flex whitespace-nowrap text-white/45 text-[11px] md:text-[12px] tracking-[0.22em] uppercase animate-infinite-scroll [animation-duration:30s]">
            {marqueeItems.map((item, index) => (
              <span key={`line-1-${index}`} className="mr-8">{item} -</span>
            ))}
          </div>
          <div
            className="flex whitespace-nowrap text-white/45 text-[11px] md:text-[12px] tracking-[0.22em] uppercase animate-infinite-scroll [animation-duration:30s]"
            aria-hidden="true"
          >
            {marqueeItems.map((item, index) => (
              <span key={`line-2-${index}`} className="mr-8">{item} -</span>
            ))}
          </div>
        </div>
      </div>

      <div className="page-x">
        <div className="relative mx-auto max-w-[1600px]">
          <div
            className="pointer-events-none select-none absolute left-[2%] top-[8%] w-[min(72vw,980px)] h-[min(72vw,980px)] opacity-[0.14]"
            style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
          >
            <Image
              src="/menu-logo-ghost.svg"
              alt=""
              fill
              className="object-contain"
              aria-hidden="true"
            />
          </div>

          <div className="pointer-events-none absolute right-[14%] top-[6%] h-[320px] w-[320px] rounded-full bg-[#AE0E16]/20 blur-[120px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-7 lg:col-start-5">
              <h2 className="leading-[0.9] tracking-[-0.018em] font-serif uppercase">
                <span className="text-[#AE0E16] block text-[clamp(52px,8.8vw,132px)] font-thin">
                  {content.titleTop}
                </span>
                <span className="text-white block text-[clamp(58px,10.4vw,156px)] font-extralight md:ml-[18%]">
                  {content.titleBottom}
                </span>
              </h2>
            </div>

            <div className="lg:col-span-4 lg:col-start-2 self-start">
              <p className="text-body md:text-body-lg text-white/72 font-light leading-relaxed max-w-[420px]">
                {content.description}
              </p>
              <div className="mt-8">
                <StoryAction label={content.cta} href={ctaUrl} />
              </div>
            </div>

            <div className="lg:col-span-3 lg:col-start-6">
              <div className="relative h-[160px] md:h-[190px] overflow-hidden border border-white/10 bg-card">
                <Image
                  src={previewImage}
                  alt="Interior preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9 lg:row-span-2">
              <div className="relative h-[420px] md:h-[560px] overflow-hidden border border-white/10 bg-card">
                <Image
                  src={portraitImage}
                  alt="Chef portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
