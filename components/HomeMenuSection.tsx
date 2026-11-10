'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SliderButton from './SliderButton';
import { useLanguage } from '@/context/LanguageContext';
import { pickLocalized } from '@/types/i18n';
import type { DeliveryMenuDish } from '@/types/deliveryMenu';
import styles from './HomeMenuSection.module.css';

const copy = {
  ru: { title: 'Меню GŌSHT', description: 'Стейки, бургеры и другие блюда нашей кухни.', menu: 'Смотреть меню', previous: 'Предыдущие блюда', next: 'Следующие блюда', unavailable: 'Цены и наличие блюд уточняйте в ресторане.' },
  uz: { title: 'GŌSHT menyusi', description: 'Steyklar, burgerlar va oshxonamizning boshqa taomlari.', menu: "Menyuni ko'rish", previous: 'Oldingi taomlar', next: 'Keyingi taomlar', unavailable: 'Narxlar va taomlar mavjudligini restorandan aniqlang.' },
  en: { title: 'GŌSHT menu', description: 'Steaks, burgers and more from our kitchen.', menu: 'Explore the menu', previous: 'Previous dishes', next: 'Next dishes', unavailable: 'Please contact the restaurant for current prices and availability.' },
};
const kitchenPhoto = 'https://cdn.sanity.io/images/90iua6vo/production/a7f2dea1ad117ce123e0d27c3c50cbe7bd7803c0-3840x2160.webp';

export default function HomeMenuSection({ dishes }: { dishes: DeliveryMenuDish[] }) {
  const { lang } = useLanguage();
  const text = copy[lang];
  const menuUrl = `/${lang}/restaurants/gosht-west/menu`;
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [portraitImages, setPortraitImages] = useState<Set<string>>(() => new Set());
  const visibleDishes = dishes.filter(dish => !failedImages.has(dish.id));
  const spreads = Array.from({ length: Math.ceil(visibleDishes.length / 3) }, (_, index) => visibleDishes.slice(index * 3, index * 3 + 3));
  useEffect(() => {
    if (window.location.hash !== '#menu') return;
    // The streamed homepage can mount this section after the browser resolves its fragment.
    const frame = requestAnimationFrame(() => document.getElementById('menu')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [visibleDishes.length]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const item = element.querySelector<HTMLElement>(window.matchMedia('(max-width: 767px)').matches ? 'a' : '[data-menu-spread]');
    if (!item) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    const step = item.getBoundingClientRect().width + gap;
    const current = Math.round(element.scrollLeft / step);
    element.scrollTo({ left: (current + direction) * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <section className={styles.section} aria-labelledby="home-menu-title" id="menu">
    <div className={`page-x ${styles.body}`}><div className={styles.inner}>
    <header className={styles.header}>
      <div><h2 id="home-menu-title">{text.title}</h2><p>{text.description}</p></div>
      <SliderButton className={styles.menuLink} href={menuUrl}><span>{text.menu}</span></SliderButton>
    </header>
    {visibleDishes.length ? <>
      <div ref={track} className={styles.track} onScroll={event => {
        const element = event.currentTarget;
        setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
      }}>
        {spreads.map(spread => <div key={spread[0].id} className={styles.spread} data-menu-spread data-count={spread.length}>
          {spread.map((dish, index) => {
            const description = pickLocalized(dish.description, lang).replace(/\s+/g, ' ').trim();
            return <Link key={dish.id} href={`${menuUrl}?dish=${encodeURIComponent(dish.id)}`} className={`${styles.dish} ${index === 0 ? styles.featured : ''}`}>
              <div className={styles.photo}><Image src={dish.image!} alt={pickLocalized(dish.title, lang)} fill sizes={index === 0 ? '(max-width: 767px) 85vw, 57vw' : '(max-width: 767px) 85vw, 40vw'} className={styles.image} data-portrait={portraitImages.has(dish.id) || undefined} unoptimized onLoad={event => {
                const image = event.currentTarget;
                if (image.naturalHeight > image.naturalWidth * 1.15) setPortraitImages(current => current.has(dish.id) ? current : new Set(current).add(dish.id));
              }} onError={() => setFailedImages(current => new Set(current).add(dish.id))} /></div>
              <div className={styles.dishHeading}>
                <h3 className={styles.title}>{pickLocalized(dish.title, lang)}</h3>
                {description && <p className={styles.description}>{description}</p>}
              </div>
            </Link>;
          })}
        </div>)}
      </div>
      {visibleDishes.length > 1 && <div className={styles.controls}>
        <div><SliderButton direction="left" onClick={() => move(-1)} disabled={edges.start} ariaLabel={text.previous} />
          <SliderButton direction="right" onClick={() => move(1)} disabled={edges.end || visibleDishes.length < 2} ariaLabel={text.next} /></div>
      </div>}
    </> : <div className={styles.kitchen}>
      <Link href={menuUrl} className={styles.kitchenPhoto} aria-label={text.menu}><Image src={kitchenPhoto} alt={lang === 'ru' ? 'Стейк на гриле GŌSHT' : lang === 'uz' ? 'GŌSHT gril steyki' : 'GŌSHT grilled steak'} fill sizes="(max-width: 600px) 100vw, 75vw" className={styles.image} /></Link>
      <div className={styles.kitchenCaption}><span>GŌSHT WEST</span><p>{text.unavailable}</p></div>
    </div>}
    </div></div>
  </section>;
}
