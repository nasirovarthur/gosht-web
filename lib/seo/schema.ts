import type { LangCode } from '@/types/i18n'
import { BRAND_NAME, BRAND_VARIANTS, getAbsoluteUrl, getCanonicalUrl, getSiteUrl } from '@/lib/seo/site'

type BreadcrumbItem = {
  name: string
  path: string
}

type VenueSchemaInput = {
  lang: LangCode
  path: string
  name: string
  description: string
  image?: string
  telephone?: string
  address?: string
  menu?: string
  priceRange?: string
  primaryInfo?: string
  businessType: 'Restaurant' | 'Barbershop'
}

type EventSchemaInput = {
  lang: LangCode
  path: string
  name: string
  description: string
  image?: string
  startDate?: string
  locationName?: string
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${getSiteUrl()}/#organization`,
    name: BRAND_NAME,
    alternateName: BRAND_VARIANTS,
    url: getSiteUrl(),
    logo: getAbsoluteUrl('/logo.svg'),
    description:
      'Gōsht Group is a restaurant holding in Tashkent that brings together premium restaurants, fast-food projects, barbershop, catering, and branded hospitality concepts.',
    areaServed: {
      '@type': 'City',
      name: 'Tashkent',
    },
    knowsAbout: [
      'restaurant holding',
      'premium restaurants',
      'steakhouse',
      'fast-food projects',
      'barbershop',
      'catering',
    ],
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${getSiteUrl()}/#website`,
    url: getSiteUrl(),
    name: BRAND_NAME,
    publisher: {
      '@id': `${getSiteUrl()}/#organization`,
    },
    inLanguage: ['uz', 'ru', 'en'],
  }
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  }
}

export function getVenueSchema({
  lang,
  path,
  name,
  description,
  image,
  telephone,
  address,
  menu,
  priceRange,
  primaryInfo,
  businessType,
}: VenueSchemaInput) {
  const url = getCanonicalUrl(lang, path)
  const cuisineValues =
    businessType === 'Restaurant'
      ? primaryInfo
          ?.split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': businessType,
    '@id': `${url}#entity`,
    url,
    name,
    description,
    ...(image ? { image: [image] } : {}),
    ...(telephone ? { telephone } : {}),
    ...(address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressLocality: 'Tashkent',
            addressCountry: 'UZ',
          },
        }
      : {}),
    ...(menu ? { menu } : {}),
    ...(priceRange ? { priceRange } : {}),
    ...(cuisineValues && cuisineValues.length > 0 ? { servesCuisine: cuisineValues } : {}),
    brand: {
      '@id': `${getSiteUrl()}/#organization`,
    },
    parentOrganization: {
      '@id': `${getSiteUrl()}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Tashkent',
    },
    inLanguage: lang,
  }
}

export function getEventSchema({
  lang,
  path,
  name,
  description,
  image,
  startDate,
  locationName,
}: EventSchemaInput) {
  const url = getCanonicalUrl(lang, path)

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name,
    description,
    url,
    ...(image ? { image: [image] } : {}),
    ...(startDate ? { startDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: {
      '@id': `${getSiteUrl()}/#organization`,
    },
    ...(locationName
      ? {
          location: {
            '@type': 'Place',
            name: locationName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Tashkent',
              addressCountry: 'UZ',
            },
          },
        }
      : {}),
    inLanguage: lang,
  }
}
