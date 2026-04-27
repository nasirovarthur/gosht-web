"use client";

import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import Reveal from "@/components/Reveal";
import SliderButton from "@/components/SliderButton";
import { pickLocalized } from "@/types/i18n";
import type { LangCode } from "@/types/i18n";
import type { CompanyProjectItem, ProjectsPageData } from "@/lib/getProjects";

function formatProjectIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function projectMonogram(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("") || "GP";
}

function normalizeContactHref(href: string): string | null {
  const value = href.trim();
  return value ? value : null;
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ProjectLogo({
  project,
  lang,
  className = "",
}: {
  project: CompanyProjectItem;
  lang: LangCode;
  className?: string;
}) {
  const name = pickLocalized(project.name, lang);

  if (project.logo) {
    return (
      <div className={`relative aspect-square overflow-hidden ${className}`}>
        <Image
          src={project.logo}
          alt={name}
          fill
          className="object-contain p-1 md:p-0"
          sizes="140px"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-square overflow-hidden border border-subtle bg-[radial-gradient(circle_at_top_left,_rgba(174,14,22,0.22),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.01))] ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(174,14,22,0.08),_transparent_46%,_rgba(255,255,255,0.03))]" />
      <div className="relative z-10 flex h-full items-center justify-center p-3 md:p-4">
        <span className="text-[46px] md:text-[58px] leading-none tracking-[-0.05em] font-light font-serif text-primary">
          {projectMonogram(name)}
        </span>
      </div>
    </div>
  );
}

