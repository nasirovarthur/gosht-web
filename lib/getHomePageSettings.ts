import { cache } from 'react'
import { client, sanityReadOptions } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type HeroSlideEventRaw = {
  slug?: string
  title?: LocalizedOptional
  date?: LocalizedOptional
  description?: Array<{ text?: LocalizedOptional } | LocalizedOptional>
  image?: string
}

export type HomeHeroSlideRaw = {
  _key?: string
  internalTitle?: string
  isActive?: boolean
  sourceType?: 'manual' | 'event'
  subtitle?: LocalizedOptional
  title?: LocalizedOptional
  description?: LocalizedOptional
  imageSource?: 'custom' | 'event'
  customImage?: string
  buttonMode?: 'none' | 'event' | 'custom'
  buttonText?: LocalizedOptional
  customButtonUrl?: string
  event?: HeroSlideEventRaw
}

type HomeHeroSliderSettingsRaw = {
  slides?: HomeHeroSlideRaw[]
}

type HomeRunningLineSettingsRaw = {
  text?: LocalizedOptional
}

export type HomeGroupStorySettingsRaw = {
  isActive?: boolean
  marquee?: LocalizedOptional
  titleTop?: LocalizedOptional
  titleBottom?: LocalizedOptional
  description?: LocalizedOptional
  ctaText?: LocalizedOptional
  ctaUrl?: string
  previewImage?: string
  portraitImage?: string
}

export type HomeEventsBlockSettingsRaw = {
  heading?: LocalizedOptional
  allEventsLabel?: LocalizedOptional
  featuredEventId?: string
  sideEventFirstId?: string
  sideEventSecondId?: string
}

export type HomeHeroButtonMode = 'none' | 'custom' | 'event'

const emptyLocalized: Localized = {
  uz: '',
  ru: '',
  en: '',
}

const defaultHeroButtonText: Localized = {
  uz: 'Batafsil',
  ru: 'Подробнее',
  en: 'Learn more',
}

export function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback: Localized = emptyLocalized
): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

function hasLocalizedContent(value?: LocalizedOptional | null): boolean {
  return Boolean(value?.uz || value?.ru || value?.en)
}

function firstEventParagraph(
  description?: Array<{ text?: LocalizedOptional } | LocalizedOptional>
): LocalizedOptional | undefined {
  if (!Array.isArray(description)) return undefined

  for (const paragraph of description) {
    const value =
      paragraph && typeof paragraph === 'object' && 'text' in paragraph
        ? paragraph.text
        : (paragraph as LocalizedOptional)

    if (hasLocalizedContent(value)) {
      return value
    }
  }

  return undefined
}

export const getHomeHeroSliderSettingsDocument = cache(
  async (): Promise<HomeHeroSliderSettingsRaw | null> => {
    try {
      const query = `
        *[_type == "homeHeroSliderSettings" && _id == $documentId][0]{
          slides[]{
            _key,
            internalTitle,
            isActive,
            sourceType,
            subtitle,
            title,
            description,
            imageSource,
            "customImage": customImage.asset->url,
            buttonMode,
            buttonText,
            customButtonUrl,
            "event": eventRef->{
              "slug": slug.current,
              title,
              date,
              description,
              "image": image.asset->url
            }
          }
        }
      `

      return await client.fetch<HomeHeroSliderSettingsRaw | null>(
        query,
        {
          documentId: singletonDocumentIds.homeHeroSliderSettings,
        },
        sanityReadOptions
      )
    } catch (error) {
      console.error('Error fetching home hero slider settings:', error)
      return null
    }
  }
)

export const getHomeRunningLineSettingsDocument = cache(
  async (): Promise<HomeRunningLineSettingsRaw | null> => {
    try {
      const query = `
        *[_type == "homeRunningLineSettings" && _id == $documentId][0]{
          text
        }
      `

      return await client.fetch<HomeRunningLineSettingsRaw | null>(
        query,
        {
          documentId: singletonDocumentIds.homeRunningLineSettings,
        },
        sanityReadOptions
      )
    } catch (error) {
      console.error('Error fetching home running line settings:', error)
      return null
    }
  }
)

