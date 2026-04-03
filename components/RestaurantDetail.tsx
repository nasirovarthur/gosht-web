'use client';

import Image from 'next/image';
import ImageSlider from './ImageSlider';
import YandexMap from './restaurant/YandexMap';
import Reveal from './Reveal';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { useLanguage } from '@/context/LanguageContext';
import { pickLocalized, translations } from '@/types/i18n';

interface RestaurantDetailProps {
  restaurant: {
    name: string;
    projectType?: "restaurant" | "barbershop";
    primaryInfoValue?: string;
    branchName: string;
    address: string;
    phone: string;
    workingHours: string;
    averageCheck: string;
    description: string;
    descriptionExtended?: string;
    descriptionAdditional?: string;
    yearOpened?: string;
    menuFiles: string[];
    gallery: string[];
    mapLink: string;
    mapEmbedUrl?: string;
    chef?: {
      title?: string;
      name?: string;
      description?: string;
      image?: string;
    };
  };
}

function getMapCenter(mapEmbedUrl?: string, mapLink?: string): [number, number] {
  const candidates = [mapEmbedUrl, mapLink].filter(Boolean) as string[];
  for (const rawValue of candidates) {
    let decoded = rawValue;
    try {
      decoded = decodeURIComponent(rawValue);
    } catch {
      decoded = rawValue;
    }

    const llMatch = decoded.match(/[?&]ll=([-0-9.]+),\s*([-0-9.]+)/);
    if (llMatch) {
      const lon = Number(llMatch[1]);
      const lat = Number(llMatch[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        return [lat, lon];
      }
    }
  }
  return [41.311081, 69.279737];
}

export default function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  const { lang } = useLanguage();
  const scrollContainerRef = useHorizontalScroll(true);
  const t = translations.restaurantDetail;

  const chefTitle = restaurant.chef?.title?.trim() || '';
  const chefName = restaurant.chef?.name?.trim() || '';
  const chefDescription = restaurant.chef?.description?.trim() || '';
  const chefImage = restaurant.chef?.image?.trim() || '';
  const hasChefBlock = Boolean(chefTitle || chefName || chefDescription || chefImage);

  const [mapLat, mapLon] = getMapCenter(restaurant.mapEmbedUrl, restaurant.mapLink);
  const hasGallery = Array.isArray(restaurant.gallery) && restaurant.gallery.length > 0;
  const menuFiles = Array.isArray(restaurant.menuFiles) ? restaurant.menuFiles.filter(Boolean) : [];
  const hasMenuLink = menuFiles.length > 0;
  const primaryInfoLabel =
    restaurant.projectType === 'barbershop'
      ? lang === 'ru'
        ? 'ФОРМАТ'
        : lang === 'en'
          ? 'FORMAT'
          : 'FORMAT'
      : pickLocalized(t.cuisine, lang);
  const primaryInfoValue = (restaurant.primaryInfoValue || restaurant.name || '').trim();

  return (
    <main className="min-h-screen bg-base pt-[104px] pb-24 text-white md:pt-[124px] md:pb-28">
      <div
        ref={scrollContainerRef}
        className="overflow-x-hidden overflow-y-visible lg:overflow-x-auto overscroll-x-contain"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex flex-col gap-y-16 md:gap-y-20 lg:flex-row lg:items-start lg:gap-x-10 xl:gap-x-14 2xl:gap-x-16">
          <section className="page-x lg:w-screen lg:flex-shrink-0">
            <div className="w-full">
              <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-12">
                <Reveal as="div" distance={42} blur={10}>
                  <h1 className="max-w-[16ch] text-h1 font-light leading-[1.05] break-words">
                    {restaurant.branchName}
                  </h1>

                  <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3 xl:gap-9">
                    <div>
                      <p className="mb-3 text-label font-light text-white/40">
                        {primaryInfoLabel}
                      </p>
                      <p className="text-body-lg font-light text-white break-words">
                        {primaryInfoValue}
                      </p>
                    </div>

                    <div>
                      <p className="mb-3 text-label font-light text-white/40">
                        {pickLocalized(t.averageCheck, lang)}
                      </p>
                      <p className="text-body-lg font-light text-white break-words">
                        {restaurant.averageCheck}
                      </p>

                      <div className="mt-7 border-t border-white/10 pt-7">
                        <p className="mb-3 text-label font-light text-white/40">
                          {pickLocalized(t.addressContacts, lang)}
                        </p>
                        <p className="mb-3 text-body font-light leading-relaxed text-white break-words">
                          {restaurant.address}
                        </p>
                        {restaurant.phone ? (
                          <a
                            href={`tel:${restaurant.phone}`}
                            className="inline-block border-b border-white/20 pb-1 text-body font-light text-white transition-colors hover:border-white/40 hover:text-white/75"
                          >
                            {restaurant.phone}
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-label font-light text-white/40">
                        {pickLocalized(t.links, lang)}
                      </p>
                      <div className="space-y-3">
                        <p className="text-body font-light text-white/75">
                          {pickLocalized(t.workingHours, lang)}: {restaurant.workingHours}
                        </p>
                        {hasMenuLink
                          ? menuFiles.map((menuUrl, menuIndex) => (
                              <a
                                key={`${restaurant.branchName}-menu-${menuIndex}`}
                                href={menuUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block border-b border-white/20 pb-1 text-body font-light text-white transition-colors hover:border-white/40 hover:text-white/75"
                              >
                                {menuFiles.length === 1
                                  ? pickLocalized(t.menu, lang)
                                  : lang === 'ru'
                                    ? `Меню ${menuIndex + 1}`
                                    : lang === 'en'
                                      ? `Menu ${menuIndex + 1}`
                                      : `Menyu ${menuIndex + 1}`}
                              </a>
                            ))
                          : null}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal as="div" delay={120} variant="right" distance={46} blur={0}>
                  {hasGallery ? (
                    <>
                      <div className="lg:hidden">
                        <ImageSlider images={restaurant.gallery} orientation="horizontal" effect="projects" maskTopEdge altPrefix={restaurant.branchName || restaurant.name} />
                      </div>
                      <div className="hidden lg:block">
                        <ImageSlider images={restaurant.gallery} orientation="vertical" effect="projects" maskTopEdge altPrefix={restaurant.branchName || restaurant.name} />
                      </div>
                    </>
                  ) : (
                    <div className="flex aspect-[16/10] lg:aspect-[5/6] w-full items-center justify-center border border-white/10 bg-card px-6 text-center text-body text-white/48">
                      {lang === 'ru'
                        ? 'Добавьте изображения в галерею филиала в Sanity.'
                        : lang === 'en'
                          ? 'Add branch gallery images in Sanity.'
                          : 'Filial galereyasiga rasmlarni Sanity orqali qo‘shing.'}
                    </div>
                  )}
                </Reveal>
              </div>
            </div>
          </section>

          <section className="page-x border-t border-white/10 pt-12 lg:w-screen lg:flex-shrink-0">
            <div className="w-full grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:gap-14">
              <Reveal as="div" distance={34} blur={8}>
                <h2 className="max-w-[18ch] font-light uppercase font-serif tracking-[-0.025em] leading-[1.06] text-[clamp(34px,3.6vw,62px)]">
                  {restaurant.description || pickLocalized(t.aboutFallback, lang)}
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 xl:gap-12">
                <Reveal as="div" delay={90} distance={30} blur={8}>
                  <p className="text-body font-light leading-relaxed text-white/72">
                    {restaurant.descriptionExtended || pickLocalized(t.detailsFallback, lang)}
                  </p>
                  <p className="mt-6 text-body font-light leading-relaxed text-white/72">
                    {pickLocalized(t.detailsSecondaryFallback, lang)}
                  </p>
                </Reveal>

                <Reveal as="div" delay={150} distance={30} blur={8}>
                  <p className="text-body font-light leading-relaxed text-white/72">
                    {restaurant.descriptionAdditional || pickLocalized(t.extraFallback, lang)}
                  </p>
                  {restaurant.yearOpened && (
                    <p className="mt-8 pt-4 text-label font-light text-white/40 md:mt-12">
                      {pickLocalized(t.openedYear, lang)}: {restaurant.yearOpened}
                    </p>
                  )}
                </Reveal>
              </div>
            </div>
          </section>

          {hasChefBlock ? (
            <section className="page-x border-t border-white/10 pt-12 lg:w-screen lg:flex-shrink-0">
              <div className="w-full grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,460px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(360px,560px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
                {chefImage ? (
                  <Reveal as="div" distance={34} blur={8}>
                    <div className="relative aspect-[3/4] w-full max-w-[400px] xl:max-w-[460px] 2xl:max-w-[560px] overflow-hidden border border-white/10 bg-card">
                      <Image
                        src={chefImage}
                        alt={chefName || (lang === 'ru' ? 'Ведущий специалист' : lang === 'en' ? 'Lead specialist' : 'Bosh mutaxassis')}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, (max-width: 1535px) 460px, 560px"
                      />
                    </div>
                  </Reveal>
                ) : null}

                <Reveal as="div" delay={110} variant="right" distance={34}>
                  {chefTitle ? (
                    <p className="text-label font-light text-white/40">
                      {chefTitle}
                    </p>
                  ) : null}
                  {chefName ? (
                    <h3 className="mt-5 text-title-lg font-light text-white">
                      {chefName}
                    </h3>
                  ) : null}
                  {chefDescription ? (
                    <p className="mt-6 max-w-[54ch] text-body font-light leading-relaxed text-white/72">
                      {chefDescription}
                    </p>
                  ) : null}
                </Reveal>
              </div>
            </section>
          ) : null}

          <section className="page-x border-t border-white/10 pt-12 lg:w-screen lg:flex-shrink-0">
            <div className="w-full">
              <Reveal as="div" distance={26} blur={6}>
                {restaurant.mapEmbedUrl ? (
                  <YandexMap
                    center={[mapLat, mapLon]}
                    branchName={restaurant.branchName}
                    address={restaurant.address}
                    mapLink={restaurant.mapLink}
                    openMapLabel={pickLocalized(t.openMap, lang)}
                    height="min(72vh, 760px)"
                  />
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center border border-white/10 bg-card">
                    <a
                      href={restaurant.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-white/20 pb-1 text-base font-light text-white transition-colors hover:border-white/40 hover:text-white/75 lg:text-lg"
                    >
                      {pickLocalized(t.openMap, lang)}
                    </a>
                  </div>
                )}
              </Reveal>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
