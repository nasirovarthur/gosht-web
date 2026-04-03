import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { SUPPORTED_LANGS, getCanonicalUrl } from '@/lib/seo/site'

type SlugRecord = {
  slug?: string
  updatedAt?: string
}

const STATIC_PATHS = ['', 'about', 'projects', 'restaurants', 'events', 'partners', 'jobs']

async function getRestaurantRecords(): Promise<SlugRecord[]> {
  const [branches, legacy] = await Promise.all([
    client.fetch<SlugRecord[]>(`
      *[
        _type == "restaurantBranch" &&
        isActive != false &&
        defined(project->_id) &&
        project->isActive != false &&
        defined(slug.current)
      ]{
        "slug": slug.current,
        "updatedAt": _updatedAt
      }
    `),
    client.fetch<SlugRecord[]>(`
      *[_type == "restaurants" && defined(slug.current)]{
        "slug": slug.current,
        "updatedAt": _updatedAt
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
        lastModified: new Date(),
      })
    }

    for (const record of restaurantRecords) {
      if (!record.slug) continue
      entries.push({
        url: getCanonicalUrl(lang, `restaurants/${record.slug.replace(/^\/+|\/+$/g, '')}`),
        lastModified: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      })
    }

    for (const record of eventRecords) {
      if (!record.slug) continue
      entries.push({
        url: getCanonicalUrl(lang, `events/${record.slug.replace(/^\/+|\/+$/g, '')}`),
        lastModified: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      })
    }
  }

  return entries
}
