"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import SliderButton from "@/components/SliderButton";
import Reveal from "@/components/Reveal";
import { pickLocalized, translations } from "@/types/i18n";
import type { LocalizedOptional } from "@/types/i18n";

export interface GroupStorySectionData {
  marquee?: LocalizedOptional;
  titleTop?: LocalizedOptional;
  titleBottom?: LocalizedOptional;
  description?: LocalizedOptional;
  ctaText?: LocalizedOptional;
  ctaUrl?: string;
  previewImage?: string;
  portraitImage?: string;
}

function StoryAction({ label, href }: { label: string; href: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const isExternalHref = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href);

  const handleAction = () => {
    if (isExternalHref) {
      window.location.href = href;
      return;
    }

    router.push(href);
  };

  return (
    <div
      className="inline-flex flex-col items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex items-center gap-5 md:gap-6">
        {isExternalHref ? (
          <a href={href} className="group">
            <span
              className={`text-body-lg pb-0.5 transition-colors ${
                isHovered ? "text-primary" : "text-secondary"
              }`}
            >
              {label}
            </span>
          </a>
        ) : (
          <Link href={href} className="group">
            <span
              className={`text-body-lg pb-0.5 transition-colors ${
                isHovered ? "text-primary" : "text-secondary"
              }`}
            >
              {label}
            </span>
          </Link>
        )}

        <SliderButton
          direction="right"
          onClick={handleAction}
          forceHover={isHovered}
          ariaLabel={label}
          className="scale-[0.48] md:scale-[0.6] origin-left -ml-2 md:-ml-1"
        />
      </div>

      <span className="relative mt-0.5 h-px w-full bg-[color:var(--border-strong)] overflow-hidden">
        <span
          className={`absolute inset-0 bg-[color:var(--text-primary)] transition-transform duration-500 ease-out ${
            isHovered ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </span>
    </div>
  );
}

export default function GroupStorySection({ data }: { data?: GroupStorySectionData | null }) {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const fallback = translations.groupStory;
  const content = {
    marquee: pickLocalized(data?.marquee, lang) || pickLocalized(fallback.marquee, lang),
    titleTop: pickLocalized(data?.titleTop, lang) || pickLocalized(fallback.titleTop, lang),
    titleBottom: pickLocalized(data?.titleBottom, lang) || pickLocalized(fallback.titleBottom, lang),
    description: pickLocalized(data?.description, lang) || pickLocalized(fallback.description, lang),
    cta: pickLocalized(data?.ctaText, lang) || pickLocalized(fallback.cta, lang),
  };
  const marqueeItems = Array(8).fill(content.marquee);
  const [parallaxY, setParallaxY] = useState(0);
  const previewImage =
    data?.previewImage ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop";
  const portraitImage =
    data?.portraitImage ||
    "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=1200&h=1700&fit=crop";
  const ctaUrl = data?.ctaUrl || `/${lang}/projects`;
  const ghostLogoSrc = theme === "light" ? "/menu-logo-ghost-dark.svg" : "/menu-logo-ghost.svg";

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
    <section className="w-full bg-base section-y-lg border-t border-subtle overflow-hidden transition-colors duration-300">
      <div className="page-x mb-10">
        <Reveal
          as="div"
          className="max-w-[360px] overflow-hidden select-none border-t border-strong pt-3"
          distance={24}
          blur={6}
        >
          <div className="flex whitespace-nowrap text-muted text-[11px] md:text-[12px] tracking-[0.22em] uppercase animate-infinite-scroll [animation-duration:30s]">
            {marqueeItems.map((item, index) => (
              <span key={`line-1-${index}`} className="mr-8">{item} -</span>
            ))}
          </div>
          <div
            className="flex whitespace-nowrap text-muted text-[11px] md:text-[12px] tracking-[0.22em] uppercase animate-infinite-scroll [animation-duration:30s]"
            aria-hidden="true"
          >
            {marqueeItems.map((item, index) => (
              <span key={`line-2-${index}`} className="mr-8">{item} -</span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="page-x">
        <div className="relative mx-auto max-w-[1600px]">
          <div
            className="pointer-events-none select-none absolute left-[2%] top-[8%] w-[min(72vw,980px)] h-[min(72vw,980px)] opacity-[0.14]"
            style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
          >
            <Image
              src={ghostLogoSrc}
              alt=""
              fill
              sizes="(max-width: 1024px) 72vw, 980px"
              className="object-contain"
              aria-hidden="true"
            />
          </div>

          <div className="pointer-events-none absolute right-[14%] top-[6%] h-[320px] w-[320px] rounded-full blur-[120px]" style={{ backgroundColor: "var(--ghost-glow)" }} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <Reveal as="div" className="lg:col-span-7 lg:col-start-5" distance={56} blur={12}>
              <h2 className="leading-[0.9] tracking-[-0.018em] font-serif uppercase">
                <span className="text-[#AE0E16] block text-[clamp(52px,8.8vw,132px)] font-light">
                  {content.titleTop}
                </span>
                <span className="text-primary block text-[clamp(58px,10.4vw,156px)] font-light md:ml-[18%]">
                  {content.titleBottom}
                </span>
              </h2>
            </Reveal>

            <Reveal
              as="div"
              className="lg:col-span-4 lg:col-start-2 self-start"
              delay={110}
              distance={38}
            >
              <p className="text-body md:text-body-lg text-secondary font-light leading-relaxed max-w-[420px]">
                {content.description}
              </p>
              <div className="mt-8">
                <StoryAction label={content.cta} href={ctaUrl} />
              </div>
            </Reveal>

            <Reveal
              as="div"
              className="lg:col-span-3 lg:col-start-6"
              variant="left"
              delay={180}
              distance={44}
            >
              <div className="relative h-[160px] md:h-[190px] overflow-hidden border border-subtle bg-card">
                <Image
                  src={previewImage}
                  alt="Interior preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </div>
            </Reveal>

            <Reveal
              as="div"
              className="lg:col-span-4 lg:col-start-9 lg:row-span-2"
              variant="right"
              delay={250}
              distance={52}
            >
              <div className="relative h-[420px] md:h-[560px] overflow-hidden border border-subtle bg-card">
                <Image
                  src={portraitImage}
                  alt="Chef portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
