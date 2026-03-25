import {
  getHomeRunningLineSettingsDocument,
  normalizeHomeRunningLine,
} from '@/lib/getHomePageSettings'

export interface RunningLineData {
  text: {
    uz: string
    ru: string
    en: string
  }
}

export async function getRunningLine(): Promise<RunningLineData | null> {
  try {
    return normalizeHomeRunningLine(await getHomeRunningLineSettingsDocument())
  } catch (error) {
    console.error('Error fetching running line:', error)
    return null
  }
}
