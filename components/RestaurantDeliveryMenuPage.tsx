'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { pickLocalized, translations } from '@/types/i18n';
import type { Localized } from '@/types/i18n';
import type { DeliveryMenuDish, DeliveryMenuDishBadge } from '@/types/deliveryMenu';

const ALL_CATEGORY_LABEL: Localized = { uz: 'BARCHASI', ru: 'ВСЕ', en: 'ALL' };
const ALL_GROUP_ID = 'all';
const ALL_IN_GROUP_LABEL: Localized = { uz: 'Barchasi', ru: 'Все в разделе', en: 'All in section' };

const MENU_CATEGORY_GROUPS = [
  {
    id: 'starters',
    label: { uz: 'STARTERS', ru: 'ЗАКУСКИ', en: 'STARTERS' },
    patterns: ['starter'],
  },
  {
    id: 'salads-soups',
    label: { uz: 'SALATLAR / SHO‘RVALAR', ru: 'САЛАТЫ / СУПЫ', en: 'SALADS / SOUPS' },
    patterns: ['salad', 'soup'],
  },
  {
    id: 'boards',
    label: { uz: 'SETLAR', ru: 'СЕТЫ', en: 'BOARDS' },
    patterns: ['board', 'iftar'],
  },
  {
    id: 'grill',
    label: { uz: 'GO‘SHT / GRILL', ru: 'МЯСО / ГРИЛЬ', en: 'MEAT / GRILL' },
    patterns: ['steak', 'beef', 'lamb', 'chicken', 'fish', 'seafood'],
  },
  {
    id: 'burgers',
    label: { uz: 'BURGERLAR', ru: 'БУРГЕРЫ', en: 'BURGERS' },
    patterns: ['between bun'],
  },
  {
    id: 'pasta-sides',
    label: { uz: 'PASTA / GARNIR', ru: 'ПАСТА / ГАРНИРЫ', en: 'PASTA / SIDES' },
    patterns: ['pasta', 'side'],
  },
  {
    id: 'kids',
    label: { uz: 'BOLALAR', ru: 'ДЕТЯМ', en: 'KIDS' },
    patterns: ['kid'],
  },
  {
    id: 'desserts',
    label: { uz: 'DESERTLAR', ru: 'ДЕСЕРТЫ', en: 'DESSERTS' },
    patterns: ['dessert'],
  },
  {
    id: 'drinks',
    label: { uz: 'ICHIMLIKLAR', ru: 'НАПИТКИ', en: 'DRINKS' },
    patterns: ['beverage', 'lemonade', 'smoothie', 'coffee', 'milkshake', 'mocktail', 'cocktail', 'can'],
  },
  {
    id: 'add-ons',
    label: { uz: 'QO‘SHIMCHA', ru: 'ДОПОЛНИТЕЛЬНО', en: 'ADD-ONS' },
    patterns: ['sauce', 'extra'],
  },
] as const;

type MenuGroupId = typeof ALL_GROUP_ID | (typeof MENU_CATEGORY_GROUPS)[number]['id'];

const DISH_BADGE_META: Record<DeliveryMenuDishBadge, { icon: string; label: Localized }> = {
  chef: {
    icon: '/chief-choice.svg',
    label: { uz: 'Chef tanlovi', ru: 'Выбор шефа', en: "Chef's choice" },
  },
  spicy: {
    icon: '/spicy.svg',
    label: { uz: 'Achchiq', ru: 'Острое', en: 'Spicy' },
  },
  veg: {
    icon: '/veg.svg',
    label: { uz: 'Vegetarian', ru: 'Вегетарианское', en: 'Vegetarian' },
  },
};