export default function ProjectsPage({
  data,
  lang,
}: {
  data: ProjectsPageData;
  lang: LangCode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gallerySwiper, setGallerySwiper] = useState<SwiperInstance | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activeProject = data.projects[activeIndex] || data.projects[0];

  if (!activeProject) {
    return null;
  }

  const ui = {
    eyebrow:
      lang === "ru"
        ? "ПОРТФЕЛЬ ФОРМАТОВ"
        : lang === "en"
          ? "PORTFOLIO OF FORMATS"
          : "FORMATLAR PORTFELI",
    projectList:
      lang === "ru" ? "ПРОЕКТЫ" : lang === "en" ? "PROJECTS" : "LOYIHALAR",
    gallery:
      lang === "ru" ? "ГАЛЕРЕЯ" : lang === "en" ? "GALLERY" : "GALEREYA",
    noGallery:
      lang === "ru"
        ? "Добавьте изображения в галерею проекта в Sanity."
        : lang === "en"
          ? "Add project gallery images in Sanity."
          : "Sanity orqali loyiha galereyasiga rasmlar qo‘shing.",
    noContactsTitle:
      lang === "ru"
        ? "КОНТАКТЫ В ПРОЦЕССЕ"
        : lang === "en"
          ? "CONTACTS PENDING"
          : "KONTAKTLAR KEYINROQ",
    noContactsText:
      lang === "ru"
        ? "Добавьте телефон, email или ссылки в Sanity, и они появятся здесь."
        : lang === "en"
          ? "Add phone, email or links in Sanity and they will appear here."
          : "Telefon, email yoki havolalarni Sanity’da qo‘shing, ular shu yerda chiqadi.",
    nextProject:
      lang === "ru"
        ? "Следующий проект"
        : lang === "en"
          ? "Next project"
          : "Keyingi loyiha",
  };

  const projectName = pickLocalized(activeProject.name, lang);
  const projectDescriptionTitle =
    pickLocalized(activeProject.descriptionTitle, lang) ||
    pickLocalized(data.descriptionLabel, lang);
  const projectDescription = pickLocalized(activeProject.description, lang);
  const projectDescriptionParagraphs = splitIntoParagraphs(projectDescription);
  const nextProject =
    data.projects.length > 1
      ? data.projects[(activeIndex + 1) % data.projects.length]
      : null;

  const syncGalleryState = (swiper: SwiperInstance) => {
    setCanScrollLeft(!swiper.isBeginning);
    setCanScrollRight(!swiper.isEnd);
  };

  return (
    <section className="relative min-h-screen bg-base pt-[200px] pb-24 text-primary md:pt-[244px] md:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-16%] top-[8%] h-[440px] w-[440px] rounded-full bg-[#AE0E16]/8 blur-[150px]" />
        <div className="absolute right-[-12%] top-[20%] h-[420px] w-[420px] rounded-full bg-[color:rgba(255,255,255,0.03)] blur-[150px] dark:bg-white/[0.03]" />
      </div>

      <div className="page-x relative z-10">
        <div className="mx-auto max-w-[1600px]">
          <Reveal as="header" className="max-w-[1100px]" distance={38} blur={8}>
            <span className="text-[12px] uppercase tracking-[0.22em] text-muted">
              {ui.eyebrow}
            </span>
            <h1 className="mt-6 text-[clamp(48px,6vw,118px)] leading-[0.88] tracking-[-0.03em] font-light font-serif text-primary">
              {pickLocalized(data.title, lang)}
            </h1>
            <p className="mt-8 max-w-[880px] text-[15px] md:text-[19px] leading-relaxed text-secondary">
              {pickLocalized(data.intro, lang)}
            </p>
          </Reveal>

          <div className="mt-16 border-t border-subtle pt-8 md:pt-10 flex flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
            <aside className="order-2 mt-auto pt-12 lg:order-1 lg:mt-0 lg:border-t-0 lg:border-b-0 lg:border-r lg:border-subtle lg:pt-0 lg:sticky lg:top-[132px] lg:self-start lg:pr-10">
              <Reveal as="div" delay={90} distance={30} blur={6}>
                <p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-muted">
                  {ui.projectList}
                </p>

                <div className="flex flex-col">
                  {data.projects.map((project, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`group relative flex w-full items-start justify-between gap-5 border-b border-subtle py-4 pl-5 text-left transition-all duration-300 ${
                          isActive
                            ? "text-primary"
                            : "text-muted hover:text-secondary"
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-4 bottom-4 w-px transition-all duration-300 ${
                            isActive ? "bg-[#AE0E16]" : "bg-transparent group-hover:bg-[color:var(--border-strong)]"
                          }`}
                        />
                        <span className="flex-1">
                          <span className={`block text-[11px] tracking-[0.22em] ${isActive ? "text-muted" : "text-muted"}`}>
                            {formatProjectIndex(index)}
                          </span>
                          <span className="mt-3 block text-[24px] leading-[1.02] tracking-[-0.02em] font-light font-serif">
                            {pickLocalized(project.name, lang)}
                          </span>
                        </span>
                        <span
                          className={`mt-2 h-px w-10 transition-all duration-300 ${
                            isActive ? "bg-[color:var(--border-strong)]" : "bg-transparent group-hover:bg-[color:var(--border-subtle)]"
                          }`}
                        />
                        <span className="sr-only">
                          {isActive ? "Active project" : "Inactive project"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            </aside>

            <div className="order-1 min-w-0 pt-0 lg:order-2 lg:pt-0">
              <div key={activeProject.id} className="animate-fade-up">
                {nextProject ? (
                  <Reveal as="div" className="mb-8 xl:hidden" delay={60} distance={24} blur={6}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((activeIndex + 1) % data.projects.length)}
                      className="group flex w-full items-center justify-between border border-subtle px-4 py-4 text-left transition-colors hover:bg-[color:var(--interactive-hover)]"
                    >
                      <div className="min-w-0">
                        <span className="block text-[11px] uppercase tracking-[0.2em] text-muted">
                          {ui.nextProject}
                        </span>
                        <span className="mt-2 block truncate text-[24px] leading-[1.02] tracking-[-0.02em] font-light font-serif text-primary">
                          {pickLocalized(nextProject.name, lang)}
                        </span>
                      </div>
                      <span className="ml-5 text-[24px] text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-secondary">
                        →
                      </span>
                    </button>
                  </Reveal>
                ) : null}

                <Reveal as="section" distance={34} blur={8}>
                  <div className="grid gap-10 border-b border-subtle pb-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
                    <div className="min-w-0">
                      <span className="text-[12px] uppercase tracking-[0.2em] text-muted">
                        {projectDescriptionTitle}
                      </span>
                      <div className="mt-8 flex items-start gap-5 md:gap-7">
                        <ProjectLogo
                          project={activeProject}
                          lang={lang}
                          className="w-[56px] flex-shrink-0 md:w-[108px]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-6">
                            <h2 className="max-w-[760px] text-[clamp(36px,4.6vw,86px)] leading-[0.92] tracking-[-0.03em] font-light font-serif text-primary">
                              {projectName}
                            </h2>
                            <span className="hidden pt-3 text-[12px] tracking-[0.24em] text-muted md:block">
                              {formatProjectIndex(activeIndex)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-10 max-w-[860px] space-y-4 md:space-y-5 text-[15px] md:text-[18px] leading-relaxed text-secondary">
                        {(projectDescriptionParagraphs.length > 0 ? projectDescriptionParagraphs : [projectDescription]).map((paragraph, index) => (
                          <p key={`${activeProject.id}-description-${index}`} className="whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0 border-t border-subtle pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      <h3 className="text-[24px] md:text-[34px] leading-none tracking-[-0.02em] font-light font-serif text-primary">
                        {pickLocalized(data.contactsLabel, lang)}
                      </h3>
                      <div className="mt-8 flex flex-col">
                        {activeProject.contacts.length > 0 ? (
                          activeProject.contacts.map((contact) => {
                            const href = normalizeContactHref(contact.href);

                            if (!href) {
                              return (
                                <div
                                  key={contact.id}
                                  className="py-4"
                                >
                                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                                    {pickLocalized(contact.label, lang)}
                                  </p>
                                  <p className="mt-3 text-[16px] md:text-[18px] leading-relaxed text-secondary">
                                    {contact.value}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <a
                                key={contact.id}
                                href={href}
                                target={href.startsWith("http") ? "_blank" : undefined}
                                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="group py-4 transition-colors hover:text-primary"
                              >
                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                                  {pickLocalized(contact.label, lang)}
                                </p>
                                <div className="mt-3 flex items-center justify-between gap-4">
                                  <p className="text-[16px] md:text-[18px] leading-relaxed text-secondary transition-colors group-hover:text-primary">
                                    {contact.value}
                                  </p>
                                  <span className="text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-secondary">
                                    →
                                  </span>
                                </div>
                              </a>
                            );
                          })
                        ) : (
                          <div className="py-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                              {ui.noContactsTitle}
                            </p>
                            <p className="mt-3 text-[15px] leading-relaxed text-secondary">
                              {ui.noContactsText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal as="section" className="mt-10" delay={120} distance={34} blur={8}>
                  <div className="flex items-center justify-between gap-6">
                    <h3 className="text-[24px] md:text-[34px] leading-none tracking-[-0.02em] font-light font-serif text-primary">
                      {pickLocalized(data.galleryLabel, lang)}
                    </h3>
                    <div className="hidden items-center gap-20 md:flex">
                      <SliderButton
                        direction="left"
                        onClick={() => gallerySwiper?.slidePrev()}
                        disabled={!canScrollLeft}
                        className="scale-[0.82] origin-right"
                      />
                      <SliderButton
                        direction="right"
                        onClick={() => gallerySwiper?.slideNext()}
                        disabled={!canScrollRight}
                        className="scale-[0.82] origin-right"
                      />
                    </div>
                  </div>

                  {activeProject.gallery.length > 0 ? (
                    <>
                      <Swiper
                        key={activeProject.id}
                        className="mt-6 w-full max-w-[1380px] overflow-visible"
                        modules={[EffectCreative]}
                        effect="creative"
                        speed={900}
                        slidesPerView={1}
                        spaceBetween={0}
                        grabCursor
                        creativeEffect={{
                          limitProgress: 2,
                          prev: {
                            translate: ["-10%", 0, -1],
                            opacity: 1,
                            scale: 0.985,
                          },
                          next: {
                            translate: ["100%", 0, 0],
                            opacity: 1,
                            scale: 1,
                          },
                        }}
                        onSwiper={(swiper) => {
                          setGallerySwiper(swiper);
                          syncGalleryState(swiper);
                        }}
                        onSlideChange={syncGalleryState}
                        onResize={syncGalleryState}
                      >
                        {activeProject.gallery.map((image, index) => (
                          <SwiperSlide key={`${activeProject.id}-gallery-${index}`}>
                            <div className="relative aspect-[16/8] w-full overflow-hidden border border-subtle bg-card">
                              <Image
                                src={image}
                                alt={`${projectName} ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1600px) calc(100vw - 120px), 1380px"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <div className="mt-6 flex items-center justify-end gap-12 md:hidden">
                        <SliderButton
                          direction="left"
                          onClick={() => gallerySwiper?.slidePrev()}
                          disabled={!canScrollLeft}
                          className="scale-[0.72]"
                        />
                        <SliderButton
                          direction="right"
                          onClick={() => gallerySwiper?.slideNext()}
                          disabled={!canScrollRight}
                          className="scale-[0.72]"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mt-6 border border-subtle bg-[color:var(--interactive-hover)] py-14 px-6">
                      <p className="max-w-[520px] text-[15px] md:text-[17px] leading-relaxed text-secondary">
                        {ui.noGallery}
                      </p>
                    </div>
                  )}
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
