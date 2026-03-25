import { cache } from 'react'
import { client } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type RestaurantsPageSettingsRaw = {
  eyebrow?: LocalizedOptional
  title?: LocalizedOptional
  intro?: LocalizedOptional
}

export type RestaurantsPageSettingsData = {
  eyebrow: Localized
  title: Localized
  intro: Localized
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

const fallbackData: RestaurantsPageSettingsData = {
  eyebrow: {
    uz: 'RESTORANLAR TARMOg‘I',
    ru: 'СЕТЬ ПРОЕКТОВ',
    en: 'RESTAURANT NETWORK',
  },
  title: {
    uz: 'RESTORANLAR',
    ru: 'РЕСТОРАНЫ',
    en: 'RESTAURANTS',
  },
  intro: {
    uz: 'Loyihani tanlang, ro‘yxat va xarita o‘rtasida almashing va kerakli filialni darhol toping.',
    ru: 'Выбирайте проект, переключайтесь между списком и картой и сразу находите нужный филиал.',
    en: 'Choose a project, switch between list and map, and find the right branch right away.',
  },
}

const getRestaurantsPageSettings = cache(async (): Promise<RestaurantsPageSettingsRaw | null> => {
  try {
    const query = `
      *[_type == "restaurantsPageSettings" && _id == $documentId][0]{
        eyebrow,
        title,
        intro
      }
    `

    return await client.fetch<RestaurantsPageSettingsRaw | null>(query, {
      documentId: singletonDocumentIds.restaurantsPageSettings,
    })
  } catch (error) {
    console.error('Error fetching restaurants page settings:', error)
    return null
  }
})

export const getRestaurantsPageSettingsData = cache(
  async (): Promise<RestaurantsPageSettingsData> => {
    const settings = await getRestaurantsPageSettings()

    return {
      eyebrow: normalizeLocalized(settings?.eyebrow, fallbackData.eyebrow),
      title: normalizeLocalized(settings?.title, fallbackData.title),
      intro: normalizeLocalized(settings?.intro, fallbackData.intro),
    }
  }
)
