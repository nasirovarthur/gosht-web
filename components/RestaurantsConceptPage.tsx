'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import RestaurantsMap from '@/components/restaurant/RestaurantsMap';
import type {
  RestaurantBranchItem,
  RestaurantProjectItem,
  RestaurantsDirectoryData,
} from '@/lib/getRestaurantBranches';
import { pickLocalized } from '@/types/i18n';
import type { LangCode } from '@/types/i18n';

type ViewMode = 'list' | 'map';

function cityLabel(city: string, lang: LangCode): string {
  if (city === 'new_york') {
    return lang === 'ru' ? 'Нью-Йорк' : lang === 'en' ? 'New York' : 'Nyu-York';
  }

  return lang === 'ru' ? 'Ташкент' : lang === 'en' ? 'Tashkent' : 'Toshkent';
}

function cuisineLabel(branch: RestaurantBranchItem, lang: LangCode): string {
  const value = pickLocalized(branch.projectPrimaryInfo, lang);

  if (value) {
    return value;
  }

  if (branch.projectType === 'barbershop') {
    return lang === 'ru' ? 'Формат' : lang === 'en' ? 'Format' : 'Format';
  }

  return lang === 'ru' ? 'Кухня' : lang === 'en' ? 'Cuisine' : 'Oshxona';
}

function featureLabels(branch: RestaurantBranchItem, lang: LangCode): string[] {
  if (branch.projectType === 'barbershop') {
    return [
      branch.hasVipRoom ? (lang === 'ru' ? 'VIP-кабинет' : lang === 'en' ? 'VIP room' : 'VIP kabinet') : null,
      branch.hasKidsHaircut
        ? (lang === 'ru' ? 'Детская стрижка' : lang === 'en' ? 'Kids haircut' : 'Bolalar soch turmagi')
        : null,
    ].filter((item): item is string => Boolean(item));
  }

  return [
    branch.hasBanquet ? (lang === 'ru' ? 'Банкет' : lang === 'en' ? 'Banquet' : 'Banket') : null,
    hasDelivery(branch) ? (lang === 'ru' ? 'Доставка' : lang === 'en' ? 'Delivery' : 'Yetkazish') : null,
  ].filter((item): item is string => Boolean(item));
}

function hasDelivery(branch: RestaurantBranchItem): boolean {
  return branch.projectType === 'restaurant' && branch.city === 'new_york';
}

function getImage(branch: RestaurantBranchItem): string | undefined {
  return branch.cardImage || branch.gallery[0];
}

function getHref(branch: RestaurantBranchItem, lang: LangCode): string {
  return branch.slug ? `/${lang}/restaurants/${encodeURIComponent(branch.slug)}` : `/${lang}/restaurants`;
}

function projectSearchText(project: RestaurantProjectItem, branches: RestaurantBranchItem[], lang: LangCode): string {
  return [
    pickLocalized(project.name, lang),
    ...branches.map((branch) => branch.slug || ''),
    ...branches.map((branch) => pickLocalized(branch.branchName, lang)),
  ].join(' ').toLowerCase();
}

function getProjectSortOrder(project: RestaurantProjectItem, branches: RestaurantBranchItem[], lang: LangCode): number {
  const haystack = projectSearchText(project, branches, lang);

  if (haystack.includes('doner') || haystack.includes('донер')) return 1;
  if (haystack.includes('mahalla') || haystack.includes('махалла')) return 2;
  if (haystack.includes('black') || haystack.includes('star') || haystack.includes('bsb')) return 3;
  if (haystack.includes('topor') || haystack.includes('топор')) return 4;
  if (haystack.includes('gosht') || haystack.includes('gōsht') || haystack.includes('гошт')) return 0;

  return 5;
}

function shouldGroupProject(project: RestaurantProjectItem, branches: RestaurantBranchItem[], lang: LangCode): boolean {
  const haystack = projectSearchText(project, branches, lang);

  return haystack.includes('doner') || haystack.includes('донер') || haystack.includes('black') || haystack.includes('star') || haystack.includes('bsb');
}

function AccentArrowIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className={className}>
      <path d="M3.5 9H13.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M10.2 5.4L14 9L10.2 12.6" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M6.2 8.8H17.8L18.9 18.5H5.1L6.2 8.8Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M9 8.8C9 6.8 10.3 5.4 12 5.4C13.7 5.4 15 6.8 15 8.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8.4 12.4H15.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function BanquetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M5.5 16.5H18.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M7.5 15.8C7.9 11.9 10 9.7 12 9.7C14 9.7 16.1 11.9 16.5 15.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M12 8.3V6.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4.8 18.8H19.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={`h-5 w-5 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M4.5 7L9 11.2L13.5 7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActiveMarkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="h-3.5 w-3.5 text-[color:var(--accent-brand)]">
      <path d="M3.2 7.2L5.7 9.7L10.9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M6.2 5.2H12.8V11.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 5.5L5.2 12.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M6.5 5.5H16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6.5 10H16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6.5 14.5H16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4 5.5H4.1M4 10H4.1M4 14.5H4.1" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function MapViewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 5.4L7.8 3.8L12.2 5.4L16.5 3.8V14.6L12.2 16.2L7.8 14.6L3.5 16.2V5.4Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M7.8 3.9V14.5M12.2 5.5V16" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}

function RestaurantCard({
  branch,
  lang,
}: {
  branch: RestaurantBranchItem;
  lang: LangCode;
}) {
  const title = pickLocalized(branch.branchName, lang);
  const projectName = pickLocalized(branch.projectName, lang);
  const cuisine = cuisineLabel(branch, lang);
  const image = getImage(branch);
  const features = featureLabels(branch, lang);

  return (
    <Link href={getHref(branch, lang)} className="group block">
      <article>
        <div className="relative aspect-[1.9/1] overflow-hidden border border-subtle bg-card">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover brightness-[0.8] saturate-[0.92] transition-all duration-700 group-hover:scale-[1.025] group-hover:brightness-100"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          <div className="absolute bottom-3 left-3 flex h-20 w-20 items-center justify-center md:bottom-4 md:left-4 md:h-[92px] md:w-[92px]">
            {branch.projectLogo ? (
              <Image
                src={branch.projectLogo}
                alt={projectName || title}
                fill
                sizes="92px"
                className="object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.42)]"
              />
            ) : (
              <span className="font-serif text-[22px] uppercase leading-none text-primary">
                {(projectName || title).slice(0, 2)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <h3 className="font-serif text-[25px] uppercase leading-[0.95] text-primary transition-colors group-hover:text-secondary md:text-[30px]">
              {title}
            </h3>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.04em] text-secondary">
              {features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-2">
                  <span className="text-[color:var(--accent-brand)]">
                    <AccentArrowIcon />
                  </span>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[12px] uppercase leading-tight tracking-[0.04em] text-secondary md:min-w-[230px]">
            <span className="text-[11px] text-muted">{lang === 'ru' ? 'Кухни' : lang === 'en' ? 'Cuisine' : 'Oshxona'}</span>
            <span className="text-[13px] leading-snug">{cuisine}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedRestaurantGroup({
  project,
  branches,
  lang,
  reverse = false,
}: {
  project: RestaurantProjectItem;
  branches: RestaurantBranchItem[];
  lang: LangCode;
  reverse?: boolean;
}) {
  const mainBranch = branches[0];
  const projectName = pickLocalized(project.name, lang);
  const title = projectName || pickLocalized(mainBranch.branchName, lang);
  const image = getImage(mainBranch);
  const cuisine = cuisineLabel(mainBranch, lang);
  const features = Array.from(new Set(branches.flatMap((branch) => featureLabels(branch, lang))));
  const branchLinks = branches.slice(1).map((branch) => ({
    id: branch.id,
    title: pickLocalized(branch.branchName, lang),
    href: getHref(branch, lang),
  }));

  return (
    <article className={`col-span-full grid gap-8 py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] lg:gap-12 xl:gap-16 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <Link href={getHref(mainBranch, lang)} className="group relative block aspect-[2/1] overflow-hidden border border-subtle bg-card lg:min-h-[360px]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover brightness-[0.78] saturate-[0.9] transition-all duration-700 group-hover:scale-[1.02] group-hover:brightness-100"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-4 left-4 flex h-[92px] w-[92px] items-center justify-center md:h-[108px] md:w-[108px]">
          {project.logo ? (
            <Image
              src={project.logo}
              alt={title}
              fill
              sizes="108px"
              className="object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.42)]"
            />
          ) : (
            <span className="font-serif text-[26px] uppercase leading-none text-primary">
              {title.slice(0, 2)}
            </span>
          )}
        </div>
      </Link>

      <div className="grid content-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)]">
        <div>
          <h3 className="font-serif text-[clamp(38px,5vw,74px)] uppercase leading-[0.9] tracking-[-0.03em] text-primary">
            {title}
          </h3>

          {features.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.04em] text-secondary">
              {features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-2">
                  <span className="text-[color:var(--accent-brand)]">
                    <AccentArrowIcon />
                  </span>
                  {feature}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid max-w-[520px] grid-cols-[86px_1fr] gap-x-7 gap-y-2 uppercase tracking-[0.04em]">
            <span className="text-[12px] text-muted">{lang === 'ru' ? 'Кухни' : lang === 'en' ? 'Cuisine' : 'Oshxona'}</span>
            <span className="text-[15px] leading-snug text-secondary md:text-[17px]">{cuisine}</span>
          </div>
        </div>

        <div className="pt-5 lg:pl-7 lg:pt-0">
          <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Другие филиалы' : lang === 'en' ? 'Other branches' : 'Boshqa filiallar'}
          </p>
          <div className="grid gap-3">
            {branchLinks.map((branch) => (
              <Link
                key={branch.id}
                href={branch.href}
                className="group inline-flex items-start justify-between gap-4 border-b border-subtle pb-3 text-[14px] leading-snug text-secondary transition-colors hover:text-primary"
              >
                <span>{branch.title}</span>
                <span className="text-muted transition-transform group-hover:translate-x-1">
                  <ExternalArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RestaurantsConceptPage({
  data,
  lang,
}: {
  data: RestaurantsDirectoryData;
  lang: LangCode;
}) {
  const searchParams = useSearchParams();
  const shouldOpenDeliveryFilter = searchParams.get('delivery') === '1';
  const cityOptions = data.availableCities.length ? data.availableCities : ['tashkent'];
  const initialCity =
    shouldOpenDeliveryFilter
      ? cityOptions.find((city) =>
          data.branches.some((branch) => branch.city === city && hasDelivery(branch))
        ) || cityOptions[0]
      : cityOptions[0];
  const [activeCity, setActiveCity] = useState(initialCity);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [isCuisineOpen, setIsCuisineOpen] = useState(false);
  const [banquetOnly, setBanquetOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(shouldOpenDeliveryFilter);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const cuisineRef = useRef<HTMLDivElement | null>(null);
  const cityBranches = data.branches.filter((branch) => branch.city === activeCity);
  const cuisineOptions = Array.from(new Set(cityBranches.map((branch) => cuisineLabel(branch, lang)).filter(Boolean)));
  const branchMatchesFilters = (branch: RestaurantBranchItem) => {
    if (branch.city !== activeCity) {
      return false;
    }

    if (cuisineFilter !== 'all' && cuisineLabel(branch, lang) !== cuisineFilter) {
      return false;
    }

    if (banquetOnly && !branch.hasBanquet) {
      return false;
    }

    if (deliveryOnly && !hasDelivery(branch)) {
      return false;
    }

    return true;
  };
  const filteredProjectGroups = data.projects
    .map((project) => ({
      project,
      branches: project.branches.filter(branchMatchesFilters),
    }))
    .filter((group) => group.branches.length > 0)
    .sort((a, b) => {
      const orderA = getProjectSortOrder(a.project, a.branches, lang);
      const orderB = getProjectSortOrder(b.project, b.branches, lang);

      if (orderA !== orderB) return orderA - orderB;

      return pickLocalized(a.project.name, lang).localeCompare(pickLocalized(b.project.name, lang), lang);
    });
  const filteredBranches = filteredProjectGroups.flatMap((group) => group.branches);
  const [activeBranchId, setActiveBranchId] = useState(filteredBranches[0]?.id || '');
  const mapActiveBranch =
    filteredBranches.find((branch) => branch.id === activeBranchId) || filteredBranches[0] || null;

  const ui = {
    region: lang === 'ru' ? 'Регион:' : lang === 'en' ? 'Region:' : 'Hudud:',
    list: lang === 'ru' ? 'Списком' : lang === 'en' ? 'List' : 'Ro‘yxat',
    map: lang === 'ru' ? 'На карте' : lang === 'en' ? 'Map' : 'Xarita',
    allCuisines: lang === 'ru' ? 'Все кухни' : lang === 'en' ? 'All cuisines' : 'Barcha oshxonalar',
    banquet: lang === 'ru' ? 'Есть банкетный зал' : lang === 'en' ? 'Banquet hall' : 'Banket zali bor',
    delivery: lang === 'ru' ? 'Есть доставка' : lang === 'en' ? 'Delivery' : 'Yetkazish bor',
    empty:
      lang === 'ru'
        ? 'По выбранным фильтрам ресторанов нет.'
        : lang === 'en'
          ? 'No restaurants match the selected filters.'
          : 'Tanlangan filtrlar bo‘yicha restoranlar yo‘q.',
  };

  const handleCityChange = (city: string) => {
    setActiveCity(city);
    setIsRegionOpen(false);
    setCuisineFilter('all');
    setIsCuisineOpen(false);
    setBanquetOnly(false);
    setDeliveryOnly(false);
    setActiveBranchId('');
  };

  useEffect(() => {
    if (!isCuisineOpen && !isRegionOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!target || !(target instanceof Node)) return;

      if (isRegionOpen && !regionRef.current?.contains(target)) {
        setIsRegionOpen(false);
      }

      if (!cuisineRef.current?.contains(target)) {
        setIsCuisineOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCuisineOpen(false);
        setIsRegionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isCuisineOpen, isRegionOpen]);

  return (
    <main className="min-h-screen bg-base pt-[120px] text-primary md:pt-[150px]">
      <section className="mx-auto max-w-[1920px] px-4 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[920px] flex-col items-center text-center">
          <div ref={regionRef} className="inline-flex items-baseline justify-center gap-x-6 text-left">
            <span className="font-serif text-[42px] uppercase leading-none md:text-[62px]">
              {ui.region}
            </span>
            <div className="relative inline-flex">
              <button
                type="button"
                onClick={() => setIsRegionOpen((value) => !value)}
                className="group relative inline-flex items-baseline gap-3 border-b border-subtle pb-1 pr-1 text-left text-[34px] uppercase leading-none text-primary outline-none transition-colors hover:border-strong md:text-[58px]"
                aria-expanded={isRegionOpen}
              >
                <span>{cityLabel(activeCity, lang)}</span>
                <ChevronDownIcon open={isRegionOpen} />
                <span className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] bg-primary transition-all duration-200 ${isRegionOpen ? 'w-1/2' : 'w-0'}`} />
                <span className={`pointer-events-none absolute bottom-0 right-1/2 h-[2px] bg-primary transition-all duration-200 ${isRegionOpen ? 'w-1/2' : 'w-0'}`} />
              </button>

              <div
                className={`absolute left-0 top-[calc(100%+12px)] z-40 w-[220px] overflow-hidden border border-subtle bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                  isRegionOpen
                    ? 'translate-y-0 opacity-100 visible'
                    : '-translate-y-2 opacity-0 invisible pointer-events-none'
                }`}
              >
                {cityOptions.map((city) => {
                  const active = activeCity === city;

                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCityChange(city)}
                      className={`flex w-full items-center justify-between border-b border-subtle px-4 py-3 text-left text-[12px] uppercase tracking-[0.08em] transition-colors last:border-b-0 ${
                        active ? 'bg-[color:var(--interactive-hover)] text-primary' : 'text-secondary hover:bg-[color:var(--interactive-bg)] hover:text-primary'
                      }`}
                    >
                      <span>{cityLabel(city, lang)}</span>
                      {active ? <ActiveMarkIcon /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-[920px] gap-6 lg:max-w-[1160px] lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20">
          <div className="inline-flex w-fit rounded-full border border-subtle bg-[color:var(--interactive-bg)] p-1">
            {(['list', 'map'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-[13px] uppercase transition-colors ${
                  viewMode === mode ? 'bg-[color:var(--interactive-strong)] text-inverse' : 'text-muted hover:text-primary'
                }`}
              >
                {mode === 'list' ? <ListViewIcon /> : <MapViewIcon />}
                {mode === 'list' ? ui.list : ui.map}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(180px,260px)_auto_auto] md:items-center md:justify-end md:gap-9">
            <div ref={cuisineRef} className="relative min-w-[220px] pt-4">
              <span
                className={`pointer-events-none absolute left-0 top-0 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  isCuisineOpen || cuisineFilter !== 'all' ? 'text-primary' : 'text-muted'
                }`}
              >
                {lang === 'ru' ? 'Кухня' : lang === 'en' ? 'Cuisine' : 'Oshxona'}
              </span>
              <button
                type="button"
                onClick={() => setIsCuisineOpen((value) => !value)}
                className="group relative flex h-12 w-full items-center justify-between border-b border-subtle text-left text-[13px] uppercase text-primary outline-none transition-colors hover:border-strong"
                aria-expanded={isCuisineOpen}
              >
                <span className={cuisineFilter === 'all' ? 'text-secondary' : 'text-primary'}>
                  {cuisineFilter === 'all' ? ui.allCuisines : cuisineFilter}
                </span>
                <ChevronDownIcon open={isCuisineOpen} />
                <span className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] bg-primary transition-all duration-200 ${isCuisineOpen ? 'w-1/2' : 'w-0'}`} />
                <span className={`pointer-events-none absolute bottom-0 right-1/2 h-[2px] bg-primary transition-all duration-200 ${isCuisineOpen ? 'w-1/2' : 'w-0'}`} />
              </button>

              <div
                className={`absolute left-0 right-0 top-[68px] z-30 max-h-[260px] overflow-y-auto border border-subtle bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                  isCuisineOpen
                    ? 'translate-y-0 opacity-100 visible'
                    : '-translate-y-2 opacity-0 invisible pointer-events-none'
                }`}
              >
                {[ui.allCuisines, ...cuisineOptions].map((item, index) => {
                  const value = index === 0 ? 'all' : item;
                  const active = cuisineFilter === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setCuisineFilter(value);
                        setIsCuisineOpen(false);
                      }}
                      className={`flex w-full items-center justify-between border-b border-subtle px-4 py-3 text-left text-[12px] uppercase tracking-[0.08em] transition-colors last:border-b-0 ${
                        active ? 'bg-[color:var(--interactive-hover)] text-primary' : 'text-secondary hover:bg-[color:var(--interactive-bg)] hover:text-primary'
                      }`}
                    >
                      <span>{item}</span>
                      {active ? <ActiveMarkIcon /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBanquetOnly((value) => !value)}
              className={`inline-flex items-center gap-2 text-left text-[13px] uppercase transition-colors ${
                banquetOnly ? 'text-[color:var(--accent-brand)]' : 'text-secondary hover:text-primary'
              }`}
            >
              <BanquetIcon />
              {ui.banquet}
            </button>

            <button
              type="button"
              onClick={() => setDeliveryOnly((value) => !value)}
              className={`inline-flex items-center gap-2 text-left text-[13px] uppercase transition-colors ${
                deliveryOnly ? 'text-[color:var(--accent-brand)]' : 'text-secondary hover:text-primary'
              }`}
            >
              <DeliveryIcon />
              {ui.delivery}
            </button>
          </div>
        </div>
      </section>

      {viewMode === 'list' ? (
        <section className="grid w-full gap-x-7 gap-y-16 px-4 pb-24 pt-10 md:grid-cols-2 md:px-8 lg:grid-cols-3 lg:px-12">
          {filteredProjectGroups.length ? (
            filteredProjectGroups.map((group) =>
              group.branches.length > 1 && shouldGroupProject(group.project, group.branches, lang) ? (
                <FeaturedRestaurantGroup
                  key={group.project.id}
                  project={group.project}
                  branches={group.branches}
                  lang={lang}
                  reverse={filteredProjectGroups.filter((item) => item.branches.length > 1 && shouldGroupProject(item.project, item.branches, lang)).findIndex((item) => item.project.id === group.project.id) % 2 === 1}
                />
              ) : (
                group.branches.map((branch) => (
                  <RestaurantCard
                    key={branch.id}
                    branch={branch}
                    lang={lang}
                  />
                ))
              )
            )
          ) : (
            <p className="col-span-full py-20 text-center text-[15px] uppercase tracking-[0.08em] text-muted">
              {ui.empty}
            </p>
          )}
        </section>
      ) : (
        <section className="grid min-h-[620px] border-t border-subtle lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-h-[520px]">
            <RestaurantsMap
              branches={filteredBranches}
              activeBranchId={mapActiveBranch?.id}
              lang={lang}
              onSelectBranch={setActiveBranchId}
            />
          </div>

          <aside className="max-h-[720px] overflow-y-auto border-l border-subtle bg-panel">
            {filteredBranches.map((branch) => {
              const title = pickLocalized(branch.branchName, lang);
              const cuisine = cuisineLabel(branch, lang);
              const active = branch.id === mapActiveBranch?.id;

              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setActiveBranchId(branch.id)}
                  className={`block w-full border-b border-subtle px-8 py-6 text-left transition-colors ${
                    active ? 'bg-[color:var(--interactive-hover)]' : 'hover:bg-[color:var(--interactive-bg)]'
                  }`}
                >
                  <span className="block font-serif text-[22px] uppercase leading-tight text-primary">
                    {title}
                  </span>
                  <span className="mt-4 grid grid-cols-[60px_1fr] gap-5 text-[10px] uppercase leading-tight tracking-[0.04em] text-secondary">
                    <span className="text-muted">{lang === 'ru' ? 'Кухни' : lang === 'en' ? 'Cuisine' : 'Oshxona'}</span>
                    <span>{cuisine}</span>
                  </span>
                  {hasDelivery(branch) ? (
                    <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase text-primary">
                      <DeliveryIcon />
                      {ui.delivery}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </aside>
        </section>
      )}
    </main>
  );
}
