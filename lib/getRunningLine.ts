// lib/getRunningLine.ts
import { client } from '@/lib/sanity'

export interface RunningLineData {
  text: {
    uz: string
    ru: string
    en: string
  }
}

export async function getRunningLine(): Promise<RunningLineData | null> {
  try {
    const query = `*[_type == "runningLine"][0]{
      text
    }`
    const data = await client.fetch(query)
    return data || null
  } catch (error) {
    console.error('Error fetching running line:', error)
    return null
  }
}