export const getHomeGroupStorySettingsDocument = cache(
  async (): Promise<HomeGroupStorySettingsRaw | null> => {
    try {
      const query = `
        *[_type == "homeGroupStorySettings" && _id == $documentId][0]{
          isActive,
          marquee,
          titleTop,
          titleBottom,
          description,
          ctaText,
          ctaUrl,
          "previewImage": previewImage.asset->url,
          "portraitImage": portraitImage.asset->url
        }
      `

      return await client.fetch<HomeGroupStorySettingsRaw | null>(
        query,
        {
          documentId: singletonDocumentIds.homeGroupStorySettings,
        },
        sanityReadOptions
      )
    } catch (error) {
      console.error('Error fetching home group story settings:', error)
      return null
    }
  }
)

export const getHomeEventsBlockSettingsDocument = cache(
  async (): Promise<HomeEventsBlockSettingsRaw | null> => {
    try {
      const query = `
        *[_type == "homeEventsBlockSettings" && _id == $documentId][0]{
          heading,
          allEventsLabel,
          "featuredEventId": featuredEvent->_id,
          "sideEventFirstId": sideEventFirst->_id,
          "sideEventSecondId": sideEventSecond->_id
        }
      `

      return await client.fetch<HomeEventsBlockSettingsRaw | null>(
        query,
        {
          documentId: singletonDocumentIds.homeEventsBlockSettings,
        },
        sanityReadOptions
      )
    } catch (error) {
      console.error('Error fetching home events block settings:', error)
      return null
    }
  }
)

export function normalizeHomeHeroSlide(raw: HomeHeroSlideRaw) {
  const fallbackSubtitle = raw.event?.date
  const fallbackDescription = firstEventParagraph(raw.event?.description)
  const title = hasLocalizedContent(raw.title)
    ? normalizeLocalized(raw.title)
    : normalizeLocalized(raw.event?.title)
  const subtitle = hasLocalizedContent(raw.subtitle)
    ? normalizeLocalized(raw.subtitle)
    : normalizeLocalized(fallbackSubtitle)
  const description = hasLocalizedContent(raw.description)
    ? normalizeLocalized(raw.description)
    : normalizeLocalized(fallbackDescription)
  const image =
    raw.imageSource === 'event'
      ? raw.event?.image || raw.customImage || ''
      : raw.customImage || raw.event?.image || ''

  const buttonMode: HomeHeroButtonMode =
    raw.buttonMode === 'event' && raw.event?.slug
      ? 'event'
      : raw.buttonMode === 'custom' && raw.customButtonUrl
        ? 'custom'
        : 'none'

  return {
    id: raw._key || raw.internalTitle || crypto.randomUUID(),
    subtitle,
    title,
    description,
    buttonText: hasLocalizedContent(raw.buttonText)
      ? normalizeLocalized(raw.buttonText)
      : defaultHeroButtonText,
    buttonMode,
    showButton: buttonMode !== 'none',
    image,
    buttonUrl: buttonMode === 'custom' ? raw.customButtonUrl : undefined,
    eventSlug: buttonMode === 'event' ? raw.event?.slug : undefined,
  }
}

export function normalizeHomeRunningLine(
  value?: { text?: LocalizedOptional } | null
) {
  if (!value?.text) return null
  return {
    text: normalizeLocalized(value.text),
  }
}

export function normalizeHomeGroupStory(
  value?: HomeGroupStorySettingsRaw | null
) {
  if (!value || value.isActive === false) return null

  return {
    marquee: value.marquee,
    titleTop: value.titleTop,
    titleBottom: value.titleBottom,
    description: value.description,
    ctaText: value.ctaText,
    ctaUrl: value.ctaUrl,
    previewImage: value.previewImage,
    portraitImage: value.portraitImage,
  }
}
