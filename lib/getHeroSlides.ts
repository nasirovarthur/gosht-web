import { client, urlFor } from './sanity'

type LocalizedString = {
  uz: string
  ru: string
  en: string
}

type HeroSlideRaw = {
  _id: string
  title: LocalizedString | string
  subtitle: LocalizedString | string
  description: LocalizedString | string
  buttonText: LocalizedString | string
  showButton: boolean
  image: any
  buttonUrl?: string
}

type HeroSlide = {
  id: string
  title: LocalizedString
  subtitle: LocalizedString
  description: LocalizedString
  buttonText: LocalizedString
  showButton: boolean
  image: string
  buttonUrl?: string
}

/**
 * Конвертирует строку или объект в LocalizedString
 */
function normalizeText(text: LocalizedString | string | undefined): LocalizedString {
  if (!text) return { uz: '', ru: '', en: '' }
  
  // Если это уже объект с uz/ru/en
  if (typeof text === 'object' && 'uz' in text) {
    return text
  }
  
  // Если это строка (старый формат), копируем на все языки
  if (typeof text === 'string') {
    return { uz: text, ru: text, en: text }
  }
  
  return { uz: '', ru: '', en: '' }
}

/**
 * Получает слайды с полной локализацией из Sanity
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const query = `
      *[_type == "heroSlide"] | order(_createdAt asc) {
        _id,
        title,
        subtitle,
        description,
        buttonText,
        showButton,
        image,
        buttonUrl
      }
    `

    const rawSlides = await client.fetch<HeroSlideRaw[]>(query)

    const slides = rawSlides.map((slide) => ({
      id: slide._id,
      title: normalizeText(slide.title),
      subtitle: normalizeText(slide.subtitle),
      description: normalizeText(slide.description),
      buttonText: normalizeText(slide.buttonText),
      showButton: slide.showButton !== false,
      image: slide.image ? urlFor(slide.image).url() : '',
      buttonUrl: slide.buttonUrl,
    }))

    return slides
  } catch (error) {
    console.error('Ошибка при получении слайдов:', error)
    return []
  }
}