const FALLBACK_DELIVERY_DISHES: DeliveryMenuDish[] = [
  {
    id: 'signature-cucumber',
    title: {
      uz: 'Bodringli Signature Salat',
      ru: 'Битые азиатские огурцы',
      en: 'Smashed Asian Cucumbers',
    },
    weight: '256 g',
    price: 55000,
    categoryId: 'salads',
    categoryLabel: { uz: 'SALATLAR', ru: 'САЛАТЫ', en: 'SALADS' },
    featured: true,
  },
  {
    id: 'tuna-roll',
    title: {
      uz: 'Xrustali Tuna Roll',
      ru: 'Хрустящий тунец-ролл',
      en: 'Crispy Tuna Roll',
    },
    weight: '240 g',
    price: 69000,
    categoryId: 'rolls',
    categoryLabel: { uz: 'ROLLAR', ru: 'РОЛЛЫ', en: 'ROLLS' },
  },
  {
    id: 'spring-shrimp',
    title: {
      uz: 'Shrimp Spring Roll',
      ru: 'Спринг-ролл с креветкой',
      en: 'Shrimp Spring Roll',
    },
    weight: '256 g',
    price: 69000,
    categoryId: 'snacks',
    categoryLabel: { uz: 'YENGIL GAZAKLAR', ru: 'ЗАКУСКИ', en: 'SNACKS' },
  },
  {
    id: 'salmon-tart',
    title: {
      uz: 'Losos tartar',
      ru: 'Тартар из лосося',
      en: 'Salmon Tartar',
    },
    weight: '220 g',
    price: 79000,
    categoryId: 'bestsellers',
    categoryLabel: { uz: 'XITLAR', ru: 'БЕСТСЕЛЛЕРЫ', en: 'BESTSELLERS' },
  },
  {
    id: 'ramen-chicken',
    title: {
      uz: 'Tovuq tonkotsu ramen',
      ru: 'Лапша рамэн, курица тонкацу',
      en: 'Chicken Tonkatsu Ramen',
    },
    weight: '410 g',
    price: 96000,
    categoryId: 'hot',
    categoryLabel: { uz: 'ISSIQ TAOMLAR', ru: 'ГОРЯЧИЕ БЛЮДА', en: 'HOT DISHES' },
  },
  {
    id: 'edamame-sea-salt',
    title: {
      uz: 'Edamame, dengiz tuzi',
      ru: 'Эдамаме, морская соль',
      en: 'Edamame, Sea Salt',
    },
    weight: '190 g',
    price: 39000,
    categoryId: 'sushi',
    categoryLabel: { uz: 'SUSHI', ru: 'СУШИ', en: 'SUSHI' },
  },
];

function formatDishPrice(price: number, lang: 'uz' | 'ru' | 'en', currencyCode: string): string {
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ';
  const normalizedCurrencyCode = (currencyCode || 'UZS').toUpperCase();

  if (normalizedCurrencyCode === 'UZS') {
    const suffix = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm";
    return `${new Intl.NumberFormat(locale).format(price)} ${suffix}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrencyCode,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${new Intl.NumberFormat(locale).format(price)} ${normalizedCurrencyCode}`;
  }
}

function DishBadgeIcons({
  badges,
  lang,
  isFeatured,
}: {
  badges?: DeliveryMenuDishBadge[];
  lang: 'uz' | 'ru' | 'en';
  isFeatured: boolean;
}) {
  if (!badges?.length) {
    return null;
  }

  const label = badges.map((badge) => pickLocalized(DISH_BADGE_META[badge].label, lang)).join(', ');

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 self-center" aria-label={label}>
      {badges.map((badge) => {
        const meta = DISH_BADGE_META[badge];
        return (
          <Image
            key={badge}
            src={meta.icon}
            alt=""
            width={24}
            height={24}
            className={isFeatured ? 'h-8 w-8 md:h-9 md:w-9' : 'h-7 w-7 md:h-8 md:w-8'}
            unoptimized
          />
        );
      })}
    </span>
  );
}

function normalizeMenuCategory(value: string): string {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
}

function getCategoryGroupId(categoryLabel: Localized): MenuGroupId {
  const normalizedLabel = normalizeMenuCategory(pickLocalized(categoryLabel, 'en') || pickLocalized(categoryLabel, 'ru'));
  const group = MENU_CATEGORY_GROUPS.find((item) =>
    item.patterns.some((pattern) => normalizedLabel.includes(pattern))
  );

  return group?.id || 'add-ons';
}

