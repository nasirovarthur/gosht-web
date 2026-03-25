import PartnersPage from '@/components/PartnersPage'
import { getPartnersPageData } from '@/lib/getPartnersPage'
import type { LangCode } from '@/types/i18n'

function resolveLang(lang: string): LangCode {
  return (['uz', 'ru', 'en'].includes(lang) ? lang : 'uz') as LangCode
}

export default async function PartnersRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const data = await getPartnersPageData()

  return <PartnersPage lang={resolveLang(lang)} data={data} />
}
