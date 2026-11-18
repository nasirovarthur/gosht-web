const EXCLUDED_GOSHT_MARKERS = ['mahalla', 'doner', 'blackstar', 'topor', 'catering', 'kids', 'lavka'];
const GOSHT_MENU_BRANCHES = new Set(['gosht-west', 'gosht-mirabad', 'gosht-boulevard', 'gosht-muqimiy']);

type SharedMenuVenue = {
  slug: string;
  source: 'branch' | 'legacy';
  city?: string;
  projectType?: string;
  names: string[];
};

export function isGoshtMenuBranch(slug?: string): boolean {
  return GOSHT_MENU_BRANCHES.has(slug?.replace(/^\/+|\/+$/g, '') || '');
}

export function hasGoshtSharedMenu({ slug, source, city, projectType, names }: SharedMenuVenue): boolean {
  const normalizedNames = names.join(' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const isEligibleVenue = source === 'legacy' || (city === 'tashkent' && projectType !== 'barbershop');

  return isGoshtMenuBranch(slug)
    && isEligibleVenue
    && normalizedNames.includes('gosht')
    && !EXCLUDED_GOSHT_MARKERS.some(marker => normalizedNames.includes(marker));
}
