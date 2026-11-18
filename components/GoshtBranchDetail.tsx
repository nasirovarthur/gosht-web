'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLocationArrow, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/context/LanguageContext';
import { getRestaurantAnalyticsId } from '@/lib/analytics/restaurant-actions';
import { pickLocalized, translations } from '@/types/i18n';
import type { RestaurantDetailProps } from './RestaurantDetail';
import ImageSlider from './ImageSlider';
import YandexMap from './restaurant/YandexMap';
import styles from './GoshtBranchDetail.module.css';

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
  const menuFiles = restaurant.menuFiles.filter(Boolean);
  const menuUrl = menuFiles[0];
  const familyMenuIsPage = !restaurant.deliveryMenuEnabled && Boolean(restaurant.slug);
  const familyMenuHref = familyMenuIsPage ? `/${lang}/restaurants/${restaurant.slug}/menu` : menuUrl;
  const phoneHref = `tel:${restaurant.phone.replace(/[^+\d]/g, '')}`;
  const workingHours = restaurant.workingHours
    .replace(/Пн\s*[-–]\s*Сб/g, text.monSat)
    .replace(/Вс(?=\s*:)/g, text.sunday)
    .replace(/Ежедневно/g, text.daily);
  const branchPhoto = branchPhotos[restaurant.slug || ''];
  const familyPhoto = restaurant.kidsGallery?.[0] || branchPhoto?.src;
  const familyCaption = restaurant.kidsGallery?.[0] || branchPhoto?.playground ? text.kidsPhoto : text.interiorPhoto;
  const actions = {
    'data-restaurant-id': restaurantId,
    'data-cta-location': 'branch_page',
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.hero} page-x`} aria-labelledby="branch-name">
        <div className={styles.summary}>
          <h1 id="branch-name" className={styles.title}>{restaurant.branchName}</h1>
          <dl className={styles.facts}>
            <div><dt>{text.address}</dt><dd>{restaurant.address}</dd></div>
            <div><dt>{text.hours}</dt><dd>{workingHours}</dd></div>
            <div>
              <dt>{text.phone}</dt>
              <dd>
                <a href={phoneHref} data-analytics-event="click_to_call" {...actions}>
                  {restaurant.phone}
                </a>
              </dd>
            </div>
          </dl>
          <div className={styles.actions} role="group" aria-label={pickLocalized(translations.restaurantDetail.actions, lang)}>
            <a href={phoneHref} className={`${styles.button} ${styles.primary}`} data-analytics-event="click_to_call" {...actions}>
              <FontAwesomeIcon icon={faPhone} aria-hidden="true" />{text.call}
            </a>
            {menuUrl && (
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={styles.button}
                aria-label={`${text.restaurantMenu} ${restaurant.branchName} (PDF)`}
                data-analytics-event="view_menu" data-menu-format="pdf" {...actions}>
                <FontAwesomeIcon icon={faUtensils} aria-hidden="true" />{text.menu}
              </a>
            )}
            <a href={restaurant.directionsLink || restaurant.mapLink} target="_blank" rel="noopener noreferrer" className={styles.button}
              data-analytics-event="get_directions" {...actions}>
              <FontAwesomeIcon icon={faLocationArrow} aria-hidden="true" />{text.directions}
            </a>
          </div>
          {restaurant.deliveryMenuEnabled && (
            <Link href={`/${lang}/restaurants/${restaurant.slug}/menu`} className={styles.delivery}
              data-analytics-event="view_menu" data-menu-format="page" {...actions}>
              {text.delivery}
            </Link>
          )}
          {restaurant.averageCheck && (
            <p className={styles.averageCheck}>{pickLocalized(translations.restaurantDetail.averageCheck, lang)} · {restaurant.averageCheck}</p>
          )}
        </div>
        {restaurant.gallery.length > 0 && (
          <div className={styles.gallery}>
            <ImageSlider images={restaurant.gallery} orientation="horizontal" effect="projects" altPrefix={restaurant.branchName} />
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.family} page-x`} aria-labelledby="family-heading">
        <div>
          <h2 id="family-heading">{text.kids}</h2>
          <p>{text.kidsDescription}</p>
          <ul className={styles.familyFeatures}>
            <li>{text.playground}</li>
            <li>{text.kidsMenu}</li>
          </ul>
          {menuUrl && (
            <a href={familyMenuHref} target={familyMenuIsPage ? undefined : '_blank'} rel={familyMenuIsPage ? undefined : 'noopener noreferrer'} className={styles.textLink}
              data-analytics-event="view_menu" data-menu-format={familyMenuIsPage ? 'page' : 'pdf'} {...actions}>
              {text.restaurantMenu} {restaurant.branchName}{!familyMenuIsPage && ` · ${text.pdf}`}
            </a>
          )}
        </div>
        {familyPhoto && (
          <figure className={styles.familyFigure}>
            <div className={styles.familyImage}>
              <Image src={familyPhoto} alt={`${familyCaption} ${restaurant.branchName}`} fill sizes="(max-width: 767px) 100vw, 50vw" className={styles.photo} />
            </div>
            <figcaption>{familyCaption} · {restaurant.branchName}</figcaption>
          </figure>
        )}
      </section>

      {restaurant.description && (
        <section className={`${styles.section} ${styles.about} page-x`} aria-labelledby="about-heading">
          <h2 id="about-heading">{text.about}</h2>
          <div>
            <p className={styles.description}>{restaurant.description}</p>
            {restaurant.descriptionExtended && <p>{restaurant.descriptionExtended}</p>}
            {restaurant.descriptionAdditional && <p>{restaurant.descriptionAdditional}</p>}
            {restaurant.yearOpened && <p>{pickLocalized(translations.restaurantDetail.openedYear, lang)} · {restaurant.yearOpened}</p>}
          </div>
        </section>
      )}

      {restaurant.chef?.name && (
        <section className={`${styles.section} ${styles.chef} page-x`} aria-labelledby="chef-heading">
          {restaurant.chef.image && <Image src={restaurant.chef.image} alt={restaurant.chef.name} width={500} height={650} className={styles.chefPhoto} sizes="(max-width: 767px) 100vw, 35vw" />}
          <div>
            {restaurant.chef.title && <p className={styles.chefTitle}>{restaurant.chef.title}</p>}
            <h2 id="chef-heading">{restaurant.chef.name}</h2>
            {restaurant.chef.description && <p>{restaurant.chef.description}</p>}
          </div>
        </section>
      )}

      <section className={`${styles.section} page-x`} aria-labelledby="directions-heading">
        <div className={styles.mapHeading}>
          <div><h2 id="directions-heading">{text.map}</h2><p>{restaurant.address}</p></div>
          <a href={restaurant.directionsLink || restaurant.mapLink} target="_blank" rel="noopener noreferrer" className={styles.textLink}
            data-analytics-event="get_directions" data-restaurant-id={restaurantId} data-cta-location="branch_map">
            {text.directions}
          </a>
        </div>
        {restaurant.mapCoordinates ? (
          <YandexMap center={restaurant.mapCoordinates} branchName={restaurant.branchName} address={restaurant.address}
            mapLink={restaurant.mapLink} openMapLabel={pickLocalized(translations.restaurantDetail.openMap, lang)}
            height="min(62vh, 560px)" restaurantId={restaurantId} />
        ) : (
          <a href={restaurant.mapLink} target="_blank" rel="noopener noreferrer" className={styles.textLink}
            data-analytics-event="get_directions" data-restaurant-id={restaurantId} data-cta-location="branch_map">
            {pickLocalized(translations.restaurantDetail.openMap, lang)}
          </a>
        )}
      </section>

      <div className={styles.mobileActions} role="group" aria-label={pickLocalized(translations.restaurantDetail.actions, lang)} data-testid="restaurant-actions">
        <a href={phoneHref} className={`${styles.button} ${styles.primary}`} data-analytics-event="click_to_call"
          data-restaurant-id={restaurantId} data-cta-location="branch_actions">{text.call}</a>
        {menuUrl && <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={styles.button}
          aria-label={`${text.restaurantMenu} ${restaurant.branchName} (PDF)`} data-analytics-event="view_menu"
          data-menu-format="pdf" data-restaurant-id={restaurantId} data-cta-location="branch_actions">{text.menu}</a>}
      </div>
    </main>
  );
}
