'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Reveal from '@/components/Reveal';
import RestaurantsMap from '@/components/restaurant/RestaurantsMap';
import type {
  RestaurantBranchItem,
  RestaurantProjectItem,
  RestaurantsDirectoryData,
} from '@/lib/getRestaurantBranches';
import type { RestaurantsPageSettingsData } from '@/lib/getRestaurantsPageSettings';
import { pickLocalized } from '@/types/i18n';
import type { LangCode } from '@/types/i18n';

type ViewMode = 'list' | 'map';

function formatBranchesCount(count: number, lang: LangCode): string {
  if (lang === 'ru') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    let noun = 'филиалов';

    if (mod10 === 1 && mod100 !== 11) {
      noun = 'филиал';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      noun = 'филиала';
    }

    return `${count} ${noun}`;
  }

  if (lang === 'en') {
    return `${count} ${count === 1 ? 'branch' : 'branches'}`;
  }

  return `${count} ${count === 1 ? 'filial' : 'filial'}`;
}

function projectMonogram(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('') || 'GR';
}

function ProjectLogo({
  project,
  lang,
  className = '',
}: {
  project: RestaurantProjectItem;
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
          className="object-contain p-2"
          sizes="140px"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(174,14,22,0.22),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.01))] ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(174,14,22,0.08),_transparent_46%,_rgba(255,255,255,0.03))]" />
      <div className="relative z-10 flex h-full items-center justify-center p-3 md:p-4">
        <span className="text-[46px] md:text-[58px] leading-none tracking-[-0.05em] font-light font-serif text-white/88">
          {projectMonogram(name)}
        </span>
      </div>
    </div>
  );
}

function cityLabel(city: string, lang: LangCode): string {
  if (city === 'new_york') {
    return lang === 'ru' ? 'Нью-Йорк' : lang === 'en' ? 'New York' : 'Nyu-York';
  }

  return lang === 'ru' ? 'Ташкент' : lang === 'en' ? 'Tashkent' : 'Toshkent';
}

function featureLabels(branch: RestaurantBranchItem, lang: LangCode): string[] {
  const labels: string[] = [];

  if (branch.projectType === 'barbershop') {
    if (branch.hasVipRoom) {
      labels.push(lang === 'ru' ? 'VIP-кабинет' : lang === 'en' ? 'VIP room' : 'VIP kabinet');
    }

    if (branch.hasKidsHaircut) {
      labels.push(lang === 'ru' ? 'Детская стрижка' : lang === 'en' ? 'Kids haircut' : 'Bolalar soch turmagi');
    }

    return labels;
  }

  if (branch.hasBanquet) {
    labels.push(lang === 'ru' ? 'Банкетный зал' : lang === 'en' ? 'Banquet hall' : 'Banket zali');
  }

  if (branch.hasPlayground) {
    labels.push(lang === 'ru' ? 'Детская площадка' : lang === 'en' ? 'Playground' : 'Bolalar maydonchasi');
  }

  return labels;
}