function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M12.5 4.5L7 10L12.5 15.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10H16" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5.5 5.5L14.5 14.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M14.5 5.5L5.5 14.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 4.75V15.25" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M4.75 10H15.25" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4.75 10H15.25" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6.3 8.6H17.7L18.8 20H5.2L6.3 8.6Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M9 8.6C9 5.9 10.2 4 12 4C13.8 4 15 5.9 15 8.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8.8 12.6H15.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M7.2 5.8H14.2V12.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6L6 14" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function DishPlaceholderIcon({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path d="M9 30.5H39" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 30C13.8 21.4 18.2 16.8 24 16.8C29.8 16.8 34.2 21.4 35 30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 14.5V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 10.5H28" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 35.5H33" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type RestaurantDeliveryMenuProps = {
  backHref: string;
  restaurant: {
    name: string;
    branchName: string;
    address: string;
    phone: string;
    averageCheck: string;
    workingHours: string;
    menuFiles: string[];
    gallery: string[];
    logo?: string;
  };
  dishes?: DeliveryMenuDish[];
  currencyCode?: string;
  requireApiDishes?: boolean;
};

type InfoPopup = 'delivery' | null;

export default function RestaurantDeliveryMenuPage({
  backHref,
  restaurant,
  dishes,
  currencyCode = 'UZS',
  requireApiDishes = false,
}: RestaurantDeliveryMenuProps) {
  const { lang } = useLanguage();
  const t = translations.restaurantDetail;
  const hasApiDishes = Array.isArray(dishes) && dishes.length > 0;
  const menuDishes = useMemo(
    () => (hasApiDishes ? dishes : requireApiDishes ? [] : FALLBACK_DELIVERY_DISHES),
    [dishes, hasApiDishes, requireApiDishes]
  );
  const [activeMenuGroup, setActiveMenuGroup] = useState<MenuGroupId>(ALL_GROUP_ID);
  const [activeSubcategory, setActiveSubcategory] = useState<string>(ALL_GROUP_ID);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeInfoPopup, setActiveInfoPopup] = useState<InfoPopup>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const deliveryCategories = useMemo(() => {
    const categories: { id: string; label: Localized }[] = [{ id: 'all', label: ALL_CATEGORY_LABEL }];
    const seen = new Set<string>();

    for (const dish of menuDishes) {
      if (seen.has(dish.categoryId)) {
        continue;
      }

      seen.add(dish.categoryId);
      categories.push({ id: dish.categoryId, label: dish.categoryLabel });
    }

    return categories;
  }, [menuDishes]);

  const categoryGroupsById = useMemo(() => {
    const map = new Map<string, MenuGroupId>();
    for (const category of deliveryCategories) {
      if (category.id === ALL_GROUP_ID) continue;
      map.set(category.id, getCategoryGroupId(category.label));
    }
    return map;
  }, [deliveryCategories]);

  const visibleMenuGroups = useMemo<{ id: MenuGroupId; label: Localized }[]>(() => {
    const availableGroupIds = new Set(categoryGroupsById.values());
    return [
      { id: ALL_GROUP_ID, label: ALL_CATEGORY_LABEL },
      ...MENU_CATEGORY_GROUPS.filter((group) => availableGroupIds.has(group.id)),
    ];
  }, [categoryGroupsById]);

  const subcategoryOptions = useMemo(() => {
    if (activeMenuGroup === ALL_GROUP_ID) return [];
    return deliveryCategories.filter((category) => categoryGroupsById.get(category.id) === activeMenuGroup);
  }, [activeMenuGroup, categoryGroupsById, deliveryCategories]);

  const originalDishIndex = useMemo(() => {
    return new Map(menuDishes.map((dish, index) => [dish.id, index]));
  }, [menuDishes]);

  const groupOrder = useMemo(() => {
    return new Map<MenuGroupId, number>([
      [ALL_GROUP_ID, -1],
      ...MENU_CATEGORY_GROUPS.map((group, index) => [group.id, index] as [MenuGroupId, number]),
    ]);
  }, []);

  const filteredDishes = useMemo(() => {
    const dishes = menuDishes.filter((dish) => {
      const dishGroup = categoryGroupsById.get(dish.categoryId) || 'add-ons';

      if (activeMenuGroup !== ALL_GROUP_ID && dishGroup !== activeMenuGroup) {
        return false;
      }

      if (activeSubcategory !== ALL_GROUP_ID && dish.categoryId !== activeSubcategory) {
        return false;
      }

      return true;
    });

    return dishes.toSorted((a, b) => {
      const groupA = categoryGroupsById.get(a.categoryId) || 'add-ons';
      const groupB = categoryGroupsById.get(b.categoryId) || 'add-ons';
      const groupDiff = (groupOrder.get(groupA) ?? 99) - (groupOrder.get(groupB) ?? 99);

      if (groupDiff !== 0) return groupDiff;

      return (originalDishIndex.get(a.id) ?? 0) - (originalDishIndex.get(b.id) ?? 0);
    });
  }, [activeMenuGroup, activeSubcategory, categoryGroupsById, groupOrder, menuDishes, originalDishIndex]);

  const featuredDishIds = useMemo(() => {
    const ids = new Set<string>();
    const imageDishes = filteredDishes.filter((dish) => Boolean(dish.image));
    const firstImageDish = imageDishes[0];

    if (firstImageDish) {
      ids.add(firstImageDish.id);
    }

    if (activeMenuGroup === ALL_GROUP_ID) {
      for (let index = 3; index < imageDishes.length; index += 8) {
        ids.add(imageDishes[index].id);
      }
    }

    return ids;
  }, [activeMenuGroup, filteredDishes]);

  const cartItems = useMemo(
    () =>
      menuDishes.filter((dish) => (quantities[dish.id] || 0) > 0).map((dish) => ({
        ...dish,
        quantity: quantities[dish.id],
      })),
    [menuDishes, quantities]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const addDish = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decreaseDish = (id: string) => {
    setQuantities((prev) => {
      const nextValue = Math.max((prev[id] || 0) - 1, 0);
      if (nextValue === 0) {
        const { [id]: removedDish, ...rest } = prev;
        void removedDish;
        return rest;
      }
      return { ...prev, [id]: nextValue };
    });
  };

  const cartLabels =
    lang === 'ru'
        ? {
            title: 'ВАШ ЗАКАЗ',
            empty: 'Добавьте блюда через красную кнопку на карточках',
            checkout: 'ОФОРМИТЬ',
            toastCheckout: 'ЗАКАЗАТЬ В TOAST',
            toastHint: 'Откроется внешний заказ Toast. Позиции нужно подтвердить там.',
            back: 'Назад к ресторану',
            total: 'Итого',
          }
        : lang === 'en'
          ? {
              title: 'YOUR ORDER',
              empty: 'Add dishes using the red button on cards',
              checkout: 'CHECKOUT',
              toastCheckout: 'ORDER IN TOAST',
              toastHint: 'Opens Toast checkout. Items must be confirmed there.',
              back: 'Back to restaurant',
              total: 'Total',
            }
          : {
              title: 'BUYURTMANGIZ',
              empty: 'Kartochkalardagi qizil tugma orqali taom qo‘shing',
              checkout: 'RASMIIYLASHTIRISH',
              toastCheckout: 'TOASTDA BUYURTMA',
              toastHint: 'Toast buyurtmasi ochiladi. Taomlarni u yerda tasdiqlash kerak.',
              back: 'Restoranga qaytish',
              total: 'Jami',
            };
  const deliveryInfoLabels =
    lang === 'ru'
      ? {
          section: 'МЕНЮ ДОСТАВКИ',
          deliveryTerms: 'Условия доставки',
          contactInfo: 'Контактная информация',
          address: 'Адрес',
          phone: 'Телефон',
          termsLine1: 'Доставка осуществляется ежедневно в часы работы ресторана.',
          termsLine2: 'Срок доставки и финальная стоимость зависят от зоны и загруженности кухни.',
        }
      : lang === 'en'
        ? {
            section: 'DELIVERY MENU',
            deliveryTerms: 'Delivery Terms',
            contactInfo: 'Contact Information',
            address: 'Address',
            phone: 'Phone',
            termsLine1: 'Delivery is available daily during restaurant operating hours.',
            termsLine2: 'Delivery time and final cost depend on your area and kitchen load.',
          }
        : {
            section: 'YETKAZIB BERISH MENYUSI',
            deliveryTerms: 'Yetkazib berish shartlari',
            contactInfo: "Bog'lanish ma'lumotlari",
            address: 'Manzil',
            phone: 'Telefon',
            termsLine1: 'Yetkazib berish har kuni restoran ish vaqtida amalga oshiriladi.',
            termsLine2: "Muddat va yakuniy narx manzil hududi hamda oshxona yuklamasiga bog'liq.",
          };

  const menuFiles = Array.isArray(restaurant.menuFiles) ? restaurant.menuFiles.filter(Boolean) : [];
  const fullMenuUrl = menuFiles[0];
  const hasPhone = Boolean(restaurant.phone);
  const closeInfoLabel = lang === 'ru' ? 'Закрыть' : lang === 'en' ? 'Close' : 'Yopish';
  const heroTitle = restaurant.branchName.replace(/\bGOSHT\b/i, 'GŌSHT');
  const addDishLabel = lang === 'ru' ? 'Добавить блюдо' : lang === 'en' ? 'Add dish' : 'Taomni qo‘shish';
  const increaseLabel = lang === 'ru' ? 'Увеличить количество' : lang === 'en' ? 'Increase quantity' : 'Miqdorni oshirish';
  const decreaseLabel = lang === 'ru' ? 'Уменьшить количество' : lang === 'en' ? 'Decrease quantity' : 'Miqdorni kamaytirish';
  const imagePendingLabel = lang === 'ru' ? 'Фото готовится' : lang === 'en' ? 'Photo coming soon' : 'Foto tayyorlanmoqda';
  const toastOrderUrl = 'https://www.toasttab.com/local/order/gosht-3225-coney-island-avenue';

  return (
    <main className="min-h-screen bg-base pt-[104px] pb-40 text-primary md:pt-[124px] md:pb-44 xl:pb-28">
      <section className="page-x">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-3 text-ui text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeftIcon />
            <span>{cartLabels.back}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-4 rounded-full border border-subtle bg-card/80 py-2 pl-5 pr-2 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-colors hover:bg-[color:var(--interactive-hover)] xl:hidden"
            aria-label={cartLabels.title}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle text-secondary">
              <CartIcon />
            </span>
            <span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-muted">{cartLabels.total}</span>
              <span className="mt-1 block text-[15px] leading-none text-primary">
                {formatDishPrice(cartTotal, lang, currencyCode)}
              </span>
            </span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--interactive-strong)] text-inverse">
              {cartItems.length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <div className="pb-8 md:pb-12">
              <div className="grid gap-8 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[190px_minmax(0,1fr)]">
            <div className="relative h-[126px] w-[126px] lg:h-[154px] lg:w-[154px]">
              {restaurant.logo ? (
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name || restaurant.branchName}
                  fill
                  sizes="154px"
                  className="object-contain"
                  priority
                />
              ) : (
                <span className="font-serif text-[34px] uppercase leading-none text-primary">
                  {(restaurant.name || restaurant.branchName).slice(0, 2)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted md:text-[12px]">
                {deliveryInfoLabels.section}
              </p>
              <h1 className="mt-3 font-serif text-[clamp(46px,7vw,104px)] font-light uppercase leading-[0.88] tracking-[-0.055em] text-primary">
                {heroTitle}
              </h1>

              <div className="mt-10 grid gap-8 border-t border-subtle pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(230px,0.72fr)] xl:max-w-[1060px] xl:gap-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{deliveryInfoLabels.address}</p>
                    <p className="mt-4 text-[17px] leading-snug text-secondary md:text-[18px]">{restaurant.address}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{deliveryInfoLabels.phone}</p>
                    {hasPhone ? (
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="mt-4 inline-block border-b border-strong pb-1 text-[17px] leading-snug text-primary transition-colors hover:text-secondary md:text-[18px]"
                      >
                        {restaurant.phone}
                      </a>
                    ) : (
                      <p className="mt-4 text-[17px] text-muted md:text-[18px]">—</p>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{pickLocalized(t.workingHours, lang)}</p>
                    <p className="mt-4 text-[17px] leading-snug text-secondary md:text-[18px]">{restaurant.workingHours}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{pickLocalized(t.averageCheck, lang)}</p>
                    <p className="mt-4 text-[17px] leading-snug text-secondary md:text-[18px]">{restaurant.averageCheck}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:items-start lg:pl-6">
                  <button
                    type="button"
                    onClick={() => setActiveInfoPopup('delivery')}
                    className="inline-flex h-[50px] w-fit min-w-[230px] items-center justify-center rounded-full border border-subtle px-7 text-[12px] uppercase tracking-[0.16em] text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                  >
                    {deliveryInfoLabels.deliveryTerms}
                  </button>
                  {fullMenuUrl ? (
                    <a
                      href={fullMenuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-[50px] w-fit min-w-[260px] items-center justify-center rounded-full border border-subtle px-7 text-[12px] uppercase tracking-[0.16em] text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                    >
                      {pickLocalized(t.openFullMenu, lang)}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
              </div>
            </div>

            <div
              className="mt-7 flex items-center gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleMenuGroups.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveMenuGroup(category.id);
                    setActiveSubcategory(ALL_GROUP_ID);
                  }}
                  className={`shrink-0 h-[36px] rounded-full border px-4 text-[11px] tracking-[0.13em] uppercase transition-colors md:h-[40px] md:px-5 md:text-[12px] ${
                    activeMenuGroup === category.id
                      ? 'border-[color:var(--interactive-strong)] bg-[color:var(--interactive-strong)] text-inverse'
                      : 'border-subtle text-secondary hover:bg-[color:var(--interactive-hover)] hover:text-primary'
                  }`}
                >
                  {pickLocalized(category.label, lang)}
                </button>
              ))}
            </div>

            {subcategoryOptions.length > 1 ? (
              <div
                className="mt-3 flex items-center gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveSubcategory(ALL_GROUP_ID)}
                  className={`shrink-0 h-[32px] rounded-full border px-4 text-[10px] tracking-[0.12em] uppercase transition-colors md:text-[11px] ${
                    activeSubcategory === ALL_GROUP_ID
                      ? 'border-subtle bg-[color:var(--interactive-hover)] text-primary'
                      : 'border-subtle text-muted hover:text-primary'
                  }`}
                >
                  {pickLocalized(ALL_IN_GROUP_LABEL, lang)}
                </button>
                {subcategoryOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveSubcategory(category.id)}
                    className={`shrink-0 h-[32px] rounded-full border px-4 text-[10px] tracking-[0.12em] uppercase transition-colors md:text-[11px] ${
                      activeSubcategory === category.id
                        ? 'border-subtle bg-[color:var(--interactive-hover)] text-primary'
                        : 'border-subtle text-muted hover:text-primary'
                    }`}
                  >
                    {pickLocalized(category.label, lang)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:auto-rows-[minmax(210px,auto)]">
              {filteredDishes.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-4 rounded-[22px] border border-subtle bg-card px-5 py-8 text-body text-secondary">
                  {lang === 'ru'
                    ? 'Меню доставки временно недоступно. Повторите попытку через минуту.'
                    : lang === 'en'
                      ? 'Delivery menu is temporarily unavailable. Please try again in a minute.'
                      : 'Yetkazib berish menyusi vaqtincha mavjud emas. Bir daqiqadan so‘ng qayta urinib ko‘ring.'}
                </div>
              ) : filteredDishes.map((dish, index) => {
                const imageSrc = dish.image || null;
                const hasDishImage = Boolean(imageSrc);
                const isFeatured = hasDishImage && featuredDishIds.has(dish.id);
                const layoutClass = isFeatured
                  ? 'sm:col-span-2 xl:col-span-2 xl:row-span-2'
                  : hasDishImage && index === filteredDishes.length - 1 && filteredDishes.length > 3
                    ? 'xl:col-span-2'
                    : '';

                return (
                  <article
                    key={dish.id}
                    className={`group relative transition-all duration-500 hover:-translate-y-1 ${layoutClass}`}
                  >
                    <div className={`relative overflow-hidden ${isFeatured ? 'aspect-[16/11] md:aspect-[16/10]' : 'aspect-[16/10]'}`}>
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={pickLocalized(dish.title, lang)}
                          fill
                          sizes={isFeatured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 25vw'}
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center border border-subtle bg-[radial-gradient(circle_at_30%_20%,rgba(174,14,22,0.18),transparent_32%),linear-gradient(145deg,#181818_0%,#0d0d0d_100%)]">
                          <div className="flex flex-col items-center text-center text-muted">
                            <DishPlaceholderIcon />
                            <span className="mt-3 text-[10px] uppercase tracking-[0.18em]">
                              {imagePendingLabel}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.34),rgba(0,0,0,0.02)_52%)]" />
                      <button
                        type="button"
                        onClick={() => addDish(dish.id)}
                        className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#AE0E16] text-white shadow-[0_8px_20px_rgba(174,14,22,0.45)] transition-transform duration-300 group-hover:scale-110"
                        aria-label={addDishLabel}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <div className="px-1 pt-3 pb-1 md:pt-4">
                      <div className="flex items-center gap-2.5">
                        <DishBadgeIcons badges={dish.badges} lang={lang} isFeatured={isFeatured} />
                        <h3 className={`font-light leading-[1.08] text-primary ${isFeatured ? 'text-[clamp(19px,1.55vw,30px)] font-serif uppercase tracking-[-0.02em]' : 'text-[clamp(16px,1.2vw,22px)]'}`}>
                          {pickLocalized(dish.title, lang)}
                        </h3>
                      </div>
                      {dish.weight ? <p className="mt-2 text-[12px] text-muted md:text-[13px]">{dish.weight}</p> : null}
                      <p className="mt-2 text-[17px] md:text-[19px] font-light text-primary">
                        {formatDishPrice(dish.price, lang, currencyCode)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>

          <aside className="hidden xl:sticky xl:top-[136px] xl:block">
            <div className="rounded-[22px] border border-subtle bg-card p-5">
              <h2 className="text-ui uppercase tracking-[0.18em] text-muted">{cartLabels.title}</h2>

              {cartItems.length === 0 ? (
                <p className="mt-4 text-body text-secondary">{cartLabels.empty}</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border-b border-subtle pb-4 last:border-b-0">
                      <p className="text-body text-primary">{pickLocalized(item.title, lang)}</p>
                      <div className="mt-2 flex items-center justify-between text-sm text-secondary">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseDish(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-subtle hover:bg-[color:var(--interactive-hover)]"
                            aria-label={`${decreaseLabel}: ${pickLocalized(item.title, lang)}`}
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addDish(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-subtle hover:bg-[color:var(--interactive-hover)]"
                            aria-label={`${increaseLabel}: ${pickLocalized(item.title, lang)}`}
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span>{formatDishPrice(item.price * item.quantity, lang, currencyCode)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-subtle pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-body text-secondary">{cartLabels.total}</span>
                  <span className="text-[20px] font-light text-primary">{formatDishPrice(cartTotal, lang, currencyCode)}</span>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex h-[46px] w-full items-center justify-center rounded-full bg-[color:var(--interactive-strong)] text-inverse text-ui tracking-[0.08em] transition-opacity hover:opacity-90"
                >
                  {cartLabels.checkout}
                </button>
                <div className="mt-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
                  <span>{cartLabels.toastCheckout}</span>
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </div>
                <a
                  href={toastOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#ff7a1a] px-5 shadow-[0_16px_34px_rgba(255,122,26,0.28)] transition-all hover:bg-[#ff8d3d] hover:shadow-[0_18px_42px_rgba(255,122,26,0.36)]"
                  aria-label={cartLabels.toastCheckout}
                >
                  <Image
                    src="/toast-logo-orange.svg"
                    alt=""
                    width={118}
                    height={48}
                    className="h-[30px] w-auto"
                    unoptimized
                  />
                </a>
                <p className="mt-3 text-[11px] leading-snug text-muted">{cartLabels.toastHint}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {activeInfoPopup ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
          <button
            type="button"
            className="delivery-info-overlay absolute inset-0 bg-[color:var(--overlay-backdrop)]"
            onClick={() => setActiveInfoPopup(null)}
            aria-label={closeInfoLabel}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={deliveryInfoLabels.deliveryTerms}
            className="delivery-info-card relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-subtle bg-panel p-6 text-primary shadow-[0_28px_90px_rgba(0,0,0,0.5)] md:p-8"
          >
            <div className="delivery-info-glow pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(174,14,22,0.32)_0%,rgba(174,14,22,0.14)_38%,transparent_70%)]" />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.32)] to-transparent" />

            <div className="mb-6 flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  {deliveryInfoLabels.section}
                </p>
                <h2 className="mt-3 font-serif text-[32px] uppercase leading-[0.95] tracking-[-0.03em] text-primary md:text-[42px]">
                  {deliveryInfoLabels.deliveryTerms}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveInfoPopup(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-subtle text-muted transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                aria-label={closeInfoLabel}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-3 text-body leading-relaxed text-secondary">
              <p>{deliveryInfoLabels.termsLine1}</p>
              <p>{deliveryInfoLabels.termsLine2}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isCartOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center xl:hidden">
          <button
            type="button"
            className="delivery-info-overlay absolute inset-0 bg-[color:var(--overlay-backdrop)]"
            onClick={() => setIsCartOpen(false)}
            aria-label={closeInfoLabel}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={cartLabels.title}
            className="delivery-info-card relative w-full max-h-[82vh] overflow-hidden rounded-t-[32px] border border-subtle bg-panel text-primary shadow-[0_-24px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[color:var(--border-subtle)]" />
            <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{deliveryInfoLabels.section}</p>
                <h2 className="mt-2 font-serif text-[34px] uppercase leading-none tracking-[-0.04em] text-primary">
                  {cartLabels.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-subtle text-muted transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                aria-label={closeInfoLabel}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="max-h-[46vh] overflow-y-auto px-5 pb-5">
              {cartItems.length === 0 ? (
                <div className="rounded-[22px] border border-subtle bg-card px-5 py-6 text-body text-secondary">
                  {cartLabels.empty}
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-[22px] border border-subtle bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[16px] leading-tight text-primary">{pickLocalized(item.title, lang)}</p>
                          {item.weight ? <p className="mt-2 text-[12px] text-muted">{item.weight}</p> : null}
                        </div>
                        <p className="shrink-0 text-[15px] text-secondary">
                          {formatDishPrice(item.price * item.quantity, lang, currencyCode)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[12px] uppercase tracking-[0.14em] text-muted">
                          {formatDishPrice(item.price, lang, currencyCode)}
                        </p>
                        <div className="inline-flex items-center gap-3 rounded-full border border-subtle px-2 py-1">
                          <button
                            type="button"
                            onClick={() => decreaseDish(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                            aria-label={`${decreaseLabel}: ${pickLocalized(item.title, lang)}`}
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-[15px] text-primary">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addDish(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                            aria-label={`${increaseLabel}: ${pickLocalized(item.title, lang)}`}
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-subtle bg-panel/95 px-5 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-body text-secondary">{cartLabels.total}</span>
                <span className="text-[24px] font-light text-primary">{formatDishPrice(cartTotal, lang, currencyCode)}</span>
              </div>
              <button
                type="button"
                disabled={cartItems.length === 0}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[color:var(--interactive-strong)] text-ui uppercase tracking-[0.1em] text-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {cartLabels.checkout}
              </button>
              <div className="mt-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
                <span>{cartLabels.toastCheckout}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </div>
              <a
                href={toastOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#ff7a1a] px-5 shadow-[0_16px_34px_rgba(255,122,26,0.26)] transition-all hover:bg-[#ff8d3d]"
                aria-label={cartLabels.toastCheckout}
              >
                <Image
                  src="/toast-logo-orange.svg"
                  alt=""
                  width={118}
                  height={48}
                  className="h-[30px] w-auto"
                  unoptimized
                />
              </a>
              <p className="mt-3 text-[11px] leading-snug text-muted">{cartLabels.toastHint}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-t from-base via-base/90 to-transparent xl:hidden" />

      <div className="fixed left-4 right-4 z-40 xl:hidden bottom-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="flex items-center gap-3 rounded-[28px] border border-subtle bg-[rgba(8,8,8,0.92)] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.62)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] px-2 py-1 text-left transition-colors hover:bg-[color:var(--interactive-bg)]"
            aria-label={cartLabels.title}
          >
            <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-subtle text-primary">
              <CartIcon className="h-5 w-5" />
              {cartItems.length > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#AE0E16] px-1 text-[10px] leading-none text-white">
                  {cartItems.length}
                </span>
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">{cartLabels.total}</span>
              <span className="mt-1 block truncate text-[18px] font-light leading-none text-primary">
                {formatDishPrice(cartTotal, lang, currencyCode)}
              </span>
            </span>
          </button>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <span className="text-[8px] uppercase leading-none tracking-[0.12em] text-muted">
              {cartLabels.toastCheckout}
            </span>
            <a
              href={toastOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[44px] w-[76px] items-center justify-center rounded-full bg-[#ff7a1a] shadow-[0_12px_28px_rgba(255,122,26,0.24)] transition-all hover:bg-[#ff8d3d]"
              aria-label={cartLabels.toastCheckout}
            >
              <Image
                src="/toast-logo-orange.svg"
                alt=""
                width={92}
                height={38}
                className="h-[22px] w-auto"
                unoptimized
              />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
