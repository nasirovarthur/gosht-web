import {
  getHomeHeroSliderSettingsDocument,
  normalizeHomeHeroSlide,
} from './getHomePageSettings'

type HeroSlide = {
  id: string
  title: { uz: string; ru: string; en: string }
  subtitle: { uz: string; ru: string; en: string }
  description: { uz: string; ru: string; en: string }
  buttonText: { uz: string; ru: string; en: string }
  showButton: boolean
  image: string
  buttonMode: 'none' | 'custom' | 'event'
  buttonUrl?: string
  eventSlug?: string
}

/**
 * Получает слайды главной из новых singleton-настроек
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const nextSlides = ((await getHomeHeroSliderSettingsDocument())?.slides || [])
      .filter((slide) => slide.isActive !== false)
      .map(normalizeHomeHeroSlide)
      .filter((slide) => slide.image)

    return nextSlides
  } catch (error) {
    console.error('Ошибка при получении слайдов:', error)
    return []
  }
}
