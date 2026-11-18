import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { SUPPORTED_LANGS, getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/site'
import { pickLocalized } from '@/types/i18n'
import type { LangCode, LocalizedOptional } from '@/types/i18n'
import { hasGoshtDeliveryMenu } from '@/lib/restaurantMenu'

type SlugRecord = {
  slug?: string
  updatedAt?: string
}

type RestaurantRecord = SlugRecord & {
  _type: 'restaurantBranch' | 'restaurants'
  name?: LocalizedOptional
  branchName?: LocalizedOptional
  city?: string
  projectType?: string
  menuFiles?: { language?: string; url?: string }[]
  menu?: string
  defaultMenu?: string
}

const STATIC_PATHS = ['', 'about', 'projects', 'restaurants', 'events', 'partners', 'jobs']

async function getRestaurantRecords(): Promise<RestaurantRecord[]> {
  const [branches, legacy] = await Promise.all([
    client.fetch<RestaurantRecord[]>(`
      *[
        _type == "restaurantBranch" &&
        isActive != false &&
        defined(project->_id) &&
        project->isActive != false &&
        coalesce(project->projectType, "restaurant") in ["restaurant", "barbershop"] &&
        defined(slug.current)
      ]{
        _type,
        "slug": slug.current,
        "updatedAt": _updatedAt,
        "name": project->name,
        branchName,
        city,
        "projectType": project->projectType,
        menuFiles[]{language, "url": asset->url},
        "menu": menuFile.asset->url,
        "defaultMenu": project->defaultMenuFile.asset->url
      }
    `),
    client.fetch<RestaurantRecord[]>(`
      *[_type == "restaurants" && defined(slug.current)]{
        _type,
        "slug": slug.current,
        "updatedAt": _updatedAt,
        name,
        branchName,
        menuFiles[]{language, "url": asset->url},
        "menu": menuFile.asset->url
      }
    `),
  ])

  return [...branches, ...legacy]
}

async function getEventRecords(): Promise<SlugRecord[]> {
  return client.fetch<SlugRecord[]>(`
    *[_type == "event" && isActive != false && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    }
  `)
}

function getMenuLanguages(record: RestaurantRecord, slug: string): LangCode[] {
  return SUPPORTED_LANGS.filter(lang =>
    hasGoshtDeliveryMenu({
      slug,
      source: record._type === 'restaurantBranch' ? 'branch' : 'legacy',
      city: record.city,
      projectType: record.projectType,
      names: [pickLocalized(record.name, lang), pickLocalized(record.branchName, lang)],
    }) ||
    Boolean(record.menu || record.defaultMenu) ||
    record.menuFiles?.some(file => file.url && (file.language == null || file.language === lang))
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [restaurantRecords, eventRecords] = await Promise.all([
    getRestaurantRecords(),
    getEventRecords(),
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const lang of SUPPORTED_LANGS) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: getCanonicalUrl(lang, path),
        alternates: { languages: getLanguageAlternates(path) },
      })
    }
  }

  const restaurantSlugs = new Set<string>()
  for (const record of restaurantRecords) {
    const slug = record.slug?.replace(/^\/+|\/+$/g, '')
    if (!slug || restaurantSlugs.has(slug)) continue
    restaurantSlugs.add(slug)
    const path = `restaurants/${slug}`
    const lastModified = record.updatedAt ? new Date(record.updatedAt) : undefined
    const menuLanguages = getMenuLanguages(record, slug)
    const menuAlternates = Object.fromEntries(menuLanguages.map(lang => [lang, getCanonicalUrl(lang, `${path}/menu`)]))

    for (const lang of SUPPORTED_LANGS) {
      entries.push({
        url: getCanonicalUrl(lang, path),
        lastModified,
        alternates: { languages: getLanguageAlternates(path) },
      })

      if (menuLanguages.includes(lang)) {
        entries.push({
          url: getCanonicalUrl(lang, `${path}/menu`),
          lastModified,
          alternates: { languages: menuAlternates },
        })
      }
    }
  }

  const eventSlugs = new Set<string>()
  for (const record of eventRecords) {
    const slug = record.slug?.replace(/^\/+|\/+$/g, '')
    if (!slug || eventSlugs.has(slug)) continue
    eventSlugs.add(slug)
    const path = `events/${slug}`
    for (const lang of SUPPORTED_LANGS) {
      entries.push({
        url: getCanonicalUrl(lang, path),
        lastModified: record.updatedAt ? new Date(record.updatedAt) : undefined,
        alternates: { languages: getLanguageAlternates(path) },
      })
    }
  }

  return entries
}
