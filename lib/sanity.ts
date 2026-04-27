import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Обратите внимание на слово export перед const client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === "production",
})

const builder = imageUrlBuilder(client)

export const SANITY_PUBLIC_REVALIDATE = 300
export const sanityReadOptions = {
  cache: 'force-cache' as const,
  next: { revalidate: SANITY_PUBLIC_REVALIDATE },
}

// И здесь тоже должно быть export
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
