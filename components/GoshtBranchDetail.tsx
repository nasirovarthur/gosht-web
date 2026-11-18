'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getRestaurantAnalyticsId } from '@/lib/analytics/restaurant-actions';
import type { RestaurantDetailProps } from './RestaurantDetail';

const copy = {
  ru: {
    call: 'Позвонить', menu: 'Меню', directions: 'Построить маршрут',
    address: 'Адрес', hours: 'Часы работы', phone: 'Телефон ресторана',
    kids: 'Для гостей с детьми', playground: 'Детская площадка', kidsMenu: 'Детское меню',
    kidsDescription: 'В этом филиале есть детская площадка и отдельное меню для детей.',
    kidsPhoto: 'Детская площадка', interiorPhoto: 'Интерьер ресторана',
    restaurantMenu: 'Меню ресторана', pdf: 'Открыть PDF',
    delivery: 'Доставка из GŌSHT West', map: 'Как добраться',
    about: 'О ресторане', monSat: 'Пн–Сб', sunday: 'Вс', daily: 'Ежедневно',
  },
  uz: {
    call: 'Qo‘ng‘iroq qilish', menu: 'Menyu', directions: 'Yo‘nalish olish',
    address: 'Manzil', hours: 'Ish vaqti', phone: 'Restoran telefoni',
    kids: 'Bolali mehmonlar uchun', playground: 'Bolalar maydonchasi', kidsMenu: 'Bolalar menyusi',
    kidsDescription: 'Bu filialda bolalar maydonchasi va bolalar uchun alohida menyu mavjud.',
    kidsPhoto: 'Bolalar maydonchasi', interiorPhoto: 'Restoran interyeri',
    restaurantMenu: 'Restoran menyusi', pdf: 'PDF ochish',
    delivery: 'GŌSHT West’dan yetkazib berish', map: 'Qanday borish mumkin',
    about: 'Restoran haqida', monSat: 'Du–Sha', sunday: 'Ya', daily: 'Har kuni',
  },
  en: {
    call: 'Call the restaurant', menu: 'Menu', directions: 'Get directions',
    address: 'Address', hours: 'Opening hours', phone: 'Restaurant phone',
    kids: 'For guests with children', playground: 'Playground', kidsMenu: 'Children’s menu',
    kidsDescription: 'This branch has a playground and a separate children’s menu.',
    kidsPhoto: 'Playground', interiorPhoto: 'Restaurant interior',
    restaurantMenu: 'Restaurant menu', pdf: 'Open PDF',
    delivery: 'Delivery from GŌSHT West', map: 'Getting here',
    about: 'About the restaurant', monSat: 'Mon–Sat', sunday: 'Sun', daily: 'Daily',
  },
};

const branchPhotos: Record<string, { src: string; playground: boolean }> = {
  'gosht-west': { src: '/images/branches/gosht-west-playground.jpg', playground: true },
  'gosht-muqimiy': { src: '/images/branches/gosht-muqimiy-playground.jpg', playground: true },
  'gosht-mirabad': { src: '/images/branches/gosht-mirabad-interior.webp', playground: false },
  'gosht-boulevard': { src: '/images/branches/gosht-boulevard-interior.webp', playground: false },
};

export default function GoshtBranchDetail({ restaurant }: RestaurantDetailProps) {
  const { lang } = useLanguage();
  const text = copy[lang];
  const restaurantId = getRestaurantAnalyticsId(restaurant.slug);
  const branchPhoto = branchPhotos[restaurant.slug || ''];
  const familyPhoto = restaurant.kidsGallery?.[0] || branchPhoto?.src;
  const familyCaption = restaurant.kidsGallery?.[0] || branchPhoto?.playground ? text.kidsPhoto : text.interiorPhoto;
  const menuUrl = restaurant.menuFiles.filter(Boolean)[0];
  const menuIsPage = !restaurant.deliveryMenuEnabled && Boolean(restaurant.slug);

  return (
    <section className="page-x border-t border-white/10 pt-12 lg:w-screen lg:flex-shrink-0" aria-labelledby="family-heading">
      <div className="grid w-full grid-cols-1 items-start gap-10 xl:grid-cols-2 xl:gap-14">
        <div>
          <h2 id="family-heading" className="font-serif text-[clamp(34px,3.6vw,62px)] font-light uppercase leading-[1.06] tracking-[-0.025em]">{text.kids}</h2>
          <p className="mt-6 max-w-[54ch] text-body font-light leading-relaxed text-white/72">{text.kidsDescription}</p>
          <ul className="mt-7 space-y-3 text-body-lg font-light">
            <li>{text.playground}</li>
            <li>{text.kidsMenu}</li>
          </ul>
          {menuUrl && (menuIsPage ? (
            <Link href={'/' + lang + '/restaurants/' + restaurant.slug + '/menu'} data-analytics-event="view_menu" data-menu-format="page" data-restaurant-id={restaurantId} data-cta-location="branch_page" className="mt-7 inline-block border-b border-white/20 pb-1 text-body font-light text-white">
              {text.restaurantMenu} {restaurant.branchName}
            </Link>
          ) : (
            <a href={menuUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="view_menu" data-menu-format="pdf" data-restaurant-id={restaurantId} data-cta-location="branch_page" className="mt-7 inline-block border-b border-white/20 pb-1 text-body font-light text-white">
              {text.restaurantMenu} {restaurant.branchName} · {text.pdf}
            </a>
          ))}
        </div>
        {familyPhoto && (
          <figure>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image src={familyPhoto} alt={familyCaption + ' ' + restaurant.branchName} fill sizes="(max-width: 1279px) 100vw, 50vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm font-light text-white/60">{familyCaption} · {restaurant.branchName}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
