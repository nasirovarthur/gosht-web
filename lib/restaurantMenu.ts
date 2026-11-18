const EXCLUDED_GOSHT_MARKERS = ['mahalla', 'doner', 'blackstar', 'topor', 'catering', 'kids', 'lavka'];

type DeliveryMenuVenue = {
  slug: string;
  source: 'branch' | 'legacy';
  city?: string;
  projectType?: string;
  names: string[];
};

export function hasGoshtDeliveryMenu({ slug, source, city, projectType, names }: DeliveryMenuVenue): boolean {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const normalizedNames = names.join(' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const isEligibleVenue = source === 'legacy' || (city === 'tashkent' && projectType !== 'barbershop');

  return normalizedSlug === 'gosht-west'
    && isEligibleVenue
    && normalizedNames.includes('gosht')
    && !EXCLUDED_GOSHT_MARKERS.some(marker => normalizedNames.includes(marker));
}
