import RestaurantsConceptPage from './RestaurantsConceptPage';
import type { RestaurantsDirectoryData } from '@/lib/getRestaurantBranches';
import type { RestaurantsPageSettingsData } from '@/lib/getRestaurantsPageSettings';
import type { LangCode } from '@/types/i18n';

export default function RestaurantsDirectoryPage({ data, lang }: {
  data: RestaurantsDirectoryData;
  pageSettings?: RestaurantsPageSettingsData;
  lang: LangCode;
}) {
  return <RestaurantsConceptPage data={data} lang={lang} />;
}
