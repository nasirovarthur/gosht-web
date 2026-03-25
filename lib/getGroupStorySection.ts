import {
  getHomeGroupStorySettingsDocument,
  normalizeHomeGroupStory,
} from '@/lib/getHomePageSettings'

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
    return normalizeHomeGroupStory(await getHomeGroupStorySettingsDocument())
  } catch (error) {
    console.error('Error fetching group story section:', error)
    return null
  }
}
