import type { Metadata } from 'next';
import RestaurantsDirectoryPage from '@/components/RestaurantsDirectoryPage';
import { getRestaurantBranchesData } from '@/lib/getRestaurantBranches';
import { getRestaurantsPageSettingsData } from '@/lib/getRestaurantsPageSettings';
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
  const data = await getRestaurantBranchesData();

  const descriptions = {
    uz: "Gōsht Group’ning Toshkentdagi restoranlari va formatlari: premium Gōsht, Mahalla by Gōsht, GŌSHT DONER, BLACK STAR BURGER va Topor barbershop.",
    ru: "Рестораны и форматы Gōsht Group в Ташкенте: премиальный Gōsht, Mahalla by Gōsht, GŌSHT DONER, BLACK STAR BURGER и барбершоп Topor.",
    en: "Restaurants and formats of Gōsht Group in Tashkent: premium Gōsht, Mahalla by Gōsht, GŌSHT DONER, BLACK STAR BURGER, and Topor barbershop.",
  } as const;

  return createPageMetadata({
    lang: langCode,
    pathname: 'restaurants',
    title:
      langCode === 'ru'
        ? 'Рестораны Gōsht Group в Ташкенте'
        : langCode === 'en'
          ? 'Gōsht Group restaurants in Tashkent'
          : 'Toshkentdagi Gōsht Group restoranlari',
    description: descriptions[langCode],
    image: data.branches.find((branch) => branch.cardImage)?.cardImage || '/logo.svg',
    keywords: [
      'Gōsht restaurant Tashkent',
      'рестораны Gōsht Group',
      'Mahalla by Gōsht',
      'GŌSHT DONER',
      'BLACK STAR BURGER',
      'Topor barbershop',
    ],
  });
}

export default async function RestaurantsRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = resolveLang(lang) as LangCode;
  const [data, pageSettings] = await Promise.all([
    getRestaurantBranchesData(),
    getRestaurantsPageSettingsData(),
  ]);

  return <RestaurantsDirectoryPage data={data} pageSettings={pageSettings} lang={langCode} />;
}