function IconList({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M6 5.5H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 10H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 14.5H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="3.5" cy="5.5" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="10" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="14.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconMap({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M3 5.4L7.4 3.8L12.2 5.7L17 4.1V14.6L12.2 16.2L7.4 14.3L3 15.9V5.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.4 3.9V14.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12.2 5.8V16.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconLocation({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 17C12.8 13.8 15.2 11 15.2 8C15.2 5.1 12.9 2.8 10 2.8C7.1 2.8 4.8 5.1 4.8 8C4.8 11 7.2 13.8 10 17Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconPhone({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M6.1 3.9L8.3 3.3C8.8 3.2 9.3 3.4 9.5 3.9L10.3 5.9C10.5 6.3 10.4 6.8 10 7.1L8.8 8.1C8.6 8.2 8.5 8.5 8.6 8.8C9.2 10.2 10.4 11.3 11.7 12C12 12.1 12.3 12 12.5 11.8L13.4 10.6C13.7 10.2 14.2 10.1 14.7 10.3L16.6 11.1C17.1 11.3 17.4 11.8 17.2 12.3L16.6 14.5C16.5 15 16.1 15.3 15.5 15.3C8.8 15.1 4.9 11.3 4.7 4.5C4.7 3.9 5 4.1 6.1 3.9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function IconWallet({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="5.5" width="14" height="9" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10H17" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12.4" cy="10" r="0.8" fill="currentColor" />
      <path d="M5.3 5.4L14.3 5.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export default function RestaurantsDirectoryPage({
  data,
  pageSettings,
  lang,
}: {
  data: RestaurantsDirectoryData;
  pageSettings: RestaurantsPageSettingsData;
  lang: LangCode;
}) {
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const initialProjectId = data.projects[0]?.id || '';

  const [activeProjectId, setActiveProjectId] = useState(initialProjectId);

  const filteredProjects = data.projects.filter((project) => project.branches.length > 0);

  const activeProject =
    filteredProjects.find((project) => project.id === activeProjectId) || filteredProjects[0] || null;

  const [activeBranchId, setActiveBranchId] = useState(activeProject?.branches[0]?.id || '');
  const effectiveProject = activeProject;
  const effectiveBranch =
    effectiveProject?.branches.find((branch) => branch.id === activeBranchId) ||
    effectiveProject?.branches[0] ||
    null;

  if (!data.projects.length) {
    return null;
  }

  const ui = {
    eyebrow: pickLocalized(pageSettings.eyebrow, lang),
    title: pickLocalized(pageSettings.title, lang),
    intro: pickLocalized(pageSettings.intro, lang),
    projectsLabel: lang === 'ru' ? 'ПРОЕКТЫ' : lang === 'en' ? 'PROJECTS' : 'LOYIHALAR',
    listLabel: lang === 'ru' ? 'СПИСОК' : lang === 'en' ? 'LIST' : 'RO‘YXAT',
    mapLabel: lang === 'ru' ? 'КАРТА' : lang === 'en' ? 'MAP' : 'XARITA',
    address: lang === 'ru' ? 'АДРЕС' : lang === 'en' ? 'ADDRESS' : 'MANZIL',
    contacts: lang === 'ru' ? 'КОНТАКТЫ' : lang === 'en' ? 'CONTACTS' : 'ALOQA',
    hours: lang === 'ru' ? 'РЕЖИМ' : lang === 'en' ? 'HOURS' : 'ISH VAQTI',
    averageCheck: lang === 'ru' ? 'СРЕДНИЙ ЧЕК' : lang === 'en' ? 'AVERAGE CHECK' : 'O‘RTACHA CHEK',
    details: lang === 'ru' ? 'Подробнее' : lang === 'en' ? 'Explore' : 'Batafsil',
    openMap: lang === 'ru' ? 'НА КАРТЕ' : lang === 'en' ? 'ON MAP' : 'XARITADA',
    noBranches:
      lang === 'ru'
        ? 'В этом городе пока нет опубликованных филиалов.'
        : lang === 'en'
          ? 'There are no published branches in this city yet.'
          : 'Bu shaharda hali e’lon qilingan filiallar yo‘q.',
  };

  const activeProjectName = effectiveProject ? pickLocalized(effectiveProject.name, lang) : '';
  const activeProjectBranches = effectiveProject?.branches || [];

  const handleProjectChange = (projectId: string) => {
    setActiveProjectId(projectId);

    const nextProject = filteredProjects.find((project) => project.id === projectId) || null;
    setActiveBranchId(nextProject?.branches[0]?.id || '');
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-base pt-[200px] pb-24 text-white md:pt-[244px] md:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-16%] top-[8%] h-[440px] w-[440px] rounded-full bg-[#AE0E16]/8 blur-[150px]" />
        <div className="absolute right-[-12%] top-[20%] h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-[150px]" />
      </div>

      <div className="page-x relative z-10">
        <div className="mx-auto max-w-[1600px]">
          <Reveal as="header" className="max-w-[1100px]" distance={38} blur={8}>
            <span className="text-[12px] uppercase tracking-[0.22em] text-white/34">
              {ui.eyebrow}
            </span>
            <h1 className="mt-6 text-[clamp(48px,6vw,118px)] leading-[0.88] tracking-[-0.03em] font-light font-serif text-white">
              {ui.title}
            </h1>
            <p className="mt-8 max-w-[880px] text-[15px] md:text-[19px] leading-relaxed text-white/58">
              {ui.intro}
            </p>
          </Reveal>

          <div className="mt-16 border-t border-white/10 pt-8 md:pt-10 xl:grid xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-14">
            <Reveal
              as="aside"
              className="xl:sticky xl:top-[138px] xl:self-start xl:border-r xl:border-white/10 xl:pr-10"
              delay={90}
              distance={30}
              blur={6}
            >
              <div>
                <p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-white/34">
                  {ui.projectsLabel}
                </p>

                <div className="flex flex-col">
                  {filteredProjects.map((project) => {
                    const isActive = project.id === effectiveProject?.id;
                    const projectName = pickLocalized(project.name, lang);

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleProjectChange(project.id)}
                        className={`group relative flex w-full items-start gap-4 border-b border-white/10 py-4 pl-5 text-left transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-white/52 hover:text-white/78'
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-4 bottom-4 w-px transition-all duration-300 ${
                            isActive ? 'bg-[#AE0E16]' : 'bg-transparent group-hover:bg-white/18'
                          }`}
                        />
                        <ProjectLogo
                          project={project}
                          lang={lang}
                          className="w-[56px] flex-shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[24px] leading-[1.02] tracking-[-0.02em] font-light font-serif">
                            {projectName}
                          </span>
                          <span className="mt-3 block text-[11px] uppercase tracking-[0.18em] text-white/32">
                            {formatBranchesCount(project.branches.length, lang)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <div className="mt-10 min-w-0 xl:mt-0">
              <Reveal
                as="div"
                className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6"
                delay={120}
                distance={28}
                blur={6}
              >
                <div>
                  <h2 className="text-[clamp(28px,3.4vw,56px)] leading-[0.94] tracking-[-0.03em] font-light font-serif text-white">
                    {activeProjectName}
                  </h2>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-white/30">
                    {formatBranchesCount(activeProjectBranches.length, lang)}
                  </p>
                </div>

                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
                  {(['list', 'map'] as const).map((mode) => {
                    const isActive = activeView === mode;

                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setActiveView(mode)}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] transition-colors ${
                          isActive
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {mode === 'list' ? (
                          <IconList className="h-3.5 w-3.5" />
                        ) : (
                          <IconMap className="h-3.5 w-3.5" />
                        )}
                        {mode === 'list' ? ui.listLabel : ui.mapLabel}
                      </button>
                    );
                  })}
                </div>
              </Reveal>

              {!effectiveProject ? (
                <div className="border-b border-white/10 py-20 text-[16px] leading-relaxed text-white/52">
                  {ui.noBranches}
                </div>
              ) : activeView === 'list' ? (
                <div className="pt-10">
                  <div className="flex flex-col">
                    {activeProjectBranches.map((branch, index) => {
                      const title = pickLocalized(branch.branchName, lang);
                      const address = pickLocalized(branch.address, lang);
                      const hours = pickLocalized(branch.workingHours, lang);
                      const averageCheck = pickLocalized(branch.averageCheck, lang);
                      const menuLinks = branch.menuUrls || [];
                      const href = branch.slug
                        ? `/${lang}/restaurants/${encodeURIComponent(branch.slug)}`
                        : `/${lang}/restaurants`;
                      const features = featureLabels(branch, lang);

                      return (
                        <Reveal
                          key={branch.id}
                          as="article"
                          className="border-b border-white/10 py-8 md:py-10"
                          delay={Math.min(index, 4) * 80}
                          distance={34}
                          blur={8}
                        >
                          <div className="grid gap-8 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:gap-10">
                            <Link href={href} className="group relative block min-h-[240px] overflow-hidden border border-white/10 bg-card">
                              {branch.cardImage ? (
                                <Image
                                  src={branch.cardImage}
                                  alt={title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                  sizes="(max-width: 1024px) 100vw, 420px"
                                />
                              ) : null}
                            </Link>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-5">
                                <div>
                                  <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.08em] text-white/42">
                                    <IconLocation className="h-3.5 w-3.5" />
                                    {cityLabel(branch.city, lang)}
                                  </span>
                                  <h3 className="mt-4 text-[clamp(30px,3vw,54px)] leading-[0.94] tracking-[-0.03em] font-light font-serif text-white">
                                    {title}
                                  </h3>
                                </div>
                              </div>

                              {features.length > 0 ? (
                                <div className="mt-6 flex flex-wrap gap-3">
                                  {features.map((item) => (
                                    <span
                                      key={item}
                                      className="inline-flex items-center gap-2 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/54"
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
                                <div>
                                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
                                    <IconLocation className="h-3.5 w-3.5" />
                                    {ui.address}
                                  </p>
                                  <p className="mt-3 text-[15px] leading-relaxed text-white/82">
                                    {address}
                                  </p>
                                </div>

                                <div>
                                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
                                    <IconPhone className="h-3.5 w-3.5" />
                                    {ui.contacts}
                                  </p>
                                  <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-white/82">
                                    {branch.phone ? (
                                      <a href={`tel:${branch.phone}`} className="transition-colors hover:text-white">
                                        {branch.phone}
                                      </a>
                                    ) : null}
                                    {hours ? <span>{hours}</span> : null}
                                  </div>
                                </div>

                                <div>
                                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
                                    <IconWallet className="h-3.5 w-3.5" />
                                    {ui.averageCheck}
                                  </p>
                                  <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-white/82">
                                    {averageCheck ? <span>{averageCheck}</span> : null}
                                    {menuLinks.map((menuUrl, menuIndex) => (
                                      <a
                                        key={`${branch.id}-menu-${menuIndex}`}
                                        href={menuUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:text-white"
                                      >
                                        {menuLinks.length === 1
                                          ? lang === 'ru'
                                            ? 'Открыть меню'
                                            : lang === 'en'
                                              ? 'Open menu'
                                              : 'Menyuni ochish'
                                          : lang === 'ru'
                                            ? `Меню ${menuIndex + 1}`
                                            : lang === 'en'
                                              ? `Menu ${menuIndex + 1}`
                                              : `Menyu ${menuIndex + 1}`}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 flex flex-wrap gap-6 text-[12px] uppercase tracking-[0.18em]">
                                <Link href={href} className="border-b border-white/20 pb-2 text-white/90 transition-colors hover:text-white hover:border-white/40">
                                  {ui.details}
                                </Link>
                                {branch.mapLink ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveView('map');
                                      setActiveBranchId(branch.id);
                                    }}
                                    className="border-b border-white/20 pb-2 text-white/68 transition-colors hover:text-white hover:border-white/40"
                                  >
                                    {ui.openMap}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-10">
                  <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Reveal
                      as="div"
                      className="overflow-hidden border border-white/10 bg-card/20"
                      delay={80}
                      distance={32}
                      blur={6}
                    >
                      <div className="max-h-[620px] overflow-y-auto">
                        {activeProjectBranches.map((branch) => {
                          const isActive = branch.id === effectiveBranch?.id;
                          const features = featureLabels(branch, lang);

                          return (
                            <button
                              key={branch.id}
                              type="button"
                              onClick={() => setActiveBranchId(branch.id)}
                              className={`w-full border-b border-white/10 px-5 py-5 text-left transition-colors ${
                                isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                              }`}
                            >
                              <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.08em] text-white/42">
                                <IconLocation className="h-3.5 w-3.5" />
                                {cityLabel(branch.city, lang)}
                              </span>
                              <h3 className="mt-3 text-[26px] leading-[1] tracking-[-0.02em] font-light font-serif text-white">
                                {pickLocalized(branch.branchName, lang)}
                              </h3>
                              <p className="mt-3 text-[14px] leading-relaxed text-white/62">
                                {pickLocalized(branch.address, lang)}
                              </p>
                              {features.length > 0 ? (
                                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/36">
                                  {features.join(' • ')}
                                </p>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </Reveal>

                    <Reveal as="div" delay={120} distance={34} blur={8}>
                      <RestaurantsMap
                        branches={activeProjectBranches}
                        activeBranchId={effectiveBranch?.id}
                        lang={lang}
                        onSelectBranch={setActiveBranchId}
                      />
                    </Reveal>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
