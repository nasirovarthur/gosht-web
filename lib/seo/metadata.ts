import type { Metadata } from 'next'
import type { LangCode } from '@/types/i18n'
import { BRAND_NAME, getCanonicalUrl, getLanguageAlternates, getAbsoluteUrl } from '@/lib/seo/site'

const LOCALE_BY_LANG: Record<LangCode, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
}

type PageMetadataInput = {
  lang: LangCode
  pathname?: string
  title: string
  description: string
  image?: string
  keywords?: string[]
  type?: 'website' | 'article'
  noindex?: boolean
}

export function buildMetaTitle(title: string): string {
  return title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`
}

export function buildRobots(noindex = false): Metadata['robots'] {
  if (!noindex) {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    }
  }

  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  }
}

export function createPageMetadata({
  lang,
  pathname = '',
  title,
  description,
  image,
  keywords,
  type = 'website',
  noindex = false,
}: PageMetadataInput): Metadata {
  const fullTitle = buildMetaTitle(title)
  const canonical = getCanonicalUrl(lang, pathname)
  const languages = getLanguageAlternates(pathname)
  const absoluteImage = image ? getAbsoluteUrl(image) : undefined

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical,
      languages,
    },
    robots: buildRobots(noindex),
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: BRAND_NAME,
      locale: LOCALE_BY_LANG[lang],
      type,
      ...(absoluteImage ? { images: [{ url: absoluteImage, alt: title }] } : {}),
    },
    twitter: {
      card: absoluteImage ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    },
  }
}

export function createNoIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: buildRobots(true),
  }
}
