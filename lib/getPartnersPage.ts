import { cache } from 'react'
import { client } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type PartnerRaw = {
  _key?: string
  companyName?: string
  website?: string
  logo?: string
}

type PartnersPageSettingsRaw = {
  title?: LocalizedOptional
  partners?: PartnerRaw[]
}

export type PartnerItem = {
  id: string
  companyName: string
  website: string
  logo: string
}

export type PartnersPageData = {
  title: Localized
  partners: PartnerItem[]
}

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback: Localized = { uz: '', ru: '', en: '' }
): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

const fallbackData: PartnersPageData = {
  title: {
    uz: 'HAMKORLAR GŌSHT GROUP',
    ru: 'ПАРТНЁРЫ GŌSHT GROUP',
    en: 'GŌSHT GROUP PARTNERS',
  },
  partners: [
    {
      id: 'exeed',
      companyName: 'EXEED',
      website: 'https://exeed.ru/',
      logo: '/partners/ember-supply.svg',
    },
    {
      id: 'world-class',
      companyName: 'WORLD CLASS',
      website: 'https://special.worldclass.ru/',
      logo: '/partners/atlas-hospitality.svg',
    },
    {
      id: 'medical-center',
      companyName: 'ЛЕЧЕБНЫЙ ЦЕНТР',
      website: 'https://www.lcenter.ru/',
      logo: '/partners/nova-market.svg',
    },
    {
      id: 'simple-wine',
      companyName: 'SIMPLE WINE',
      website: 'https://simplewine.ru',
      logo: '/partners/field-roast.svg',
    },
    {
      id: 'mir-supreme',
      companyName: 'MIR SUPREME',
      website: 'https://vamprivet.ru/supreme/',
      logo: '/partners/linen-studio.svg',
    },
  ],
}

const getPartnersPageSettings = cache(async (): Promise<PartnersPageSettingsRaw | null> => {
  try {
    const query = `
      *[_type == "partnersPageSettings" && _id == $documentId][0]{
        title,
        "partners": partners[]{
          _key,
          companyName,
          website,
          "logo": logo.asset->url
        }
      }
    `

    return await client.fetch<PartnersPageSettingsRaw | null>(query, {
      documentId: singletonDocumentIds.partnersPageSettings,
    })
  } catch (error) {
    console.error('Error fetching partners page settings:', error)
    return null
  }
})

export const getPartnersPageData = cache(async (): Promise<PartnersPageData> => {
  const settings = await getPartnersPageSettings()

  const partners =
    settings?.partners
      ?.filter((partner) => partner?.companyName && partner?.website)
      .map((partner, index) => ({
        id: partner._key || `partner-${index + 1}`,
        companyName: partner.companyName || '',
        website: partner.website || '',
        logo: partner.logo || fallbackData.partners[index % fallbackData.partners.length].logo,
      })) || []

  return {
    title: normalizeLocalized(settings?.title, fallbackData.title),
    partners: partners.length > 0 ? partners : fallbackData.partners,
  }
})
