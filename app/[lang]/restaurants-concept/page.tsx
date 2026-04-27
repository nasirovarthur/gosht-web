import type { Metadata } from 'next';
import RestaurantsConceptPage from '@/components/RestaurantsConceptPage';
import { getRestaurantBranchesData } from '@/lib/getRestaurantBranches';
import { createPageMetadata } from '@/lib/seo/metadata';
import { resolveLang } from '@/lib/seo/site';
import type { LangCode } from '@/types/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const langCode = resolveLang(lang);

  return createPageMetadata({
    lang: langCode,
    pathname: 'restaurants-concept',
    title:
      langCode === 'ru'
        ? 'Концепт страницы ресторанов'
        : langCode === 'en'
          ? 'Restaurants page concept'
          : 'Restoranlar sahifasi konsepti',
    description:
      langCode === 'ru'
        ? 'Отдельный дизайн-концепт страницы ресторанов Gōsht Group.'
        : langCode === 'en'
          ? 'A standalone design concept for the Gōsht Group restaurants page.'
          : 'Gōsht Group restoranlari sahifasi uchun alohida dizayn konsepti.',
    noindex: true,
  });
}

export default async function RestaurantsConceptRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = resolveLang(lang) as LangCode;
  const data = await getRestaurantBranchesData();

  return <RestaurantsConceptPage data={data} lang={langCode} />;
}
