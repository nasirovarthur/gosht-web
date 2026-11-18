'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faShapes, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/context/LanguageContext';
import { getRestaurantAnalyticsId } from '@/lib/analytics/restaurant-actions';
import type { RestaurantDetailProps } from './RestaurantDetail';

const copy = {
  ru: {
    kids: 'Для гостей с детьми',
    playground: 'Детская площадка',
    kidsMenu: 'Детское меню',
    project: 'О проекте Gōsht Kids',
  },
  uz: {
    kids: 'Bolali mehmonlar uchun',
    playground: 'Bolalar maydonchasi',
    kidsMenu: 'Bolalar menyusi',
    project: 'Gōsht Kids loyihasi haqida',
  },
  en: {
    kids: 'For guests with children',
    playground: 'Playground',
    kidsMenu: 'Children’s menu',
    project: 'About Gōsht Kids',
  },
};

const playgroundPhotos: Partial<Record<string, string>> = {
  'gosht-west': '/images/branches/gosht-west-playground.jpg',
  'gosht-muqimiy': '/images/branches/gosht-muqimiy-playground.jpg',
  'gosht-mirabad': '/images/branches/gosht-mirabad-playground.webp',
  'gosht-boulevard': '/images/branches/gosht-boulevard-playground.webp',
};

export default function GoshtBranchDetail({ restaurant }: RestaurantDetailProps) {
  const { lang } = useLanguage();
  const text = copy[lang];
  const familyPhoto = restaurant.kidsGallery?.[0] || playgroundPhotos[restaurant.slug || ''];
  const { kidsMenuUrl } = restaurant;

  return (
    <section className="page-x border-t border-white/10 pt-12 lg:w-screen lg:flex-shrink-0" aria-labelledby="family-heading">
      <div className="grid w-full grid-cols-1 items-start gap-10 xl:grid-cols-2 xl:gap-14">
        <div>
          <h2 id="family-heading" className="font-serif text-[clamp(34px,3.6vw,62px)] font-light uppercase leading-[1.06] tracking-[-0.025em]">{text.kids}</h2>
          <a href={`/${lang}/projects?project=gosht-kids-01#project-description`} aria-label={text.project}
            className="mt-7 inline-flex items-center gap-5 text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-4">
            <Image src="/images/branches/gosht-kids-logo.svg" alt="Gōsht Kids" width={112} height={68} className="h-[68px] w-28 object-contain" />
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/20">
              <FontAwesomeIcon icon={faArrowUp} className="size-4 rotate-45" aria-hidden="true" />
            </span>
          </a>
          <ul className="mt-7 space-y-3 text-body-lg font-light">
            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faShapes} className="size-4 shrink-0" aria-hidden="true" />
              {text.playground}
            </li>
            <li className="flex min-h-8 items-center gap-3">
              <FontAwesomeIcon icon={faUtensils} className="size-4 shrink-0" aria-hidden="true" />
              {kidsMenuUrl ? (
                <a href={kidsMenuUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="view_menu" data-menu-format="pdf"
                  data-restaurant-id={getRestaurantAnalyticsId(restaurant.slug)} data-cta-location="branch_page"
                  className="border-b border-white/20 pb-1 transition-colors hover:text-white/75">
                  {text.kidsMenu}
                </a>
              ) : text.kidsMenu}
            </li>
          </ul>
        </div>
        {familyPhoto && (
          <figure>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image src={familyPhoto} alt={`${text.playground} · ${restaurant.branchName}`} fill sizes="(max-width: 1279px) 100vw, 50vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm font-light text-white/60">{text.playground} · {restaurant.branchName}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
