'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { pickLocalized, translations } from '@/types/i18n';
import type { Localized } from '@/types/i18n';
import type {
  DeliveryMenuCategory,
  DeliveryMenuDish,
  DeliveryMenuDishBadge,
} from '@/types/deliveryMenu';

const ALL_CATEGORY_LABEL: Localized = { uz: 'BARCHASI', ru: 'ВСЕ', en: 'ALL' };
const ALL_GROUP_ID = 'all';
const ALL_IN_GROUP_LABEL: Localized = { uz: 'Barchasi', ru: 'Все в разделе', en: 'All in section' };

const MENU_CATEGORY_GROUPS = [
  {
    id: 'starters',
    label: { uz: 'GAZAKLAR', ru: 'ЗАКУСКИ', en: 'STARTERS' },
    patterns: ['starter', 'appetizer', 'закуск', 'gazak'],
  },
  {
    id: 'salads-soups',
    label: { uz: 'SALATLAR / SHO‘RVALAR', ru: 'САЛАТЫ / СУПЫ', en: 'SALADS / SOUPS' },
    patterns: ['salad', 'салат', 'soup', 'суп', 'sho rva', 'шурпа'],
  },
  {
    id: 'boards',
    label: { uz: 'SETLAR', ru: 'СЕТЫ', en: 'BOARDS' },
    patterns: ['board', 'iftar', 'сет', 'set'],
  },
  {
    id: 'grill',
    label: { uz: 'GO‘SHT / GRILL', ru: 'МЯСО / ГРИЛЬ', en: 'MEAT / GRILL' },
    patterns: ['steak', 'beef', 'lamb', 'chicken', 'fish', 'seafood', 'sausage', 'стейк', 'мяс', 'гриль', 'говядин', 'баран', 'куриц', 'рыб', 'морепродукт', 'колбас'],
  },
  {
    id: 'burgers',
    label: { uz: 'BURGERLAR', ru: 'БУРГЕРЫ', en: 'BURGERS' },
    patterns: ['between bun', 'burger', 'бургер', 'doner', 'донер', 'hot dog', 'хот дог'],
  },
  {
    id: 'pasta-sides',
    label: { uz: 'PASTA / GARNIR', ru: 'ПАСТА / ГАРНИРЫ', en: 'PASTA / SIDES' },
    patterns: ['pasta', 'side', 'паста', 'гарнир', 'bread', 'хлеб', 'non'],
  },
  {
    id: 'kids',
    label: { uz: 'BOLALAR', ru: 'ДЕТЯМ', en: 'KIDS' },
    patterns: ['kid', 'дет', 'bolalar'],
  },
  {
    id: 'desserts',
    label: { uz: 'DESERTLAR', ru: 'ДЕСЕРТЫ', en: 'DESSERTS' },
    patterns: ['dessert', 'десерт', 'shirin'],
  },
  {
    id: 'drinks',
    label: { uz: 'ICHIMLIKLAR', ru: 'НАПИТКИ', en: 'DRINKS' },
    patterns: ['beverage', 'lemonade', 'smoothie', 'coffee', 'milkshake', 'mocktail', 'cocktail', 'fresh', 'tea', 'can', 'напит', 'лимонад', 'кофе', 'чай', 'сок', 'вода', 'шейк', 'фреш'],
  },
  {
    id: 'add-ons',
    label: { uz: 'QO‘SHIMCHA', ru: 'ДОПОЛНИТЕЛЬНО', en: 'ADD-ONS' },
    patterns: ['sauce', 'extra', 'соус', 'дополн'],
  },
  {
    id: 'other',
    label: { uz: 'BOSHQA', ru: 'ДРУГОЕ', en: 'OTHER' },
    patterns: [],
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

function formatDishPrice(
  price: number | undefined,
  lang: 'uz' | 'ru' | 'en',
  currencyCode: string,
  allowZero = false
): string {
  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    (!allowZero && price === 0)
  ) {
    return lang === 'ru' ? 'Цена уточняется' : lang === 'en' ? 'Price TBD' : 'Narx aniqlanmoqda';
  }

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

function formatCartItemCount(count: number, lang: 'uz' | 'ru' | 'en'): string {
  if (lang === 'ru') {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;
    const noun =
      lastTwoDigits >= 11 && lastTwoDigits <= 14
        ? 'позиций'
        : lastDigit === 1
          ? 'позиция'
          : lastDigit >= 2 && lastDigit <= 4
            ? 'позиции'
            : 'позиций';
    return `${count} ${noun}`;
  }

  if (lang === 'en') {
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  return `${count} taom`;
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
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/gōsht/g, 'gosht')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function getCategoryGroupId(categoryLabel: Localized): MenuGroupId {
  const normalizedLabel = normalizeMenuCategory(pickLocalized(categoryLabel, 'en') || pickLocalized(categoryLabel, 'ru'));
  const group = MENU_CATEGORY_GROUPS.find((item) =>
    item.patterns.some((pattern) => normalizedLabel.includes(pattern))
  );

  return group?.id || 'other';
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
  categories?: DeliveryMenuCategory[];
  dishes?: DeliveryMenuDish[];
  currencyCode?: string;
  requireApiDishes?: boolean;
};

type InfoPopup = 'delivery' | null;

export default function RestaurantDeliveryMenuPage({
  backHref,
  restaurant,
  categories: apiCategories,
  dishes,
  currencyCode = 'UZS',
  requireApiDishes = false,
}: RestaurantDeliveryMenuProps) {
  const { lang } = useLanguage();
  const t = translations.restaurantDetail;
  const hasApiDishes = Array.isArray(dishes) && dishes.length > 0;
  const menuDishes = useMemo(
    () => (hasApiDishes ? dishes : []),
    [dishes, hasApiDishes]
  );
  const [activeMenuGroup, setActiveMenuGroup] = useState<MenuGroupId>(ALL_GROUP_ID);
  const [activeSubcategory, setActiveSubcategory] = useState<string>(ALL_GROUP_ID);
  const [activeInfoPopup, setActiveInfoPopup] = useState<InfoPopup>(null);
  const [selectedDish, setSelectedDish] = useState<DeliveryMenuDish | null>(null);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set());

  useBodyScrollLock(Boolean(activeInfoPopup || selectedDish || isCartOpen));

  const markImageAsFailed = (imageUrl: string) => {
    setFailedImageUrls((current) => {
      if (current.has(imageUrl)) return current;
      const next = new Set(current);
      next.add(imageUrl);
      return next;
    });
  };

  const deliveryCategories = useMemo(() => {
    const categories: DeliveryMenuCategory[] = [
      { id: ALL_GROUP_ID, label: ALL_CATEGORY_LABEL, order: -1, isAvailable: true },
    ];
    const seen = new Set<string>();

    for (const category of (apiCategories || []).toSorted((a, b) => a.order - b.order)) {
      if (!category.id || category.id === ALL_GROUP_ID || seen.has(category.id)) {
        continue;
      }

      seen.add(category.id);
      categories.push(category);
    }

    for (const dish of menuDishes) {
      if (seen.has(dish.categoryId)) {
        continue;
      }

      seen.add(dish.categoryId);
      categories.push({
        id: dish.categoryId,
        label: dish.categoryLabel,
        order: categories.length,
        isAvailable: true,
      });
    }

    return categories;
  }, [apiCategories, menuDishes]);

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
      const dishGroup = categoryGroupsById.get(dish.categoryId) || 'other';

      if (activeMenuGroup !== ALL_GROUP_ID && dishGroup !== activeMenuGroup) {
        return false;
      }

      if (activeSubcategory !== ALL_GROUP_ID && dish.categoryId !== activeSubcategory) {
        return false;
      }

      return true;
    });

    return dishes.toSorted((a, b) => {
      const groupA = categoryGroupsById.get(a.categoryId) || 'other';
      const groupB = categoryGroupsById.get(b.categoryId) || 'other';
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

  const cartLines = useMemo(
    () =>
      menuDishes
        .filter((dish) => (cartItems[dish.id] || 0) > 0)
        .map((dish) => ({ dish, quantity: cartItems[dish.id] })),
    [cartItems, menuDishes]
  );
  const cartItemCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cartLines.reduce(
    (total, line) => total + (line.dish.price || 0) * line.quantity,
    0
  );

  const changeCartQuantity = (dishId: string, change: number) => {
    setCartItems((current) => {
      const nextQuantity = Math.max(0, (current[dishId] || 0) + change);
      if (nextQuantity === 0) {
        const next = { ...current };
        delete next[dishId];
        return next;
      }
      return { ...current, [dishId]: nextQuantity };
    });
  };

  const cartLabels =
    lang === 'ru'
      ? {
          title: 'ДЕМО-КОРЗИНА',
          checkout: 'ОФОРМЛЕНИЕ ПОЗЖЕ',
          hint: 'Меню синхронизируется с iiko. Сейчас это демонстрационный просмотр без оформления заказа.',
          back: 'Назад к ресторану',
          pending: 'СКОРО',
          add: 'Добавить',
          empty: 'Добавьте блюда, чтобы собрать демонстрационный заказ.',
          total: 'Итого',
          open: 'Открыть корзину',
          close: 'Закрыть корзину',
          decrease: 'Уменьшить количество',
          increase: 'Увеличить количество',
        }
      : lang === 'en'
        ? {
            title: 'DEMO CART',
            checkout: 'CHECKOUT LATER',
            hint: 'Menu is synced with iiko. This is a demo preview without checkout for now.',
            back: 'Back to restaurant',
            pending: 'SOON',
            add: 'Add',
            empty: 'Add dishes to build a demo order.',
            total: 'Total',
            open: 'Open cart',
            close: 'Close cart',
            decrease: 'Decrease quantity',
            increase: 'Increase quantity',
          }
        : {
            title: 'DEMO SAVAT',
            checkout: 'BUYURTMA KEYIN',
            hint: 'Menyu iiko bilan sinxronlanadi. Hozircha bu buyurtmasiz demo ko‘rinish.',
            back: 'Restoranga qaytish',
            pending: 'TEZ ORADA',
            add: 'Qo‘shish',
            empty: 'Demo buyurtma yaratish uchun taom qo‘shing.',
            total: 'Jami',
            open: 'Savatni ochish',
            close: 'Savatni yopish',
            decrease: 'Miqdorni kamaytirish',
            increase: 'Miqdorni oshirish',
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
  const openDishLabel = lang === 'ru' ? 'Открыть блюдо' : lang === 'en' ? 'Open dish' : 'Taomni ochish';
  const imagePendingLabel = lang === 'ru' ? 'Без фотографии' : lang === 'en' ? 'No photo' : 'Fotosuratsiz';
  const dishDescriptionFallback =
    lang === 'ru'
      ? 'Описание блюда скоро появится.'
      : lang === 'en'
        ? 'Dish description is coming soon.'
        : 'Taom tavsifi tez orada paydo bo‘ladi.';
  const emptyMenuLabel = requireApiDishes
    ? lang === 'ru'
      ? 'Меню временно недоступно. Мы не смогли получить данные из iiko.'
      : lang === 'en'
        ? 'Menu is temporarily unavailable. We could not load data from iiko.'
        : 'Menyu vaqtincha mavjud emas. iiko ma’lumotlarini yuklab bo‘lmadi.'
    : lang === 'ru'
      ? 'Меню временно недоступно.'
      : lang === 'en'
        ? 'Menu is temporarily unavailable.'
        : 'Menyu vaqtincha mavjud emas.';
  const emptyCategoryLabel =
    lang === 'ru'
      ? 'В этой категории пока нет блюд.'
      : lang === 'en'
        ? 'There are no dishes in this category yet.'
        : 'Bu kategoriyada hozircha taomlar yo‘q.';
  const selectedDishImage =
    selectedDish?.image && !failedImageUrls.has(selectedDish.image)
      ? selectedDish.image
      : null;
  const renderAddControl = (dish: DeliveryMenuDish, className: string) => {
    const canAdd =
      dish.isAvailable !== false &&
      typeof dish.price === 'number' &&
      Number.isFinite(dish.price) &&
      dish.price > 0;

    return (
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => {
          changeCartQuantity(dish.id, 1);
          setSelectedDish(null);
        }}
        className={`${className} ${
          canAdd
            ? 'bg-primary text-inverse hover:opacity-90'
            : 'cursor-not-allowed bg-[color:var(--interactive-hover)] text-muted shadow-none'
        }`}
        aria-label={`${cartLabels.add}: ${pickLocalized(dish.title, lang)}`}
      >
        <span className="text-[12px] uppercase tracking-[0.16em]">{cartLabels.add}</span>
      </button>
    );
  };

  const renderCartContents = () => (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-ui uppercase tracking-[0.18em] text-muted">{cartLabels.title}</h2>
        <span className="text-[12px] text-secondary">
          {formatCartItemCount(cartItemCount, lang)}
        </span>
      </div>

      {cartLines.length === 0 ? (
        <p className="mt-5 text-body leading-relaxed text-secondary">{cartLabels.empty}</p>
      ) : (
        <div className="mt-5 border-t border-subtle">
          {cartLines.map(({ dish, quantity }) => (
            <div key={dish.id} className="border-b border-subtle py-4">
              <p className="text-[15px] leading-tight text-primary">
                {pickLocalized(dish.title, lang)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[13px] text-secondary">
                  {formatDishPrice((dish.price || 0) * quantity, lang, currencyCode)}
                </span>
                <div className="grid grid-cols-[34px_36px_34px] items-center border border-subtle">
                  <button
                    type="button"
                    onClick={() => changeCartQuantity(dish.id, -1)}
                    className="h-[34px] text-lg text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                    aria-label={`${cartLabels.decrease}: ${pickLocalized(dish.title, lang)}`}
                    title={cartLabels.decrease}
                  >
                    −
                  </button>
                  <span className="text-center text-[13px] text-primary">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeCartQuantity(dish.id, 1)}
                    className="h-[34px] text-lg text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                    aria-label={`${cartLabels.increase}: ${pickLocalized(dish.title, lang)}`}
                    title={cartLabels.increase}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <span className="text-[12px] uppercase tracking-[0.14em] text-muted">{cartLabels.total}</span>
        <span className="text-[22px] font-light text-primary">
          {formatDishPrice(cartTotal, lang, currencyCode, true)}
        </span>
      </div>
      <button
        type="button"
        disabled
        className="mt-5 inline-flex h-[48px] w-full cursor-not-allowed items-center justify-center border border-subtle bg-[color:var(--interactive-hover)] px-5 text-muted"
        aria-label={cartLabels.checkout}
      >
        <span className="text-[11px] uppercase tracking-[0.14em]">{cartLabels.pending}</span>
      </button>
      <p className="mt-3 text-[11px] leading-snug text-muted">{cartLabels.hint}</p>
    </>
  );

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
        </div>

        <div
          className={`grid grid-cols-1 gap-8 xl:items-start ${
            menuDishes.length > 0 ? 'xl:grid-cols-[minmax(0,1fr)_340px]' : ''
          }`}
        >
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
              <h1 className="mt-3 font-serif text-[46px] font-light uppercase leading-[0.88] text-primary md:text-[72px] xl:text-[92px] 2xl:text-[104px]">
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
                    className="inline-flex h-[50px] w-[230px] max-w-full items-center justify-center rounded-full border border-subtle px-7 text-[12px] uppercase tracking-[0.16em] text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                  >
                    {deliveryInfoLabels.deliveryTerms}
                  </button>
                  {fullMenuUrl ? (
                    <a
                      href={fullMenuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-[50px] w-[230px] max-w-full items-center justify-center rounded-full border border-subtle px-7 text-[12px] uppercase tracking-[0.16em] text-secondary transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
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
              className="mt-7 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
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
                className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
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

            <div className="mt-7 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:auto-rows-[minmax(210px,auto)]">
              {filteredDishes.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-4 border border-subtle bg-card px-5 py-8 text-body text-secondary">
                  {menuDishes.length === 0 ? emptyMenuLabel : emptyCategoryLabel}
                </div>
              ) : filteredDishes.map((dish, index) => {
                const imageSrc =
                  dish.image && !failedImageUrls.has(dish.image) ? dish.image : null;
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
                    role="button"
                    tabIndex={0}
                    aria-label={`${openDishLabel}: ${pickLocalized(dish.title, lang)}`}
                    onClick={() => setSelectedDish(dish)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedDish(dish);
                      }
                    }}
                    className={`relative cursor-pointer [-webkit-tap-highlight-color:transparent] focus:outline-none ${layoutClass} ${
                      hasDishImage ? '' : 'min-h-[210px] border border-subtle bg-card'
                    }`}
                  >
                    {imageSrc ? (
                      <div className={`relative overflow-hidden ${isFeatured ? 'aspect-[16/11] md:aspect-[16/10]' : 'aspect-[16/10]'}`}>
                        <Image
                          src={imageSrc}
                          alt={pickLocalized(dish.title, lang)}
                          fill
                          sizes={isFeatured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 25vw'}
                          className="object-cover"
                          unoptimized
                          onError={() => markImageAsFailed(imageSrc)}
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    ) : null}

                    <div className={hasDishImage ? 'px-1 pb-1 pt-3 md:pt-4' : 'flex min-h-[210px] flex-col p-5'}>
                      {!hasDishImage ? (
                        <span className="mb-8 text-[10px] uppercase tracking-[0.14em] text-muted">
                          {imagePendingLabel}
                        </span>
                      ) : null}
                      <div className="flex items-center gap-2.5">
                        <DishBadgeIcons badges={dish.badges} lang={lang} isFeatured={isFeatured} />
                        <h3 className={`font-light leading-[1.08] text-primary ${isFeatured ? 'font-serif text-[20px] uppercase md:text-[24px] xl:text-[30px]' : 'text-[16px] md:text-[18px] xl:text-[20px]'}`}>
                          {pickLocalized(dish.title, lang)}
                        </h3>
                      </div>
                      {dish.weight ? <p className="mt-2 text-[12px] text-muted md:text-[13px]">{dish.weight}</p> : null}
                      {!hasDishImage && pickLocalized(dish.description, lang) ? (
                        <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-secondary">
                          {pickLocalized(dish.description, lang)}
                        </p>
                      ) : null}
                      <p className={`${hasDishImage ? 'mt-2' : 'mt-auto pt-5'} text-[17px] font-light text-primary md:text-[19px]`}>
                        {formatDishPrice(dish.price, lang, currencyCode)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>

          {menuDishes.length > 0 ? (
            <aside className="hidden xl:sticky xl:top-[136px] xl:block">
              <div className="border border-subtle bg-card p-5">
                {renderCartContents()}
              </div>
            </aside>
          ) : null}
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
            className="delivery-info-card relative w-full max-w-[520px] overflow-hidden rounded-[8px] border border-subtle bg-panel p-6 text-primary shadow-[0_28px_90px_rgba(0,0,0,0.5)] md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  {deliveryInfoLabels.section}
                </p>
                <h2 className="mt-3 font-serif text-[32px] uppercase leading-[0.95] text-primary md:text-[42px]">
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

      {selectedDish ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 md:items-center md:p-6">
          <button
            type="button"
            className="delivery-info-overlay absolute inset-0 bg-[color:var(--overlay-backdrop)]"
            onClick={() => setSelectedDish(null)}
            aria-label={closeInfoLabel}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={pickLocalized(selectedDish.title, lang)}
            className={`delivery-info-card relative flex max-h-[90vh] w-full flex-col overflow-hidden border border-subtle bg-panel text-primary shadow-[0_28px_90px_rgba(0,0,0,0.54)] ${
              selectedDishImage
                ? 'max-w-[880px] md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(320px,1fr)]'
                : 'max-w-[620px]'
            }`}
          >
            {selectedDishImage ? (
              <div className="relative min-h-[260px] bg-card md:min-h-[560px]">
                <Image
                  src={selectedDishImage}
                  alt={pickLocalized(selectedDish.title, lang)}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                  unoptimized
                  onError={() => markImageAsFailed(selectedDishImage)}
                />
              </div>
            ) : null}

            <div className="flex min-h-0 flex-col">
              <div className="flex items-start justify-between gap-5 border-b border-subtle px-5 py-5 md:px-7 md:py-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    {pickLocalized(selectedDish.categoryLabel, lang)}
                  </p>
                  <h2 className="mt-3 font-serif text-[34px] uppercase leading-[0.92] text-primary md:text-[46px]">
                    {pickLocalized(selectedDish.title, lang)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDish(null)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-subtle text-muted transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                  aria-label={closeInfoLabel}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
                <div className="flex flex-wrap items-center gap-3">
                  <DishBadgeIcons badges={selectedDish.badges} lang={lang} isFeatured={false} />
                  {selectedDish.weight ? (
                    <span className="rounded-full border border-subtle px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-muted">
                      {selectedDish.weight}
                    </span>
                  ) : null}
                </div>

                <p className="mt-5 text-[17px] leading-relaxed text-secondary md:text-[18px]">
                  {pickLocalized(selectedDish.description, lang) || dishDescriptionFallback}
                </p>
              </div>

              <div className="border-t border-subtle px-5 py-5 md:px-7">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{cartLabels.title}</p>
                    <p className="mt-1 text-[24px] font-light text-primary">
                      {formatDishPrice(selectedDish.price, lang, currencyCode)}
                    </p>
                  </div>
                </div>

                {renderAddControl(
                  selectedDish,
                  'inline-flex h-[52px] w-full items-center justify-center border border-subtle px-6 transition-all'
                )}
                <p className="mt-3 text-[11px] leading-snug text-muted">{cartLabels.hint}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cartItemCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-30 flex h-[52px] items-center justify-between border border-strong bg-primary px-5 text-inverse shadow-[0_16px_36px_rgba(0,0,0,0.35)] xl:hidden"
          aria-label={cartLabels.open}
        >
          <span className="text-[12px] uppercase tracking-[0.14em]">{cartLabels.title}</span>
          <span className="text-[14px]">{cartItemCount}</span>
        </button>
      ) : null}

      {isCartOpen ? (
        <div className="fixed inset-0 z-50 flex items-end xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[color:var(--overlay-backdrop)]"
            onClick={() => setIsCartOpen(false)}
            aria-label={cartLabels.close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={cartLabels.title}
            className="relative max-h-[82vh] w-full overflow-y-auto border-t border-subtle bg-panel p-5 pb-8 text-primary"
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-subtle text-muted transition-colors hover:bg-[color:var(--interactive-hover)] hover:text-primary"
                aria-label={cartLabels.close}
              >
                <CloseIcon />
              </button>
            </div>
            {renderCartContents()}
          </div>
        </div>
      ) : null}

    </main>
  );
}
