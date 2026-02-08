'use client';

import { useEffect, useRef, useState } from 'react';
import ImageSlider from './ImageSlider';

interface RestaurantDetailProps {
  restaurant: {
    name: string;
    branchName: string;
    address: string;
    phone: string;
    whatsapp?: string;
    workingHours: string;
    averageCheck: string;
    description: string;
    descriptionExtended?: string;
    yearOpened?: string;
    menu: string;
    gallery: string[];
    mapLink: string;
    mapEmbedUrl?: string;
  };
}

export default function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const headerOffset = 136;

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
    <div
      className="w-full h-screen bg-base overflow-hidden box-border"
    >
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
          paddingTop: `${headerOffset}px`,
          paddingBottom: `${headerOffset}px`,
        }}
      >
        <div
          className={`${isMobile ? 'flex flex-col gap-y-[120px]' : 'flex flex-row gap-x-[120px]'} h-full min-h-full`}
        >
          <section className="flex-shrink-0 w-screen min-h-full flex items-start lg:mr-[120px] page-x">
            <div className="w-full h-full flex flex-col lg:flex-row gap-12 lg:gap-[var(--section-y-lg)] 2xl:gap-[calc(var(--section-y-lg)+40px)]">
              <div className="w-full lg:w-1/2 2xl:w-[520px] 2xl:flex-none h-auto lg:h-full flex flex-col gap-8 px-0">
                <h1 className="text-white text-h1 font-light mb-8 lg:mb-12">
                  {restaurant.branchName}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 2xl:gap-x-[80px] 2xl:gap-y-[28px]">
                  <div>
                    <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">
                      КУХНИ
                    </p>
                    <p className="text-body-lg text-white font-light">
                      {restaurant.name}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">
                        СРЕДНИЙ ЧЕК
                      </p>
                      <p className="text-body-lg text-white font-light">
                        {restaurant.averageCheck}
                      </p>
                    </div>

                    <div className="pt-4 lg:pt-6 border-t border-white/10">
                      <p className="text-label text-white/40 mb-2 lg:mb-3 font-light">
                        АДРЕС И КОНТАКТЫ
                      </p>
                      <p className="text-body text-white font-light mb-2 lg:mb-3 leading-relaxed">
                        {restaurant.address}
                      </p>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        {restaurant.phone}
                      </a>
                      {restaurant.whatsapp && (
                        <>
                          <br />
                          <a
                            href={restaurant.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1 mt-2"
                          >
                            {restaurant.whatsapp}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-label text-white/40 font-light">
                      ССЫЛКИ
                    </p>
                    <div className="space-y-3">
                      <a
                        href="#"
                        className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        Режим работы
                      </a>
                      <br />
                      <a
                        href={restaurant.menu}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-body text-white hover:text-white/70 transition-colors font-light border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        Меню ресторана
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 h-[60vh] lg:h-full relative flex items-center justify-center px-0 2xl:pr-[40px]">
                {restaurant.gallery?.length ? (
                  <ImageSlider
                    images={restaurant.gallery}
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                  />
                ) : null}
              </div>
            </div>
          </section>

          <section className="flex-shrink-0 w-screen min-h-full flex items-start page-x py-0">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 xl:gap-24">
              <div className="md:col-span-2 lg:col-span-1">
                <h2 className="text-title-lg text-white font-light">
                  {restaurant.description || 'БУЛОЧНАЯ И БУРГЕРНАЯ - НОВЫЙ ПРОЕКТ АРКАДИЯ НОВИКОВА, КОТОРЫЙ РАСПОЛОЖИЛСЯ В ЦЕНТРЕ ОЛИМПИЙСКОЙ СТОЛИЦЫ. НА БЕРЕГУ ЧЕРНОГО МОРЯ.'}
                </h2>
              </div>

              <div className="lg:col-span-1">
                <p className="text-body text-white/70 font-light leading-relaxed mb-6">
                  Интерьер сочетает в себе много зелени и дерева. Это помогает нашим гостям чувствовать себя уютно и комфортно. Открытая кухня дает возможность наблюдать, как профессиональные повара готовят бургеры. Помимо основного зала, в В&В присутствует открытая терраса, что позволяет гостям насладиться лучами солнца и шумом моря.
                </p>
                <p className="text-body text-white/70 font-light leading-relaxed">
                  Кухня сочетает в себе огромное количество пышных булочек с разнообразными начинками: вишня, яблоко, облепиха, и множество других.
                </p>
              </div>

              <div className="lg:col-span-1">
                <p className="text-body text-white/70 font-light leading-relaxed mb-6 lg:mb-8">
                  Помимо булочек, в меню представлен ряд бургеров с котлетами из разного мяса. Для вегетарианцев мы также подготовили альтернативное предложение в виде насладитесь вкусом настоящего бургера. Всеми любимые салаты мы тоже не обошли стороной. В меню представлено несколько видов. Наличие картофеля фри, куриных наггетсов, и нарезки свежих овощей, позволит Вам провести время в В&В вместе с вашим ребенком. Приглашаем в гости!
                </p>
                {restaurant.yearOpened && (
                  <p className="text-label text-white/40 font-light">
                    РЕСТОРАН БЫЛ ОТКРЫТ В {restaurant.yearOpened} ГОДУ.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="flex-shrink-0 w-screen min-h-full h-full flex items-center justify-center page-x">
            <div className="w-[85%] max-w-[1200px] h-[70%]">
              {restaurant.mapEmbedUrl ? (
                <iframe
                  src={restaurant.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта ресторана"
                />
              ) : (
              <div className="w-full h-full bg-card flex items-center justify-center">
                  <a
                    href={restaurant.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors text-base lg:text-lg font-light border-b border-white/20 hover:border-white/40 pb-1"
                  >
                    Открыть карту
                  </a>
                </div>
              )}
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
