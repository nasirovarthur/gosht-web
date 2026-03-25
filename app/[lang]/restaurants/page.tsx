import RestaurantsDirectoryPage from '@/components/RestaurantsDirectoryPage';
import { getRestaurantBranchesData } from '@/lib/getRestaurantBranches';
import { getRestaurantsPageSettingsData } from '@/lib/getRestaurantsPageSettings';
import type { LangCode } from '@/types/i18n';

export default async function RestaurantsRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = (['uz', 'ru', 'en'].includes(lang) ? lang : 'uz') as LangCode;
  const [data, pageSettings] = await Promise.all([
    getRestaurantBranchesData(),
    getRestaurantsPageSettingsData(),
  ]);

  return <RestaurantsDirectoryPage data={data} pageSettings={pageSettings} lang={langCode} />;
}
