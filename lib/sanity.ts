import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// Обратите внимание на слово export перед const client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)

// И здесь тоже должно быть export
export function urlFor(source: any) {
  return builder.image(source)
}