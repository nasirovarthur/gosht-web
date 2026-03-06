import { client } from '@/lib/sanity'

type LocalizedString = {
  uz?: string
  ru?: string
  en?: string
}

export interface GroupStorySectionData {
  marquee?: LocalizedString
  titleTop?: LocalizedString
  titleBottom?: LocalizedString
  description?: LocalizedString
  ctaText?: LocalizedString
  ctaUrl?: string
  previewImage?: string
  portraitImage?: string
}

export async function getGroupStorySection(): Promise<GroupStorySectionData | null> {
  try {
    const query = `
      *[_type == "groupStorySection" && isActive != false][0]{
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
    const data = await client.fetch<GroupStorySectionData | null>(query)
    return data || null
  } catch (error) {
    console.error('Error fetching group story section:', error)
    return null
  }
}
