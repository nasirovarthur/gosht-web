import type { DeliveryMenuDish } from '@/types/deliveryMenu';

export function selectHomeDishes(dishes: DeliveryMenuDish[], limit = 6): DeliveryMenuDish[] {
  const candidates = dishes.filter(dish => dish.isAvailable !== false && dish.image
    && typeof dish.price === 'number' && Number.isFinite(dish.price) && dish.price > 0
    && !/соус|дополн|упаков|прибор|sauce|extra|packag|cutler/i.test(Object.values(dish.categoryLabel).join(' ')));
  const selected: DeliveryMenuDish[] = [];
  const ids = new Set<string>();
  const categories = new Set<string>();
  const add = (dish: DeliveryMenuDish) => {
    if (ids.has(dish.id) || selected.length >= limit) return;
    selected.push(dish); ids.add(dish.id); categories.add(dish.categoryId);
  };
  for (const dish of candidates.filter(dish => dish.featured)) add(dish);
  for (const dish of candidates) if (!categories.has(dish.categoryId)) add(dish);
  for (const dish of candidates) add(dish);
  return selected;
}

export function formatMenuPrice(price: number, lang: 'ru' | 'uz' | 'en') {
  return `${new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US').format(price)} ${lang === 'ru' ? 'сум' : lang === 'uz' ? "so'm" : 'UZS'}`;
}
