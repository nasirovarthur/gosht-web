'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ImageSlider from './ImageSlider';
import { useLanguage } from '@/context/LanguageContext';

interface RestaurantDetailProps {
  restaurant: {
    name: string;
    branchName: string;
    address: string;
    phone: string;
    workingHours: string;
    averageCheck: string;
    description: string;
    descriptionExtended?: string;
    descriptionAdditional?: string;
    yearOpened?: string;
    menu: string;
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

type YMapInstance = {
  destroy: () => void;
  behaviors: {
    disable: (name: string) => void;
  };
  geoObjects: {
    add: (geoObject: unknown) => void;
  };
};

type YMapsApi = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: { center: [number, number]; zoom: number; controls: string[] },
    options: { suppressMapOpenBlock: boolean; maxZoom: number }
  ) => YMapInstance;
  Placemark: new (
    coordinates: [number, number],
    properties: { balloonContentHeader: string; balloonContentBody: string },
    options: { preset: string }
  ) => unknown;
};

declare global {
  interface Window {
    ymaps?: YMapsApi;
  }
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const { lang } = useLanguage();
  const headerOffset = 136;
  const extraTopOffset = 64;
  const topOffset = headerOffset + extraTopOffset;
  const bottomOffset = headerOffset;

  const chefBlock = {
    title: restaurant.chef?.title || (lang === 'uz' ? 'OSHPAZ BOSHLIG‘I' : lang === 'en' ? 'CHEF' : 'ШЕФ-ПОВАР'),
    name: restaurant.chef?.name || (lang === 'uz' ? 'GOSHT bosh oshpazi' : lang === 'en' ? 'GOSHT Head Chef' : 'Шеф-повар GOSHT'),
    description:
      restaurant.chef?.description ||
      (lang === 'uz'
        ? 'Mualliflik yondashuvi, mavsumiy mahsulotlar va klassik texnikalar bilan zamonaviy uslub uyg‘unligi.'
        : lang === 'en'
          ? 'Authorial approach, seasonal products, and a balance of classic techniques with modern presentation.'
          : 'Авторский подход к мясной кухне, сезонные продукты и баланс классических техник с современными подачами.'),
    image:
      restaurant.chef?.image ||
      'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=1100&h=1500&fit=crop',
  };
  const ui = {
    cuisine: lang === 'uz' ? 'OSHXONA' : lang === 'en' ? 'CUISINE' : 'КУХНЯ',
    averageCheck: lang === 'uz' ? "O'RTACHA CHEK" : lang === 'en' ? 'AVERAGE CHECK' : 'СРЕДНИЙ ЧЕК',
    addressContacts: lang === 'uz' ? 'MANZIL VA ALOQA' : lang === 'en' ? 'ADDRESS & CONTACTS' : 'АДРЕС И КОНТАКТЫ',
    links: lang === 'uz' ? 'HAVOLALAR' : lang === 'en' ? 'LINKS' : 'ССЫЛКИ',
    workingHours: lang === 'uz' ? 'Ish vaqti' : lang === 'en' ? 'Working hours' : 'Режим работы',
    menu: lang === 'uz' ? 'Restoran menyusi' : lang === 'en' ? 'Restaurant menu' : 'Меню ресторана',
    openedYear: lang === 'uz' ? 'Ochilgan yil' : lang === 'en' ? 'Opened in' : 'Год открытия',
    openMap: lang === 'uz' ? 'Xaritani ochish' : lang === 'en' ? 'Open map' : 'Открыть карту',
    aboutFallback:
      lang === 'uz'
        ? 'Bu joyda restoran kontseptsiyasi, atmosferasi va asosiy g‘oyasi haqida qisqa tavsif joylashadi.'
        : lang === 'en'
          ? 'A short description of the restaurant concept, atmosphere, and key idea goes here.'
          : 'Здесь размещается краткое описание концепции ресторана, атмосферы и основной идеи.',
    detailsFallback:
      lang === 'uz'
        ? 'Interyer va servis tafsilotlari, mehmon tajribasi hamda oshxona yondashuvi haqida qo‘shimcha ma’lumot.'
        : lang === 'en'
          ? 'Additional details about interior, service, guest experience, and the kitchen approach.'
          : 'Дополнительные детали об интерьере, сервисе, опыте гостей и подходе кухни.',
    detailsSecondaryFallback:
      lang === 'uz'
        ? 'Taomlar mavsumiy mahsulotlar asosida tayyorlanadi, taqdimot esa zamonaviy uslubda quriladi.'
        : lang === 'en'
          ? 'Dishes are built around seasonal ingredients, with a modern style of presentation.'
          : 'Блюда строятся вокруг сезонных продуктов, а подача выстроена в современном стиле.',
    extraFallback:
      lang === 'uz'
        ? 'Asosiy menyudan tashqari maxsus takliflar muntazam yangilanadi.'
        : lang === 'en'
          ? 'In addition to the main menu, special offers are regularly updated.'
          : 'Помимо основного меню, мы регулярно обновляем специальные позиции.',
  };
  const [mapLat, mapLon] = getMapCenter(restaurant.mapEmbedUrl, restaurant.mapLink);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isMobile) return;
    const speedMultiplier = 10;
    scrollTargetRef.current = container.scrollLeft;

    const animate = () => {
      const current = container.scrollLeft;
      const target = scrollTargetRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.5) {
        container.scrollLeft = target;
        scrollRafRef.current = null;
        return;
      }

      container.scrollLeft = current + diff * 0.4;
      scrollRafRef.current = requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }

      event.preventDefault();
      if (event.deltaY === 0) return;

      let baseDelta = event.deltaY;
      if (event.deltaMode === 1) {
        baseDelta *= 16;
      } else if (event.deltaMode === 2) {
        baseDelta *= container.clientWidth;
      }

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const nextTarget = scrollTargetRef.current + baseDelta * speedMultiplier;
      scrollTargetRef.current = Math.max(0, Math.min(maxScrollLeft, nextTarget));

      if (scrollRafRef.current === null) {
        scrollRafRef.current = requestAnimationFrame(animate);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [isMobile]);

  useEffect(() => {
    let isCancelled = false;
    const scriptId = 'yandex-maps-api-script';

    const buildMap = () => {
      if (isCancelled || !mapContainerRef.current || !window.ymaps) return;
      const ymaps = window.ymaps;
      ymaps.ready(() => {
        if (isCancelled || !mapContainerRef.current) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        const map = new ymaps.Map(
          mapContainerRef.current,
          {
            center: [mapLat, mapLon],
            zoom: 15,
            controls: ['zoomControl', 'geolocationControl'],
          },
          {
            suppressMapOpenBlock: true,
            maxZoom: 18,
          }
        );

        map.behaviors.disable('scrollZoom');
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          map.behaviors.disable('drag');
        }

        const placemark = new ymaps.Placemark(
          [mapLat, mapLon],
          {
            balloonContentHeader: restaurant.branchName,
            balloonContentBody: restaurant.address,
          },
          {
            preset: 'islands#redDotIcon',
          }
        );

        map.geoObjects.add(placemark);
        mapRef.current = map;
      });
    };

    const onScriptError = () => {
      if (!isCancelled) {
        setMapLoadFailed(true);
      }
    };

    if (window.ymaps) {
      buildMap();
      return () => {
        isCancelled = true;
        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
      };
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener('load', buildMap);
    script.addEventListener('error', onScriptError);

    return () => {
      isCancelled = true;
      script?.removeEventListener('load', buildMap);
      script?.removeEventListener('error', onScriptError);
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [mapLat, mapLon, restaurant.address, restaurant.branchName]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isMobile) return;

    const handleScroll = () => {
      scrollTargetRef.current = container.scrollLeft;
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return (
    <div className="w-full h-screen bg-base overflow-hidden box-border">
      <div
        ref={scrollContainerRef}
        className={`
          w-full h-full
          ${isMobile ? 'overflow-y-auto overflow-x-hidden' : 'overflow-x-auto overflow-y-hidden'}
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          touchAction: 'auto',
          paddingTop: `${topOffset}px`,
          paddingBottom: `${bottomOffset}px`,
        }}
      >
        <div className={`${isMobile ? 'flex flex-col gap-y-[48px]' : 'flex flex-row gap-x-[12px]'} h-full min-h-full`}>
          <section className="flex-shrink-0 w-screen min-h-full flex items-start page-x">
            <div className="w-full h-full flex flex-col lg:flex-row items-start gap-10 lg:gap-12 xl:gap-16">
              <div className="w-full lg:w-[58%] xl:w-[56%] h-auto flex flex-col gap-8 px-0">
                <h1 className="text-white text-h1 font-light mb-6 lg:mb-8 max-w-[18ch] leading-[1.05] break-words">
                  {restaurant.branchName}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                  <div>
                    <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">{ui.cuisine}</p>
                    <p className="text-body-lg text-white font-light break-words">{restaurant.name}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">{ui.averageCheck}</p>
                      <p className="text-body-lg text-white font-light break-words">{restaurant.averageCheck}</p>
                    </div>

                    <div className="pt-4 lg:pt-6 border-t border-white/10">
                      <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">{ui.addressContacts}</p>
                      <p className="text-body text-white font-light mb-2 lg:mb-3 leading-relaxed break-words">
                        {restaurant.address}
                      </p>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-label text-white/40 font-light">{ui.links}</p>
                    <div className="space-y-3">
                      <p className="text-body text-white/75 font-light">{ui.workingHours}: {restaurant.workingHours}</p>
                      <a
                        href={restaurant.menu}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        {ui.menu}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[42%] xl:w-[44%] h-[56vh] lg:h-[calc(100vh-272px)] relative flex items-start justify-center px-0">
                {restaurant.gallery?.length ? (
                  <ImageSlider images={restaurant.gallery} orientation={isMobile ? 'horizontal' : 'vertical'} />
                ) : null}
              </div>
            </div>
          </section>

          <section className="flex-shrink-0 w-screen min-h-full flex items-start page-x py-0">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-8 md:gap-12 lg:gap-14 xl:gap-20">
              <div>
                <h2 className="text-title-lg text-white font-light leading-[1.25]">
                  {restaurant.description || ui.aboutFallback}
                </h2>
              </div>

              <div>
                <p className="text-body text-white/70 font-light leading-relaxed mb-6">
                  {restaurant.descriptionExtended || ui.detailsFallback}
                </p>
                <p className="text-body text-white/70 font-light leading-relaxed">
                  {ui.detailsSecondaryFallback}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="text-body text-white/70 font-light leading-relaxed mb-6 lg:mb-8">
                  {restaurant.descriptionAdditional || ui.extraFallback}
                </p>
                {restaurant.yearOpened && (
                  <p className="text-label text-white/40 font-light mt-auto pt-4">
                    {ui.openedYear}: {restaurant.yearOpened}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="flex-shrink-0 w-screen min-h-full flex items-start page-x">
            <div className="w-full max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[auto_minmax(360px,520px)_minmax(0,1fr)] gap-8 lg:gap-8 items-start">
              <div className="hidden lg:flex justify-center">
                <span
                  className="text-title text-white/35 tracking-[0.18em] leading-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {chefBlock.title}
                </span>
              </div>

              <div className="w-full max-w-[520px] aspect-[3/4] relative overflow-hidden bg-card">
                <Image src={chefBlock.image} alt={chefBlock.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 520px" />
              </div>

              <div className="w-full max-w-[620px] lg:pt-2">
                <p className="text-ui text-white/40 mb-4 lg:hidden">{chefBlock.title}</p>
                <h3 className="text-title-lg text-white font-light mb-5">{chefBlock.name}</h3>
                <p className="text-body text-white/70 font-light leading-relaxed">{chefBlock.description}</p>
              </div>
            </div>
          </section>

          <section className="flex-shrink-0 w-screen min-h-full h-full flex items-start">
            <div className="w-full h-full">
              <div
                className="w-full bg-card relative"
                style={{ height: isMobile ? '62vh' : `calc(100vh - ${topOffset + bottomOffset}px)` }}
              >
                {restaurant.mapEmbedUrl && !mapLoadFailed ? (
                  <>
                    <div ref={mapContainerRef} className="w-full h-full" />
                    <a
                      href={restaurant.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-4 bottom-4 px-4 py-2 text-ui text-white border border-white/20 bg-black/55 hover:bg-black/75 transition-colors"
                    >
                      {ui.openMap}
                    </a>
                  </>
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <a
                      href={restaurant.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/70 transition-colors text-base lg:text-lg font-light border-b border-white/20 hover:border-white/40 pb-1"
                    >
                      {ui.openMap}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
