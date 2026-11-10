type HomeRestaurant = { slug?: string; projectType: 'restaurant' | 'barbershop' };

function priority(item: HomeRestaurant): number {
  if (item.projectType !== 'restaurant') return 3;
  const slug = item.slug?.replace(/^\/+|\/+$/g, '').toLowerCase() || '';
  if (slug === 'gosht-west') return 0;
  if (/^gosht-(?!doner(?:-|$))/.test(slug)) return 1;
  if (/^gosht-doner(?:-|$)/.test(slug)) return 2;
  return 3;
}

export function prioritizeHomeRestaurants<T extends HomeRestaurant>(items: readonly T[]): T[] {
  return [...items].sort((left, right) => priority(left) - priority(right));
}
