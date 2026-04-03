import type { Metadata } from 'next'
import PartnersPage from '@/components/PartnersPage'
import { getPartnersPageData } from '@/lib/getPartnersPage'
import { createPageMetadata } from '@/lib/seo/metadata'
import { resolveLang } from '@/lib/seo/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const langCode = resolveLang(lang)
  const data = await getPartnersPageData()

  const descriptions = {
    uz: 'Gōsht Group hamkorlari: xolding bilan ishlaydigan brendlar, kompaniyalar va strategik sheriklar.',
    ru: 'Партнёры Gōsht Group: бренды, компании и стратегические партнёры, работающие с холдингом.',
    en: 'Partners of Gōsht Group: brands, companies, and strategic collaborators working with the holding.',
  } as const

  return createPageMetadata({
    lang: langCode,
    pathname: 'partners',
    title:
      langCode === 'ru'
        ? 'Партнёры Gōsht Group'
        : langCode === 'en'
          ? 'Partners of Gōsht Group'
          : 'Gōsht Group hamkorlari',
    description: descriptions[langCode],
    image: data.partners[0]?.logo || '/logo.svg',
    keywords: ['Gōsht Group partners', 'партнёры Gōsht Group', 'restaurant holding partners'],
  })
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
