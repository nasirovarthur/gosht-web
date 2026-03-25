import { client, urlFor } from '@/lib/sanity'
import { eventsData, type EventCategory, type EventItem, type Localized } from '@/lib/eventsData'
import { singletonDocumentIds } from '@/sanity/singletons'
import {
  getHomeEventsBlockSettingsDocument,
  normalizeLocalized as normalizeHomeLocalized,
} from '@/lib/getHomePageSettings'

type LocalizedInput = Partial<Localized> | null | undefined

type EventRaw = {
  _id: string
  _createdAt?: string
  slug?: string
  category?: EventCategory
  title?: LocalizedInput
  date?: LocalizedInput
  time?: LocalizedInput
  branch?: LocalizedInput
  image?: unknown
  eventDate?: string
  showOnHome?: boolean
  homePriority?: number
  description?: Array<{ text?: LocalizedInput } | LocalizedInput>
}

type EventsSettingsRaw = {
  listing?: {
    initialVisibleCount?: number
  }
}

type EventEntry = EventItem & {
  showOnHome: boolean
  homePriority: number
  sortDate: string
}

export type EventsHomeLabels = {
  heading: Localized
  allEventsLabel: Localized
}

export type EventsListingLabels = {
  title: Localized
  all: Localized
  events: Localized
  kids: Localized
  more: Localized
}

export type EventDetailLabels = {
  related: Localized
  back: Localized
}

type EventsSettings = {
  home: EventsHomeLabels & {
    featuredEventId?: string
    sideEventFirstId?: string
    sideEventSecondId?: string
  }
  listing: EventsListingLabels & {
    initialVisibleCount: number
  }
  detail: EventDetailLabels & {
    relatedLimit: number
  }
}

export type HomeEventsSectionData = {
  featuredEvent: EventItem | null
  sideEvents: EventItem[]
  labels: EventsHomeLabels
}

export type EventsListingPageData = {
  events: EventItem[]
  labels: EventsListingLabels
  initialVisibleCount: number
}

export type EventDetailPageData = {
  event: EventItem | null
  relatedEvents: EventItem[]
  labels: EventDetailLabels
}

const defaultSettings: EventsSettings = {
  home: {
    heading: {
      uz: 'Voqealar',
      ru: 'События',
      en: 'Events',
    },
    allEventsLabel: {
      uz: 'Barcha voqealar',
      ru: 'Все события',
      en: 'All events',
    },
    featuredEventId: undefined,
    sideEventFirstId: undefined,
    sideEventSecondId: undefined,
  },
  listing: {
    title: {
      uz: 'VOQEALAR',
      ru: 'СОБЫТИЯ',
      en: 'EVENTS',
    },
    all: {
      uz: 'BARCHASI',
      ru: 'ВСЕ',
      en: 'ALL',
    },
    events: {
      uz: 'VOQEALAR',
      ru: 'СОБЫТИЯ',
      en: 'EVENTS',
    },
    kids: {
      uz: 'BOLALAR TADBIRLARI',
      ru: 'ДЕТСКИЕ МЕРОПРИЯТИЯ',
      en: 'KIDS ACTIVITIES',
    },
    more: {
      uz: "YANA KO'RISH",
      ru: 'СМОТРЕТЬ ЕЩЕ',
      en: 'LOAD MORE',
    },
    initialVisibleCount: 12,
  },
  detail: {
    related: {
      uz: 'Boshqa voqealar',
      ru: 'Другие события',
      en: 'Other events',
    },
    back: {
      uz: 'Orqaga',
      ru: 'Назад',
      en: 'Back',
    },
    relatedLimit: 8,
  },
}

function normalizeLocalized(value: LocalizedInput, fallback: Localized): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

function hasLocalizedTextField(value: unknown): value is { text?: LocalizedInput } {
  return value !== null && typeof value === 'object' && 'text' in value
}

function normalizeDescription(
  description: EventRaw['description'],
  fallback: Localized[] = []
): Localized[] {
  if (!Array.isArray(description)) {
    return fallback
  }

  const normalized = description
    .map((paragraph) => {
      const localizedValue = hasLocalizedTextField(paragraph)
        ? paragraph.text
        : (paragraph as LocalizedInput)
      return normalizeLocalized(localizedValue, { uz: '', ru: '', en: '' })
    })
    .filter((paragraph) => paragraph.uz || paragraph.ru || paragraph.en)

  return normalized.length > 0 ? normalized : fallback
}

function toPublicEvent(event: EventEntry): EventItem {
  const { showOnHome, homePriority, sortDate, ...publicEvent } = event
  void showOnHome
  void homePriority
  void sortDate
  return publicEvent
}

function getTimestamp(value: string): number {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function sortByDateDesc(a: EventEntry, b: EventEntry): number {
  return getTimestamp(b.sortDate) - getTimestamp(a.sortDate)
}

function sortByHomeOrder(a: EventEntry, b: EventEntry): number {
  if (a.homePriority !== b.homePriority) {
    return a.homePriority - b.homePriority
  }
  return sortByDateDesc(a, b)
}

function fallbackEntries(): EventEntry[] {
  return eventsData.map((event, index) => ({
    ...event,
    showOnHome: true,
    homePriority: 100 + index,
    sortDate: new Date(Date.now() - index * 60_000).toISOString(),
  }))
}

async function fetchEventEntries(): Promise<EventEntry[]> {
  const query = `
    *[_type == "event" && isActive != false && defined(slug.current)] | order(coalesce(eventDate, _createdAt) desc) {
      _id,
      _createdAt,
      "slug": slug.current,
      category,
      title,
      date,
      time,
      "branch": coalesce(branchRef->branchName, branch),
      image,
      eventDate,
      showOnHome,
      homePriority,
      description
    }
  `

  try {
    const rawEvents = await client.fetch<EventRaw[]>(query)
    const mapped = rawEvents
      .map<EventEntry | null>((item) => {
        if (!item.slug) return null

        const imageUrl = item.image ? urlFor(item.image).url() : ''
        if (!imageUrl) return null

        return {
          id: item._id,
          slug: item.slug,
          category: item.category === 'kids' ? 'kids' : 'event',
          title: normalizeLocalized(item.title, { uz: '', ru: '', en: '' }),
          date: normalizeLocalized(item.date, { uz: '', ru: '', en: '' }),
          time: normalizeLocalized(item.time, { uz: '', ru: '', en: '' }),
          branch: normalizeLocalized(item.branch, { uz: '', ru: '', en: '' }),
          image: imageUrl,
          description: normalizeDescription(item.description),
          showOnHome: item.showOnHome !== false,
          homePriority: typeof item.homePriority === 'number' ? item.homePriority : 100,
          sortDate: item.eventDate || item._createdAt || new Date(0).toISOString(),
        }
      })
      .filter((item): item is EventEntry => Boolean(item))

    if (mapped.length > 0) {
      return mapped
    }
  } catch (error) {
    console.error('Error fetching events from Sanity:', error)
  }

  return fallbackEntries()
}

async function fetchEventsSettings(): Promise<EventsSettings> {
  const query = `
    *[_type == "eventsSettings" && _id == $documentId][0]{
      listing{
        initialVisibleCount
      }
    }
  `

  try {
    const raw = await client.fetch<EventsSettingsRaw | null>(query, {
      documentId: singletonDocumentIds.eventsSettings,
    })
    if (!raw) return defaultSettings

    const initialVisibleCountValue = Number(raw.listing?.initialVisibleCount)
    const initialVisibleCount =
      Number.isFinite(initialVisibleCountValue) && initialVisibleCountValue > 0
        ? Math.min(60, Math.max(1, Math.floor(initialVisibleCountValue)))
        : defaultSettings.listing.initialVisibleCount

    return {
      home: {
        heading: defaultSettings.home.heading,
        allEventsLabel: defaultSettings.home.allEventsLabel,
        featuredEventId: undefined,
        sideEventFirstId: undefined,
        sideEventSecondId: undefined,
      },
      listing: {
        title: defaultSettings.listing.title,
        all: defaultSettings.listing.all,
        events: defaultSettings.listing.events,
        kids: defaultSettings.listing.kids,
        more: defaultSettings.listing.more,
        initialVisibleCount,
      },
      detail: {
        related: defaultSettings.detail.related,
        back: defaultSettings.detail.back,
        relatedLimit: defaultSettings.detail.relatedLimit,
      },
    }
  } catch (error) {
    console.error('Error fetching events settings from Sanity:', error)
    return defaultSettings
  }
}

async function fetchHomeEventsBlockSettings(): Promise<EventsSettings['home']> {
  const homeEventsBlockSettings = await getHomeEventsBlockSettingsDocument()

  if (homeEventsBlockSettings) {
    return {
      heading: normalizeHomeLocalized(
        homeEventsBlockSettings.heading,
        defaultSettings.home.heading
      ),
      allEventsLabel: normalizeHomeLocalized(
        homeEventsBlockSettings.allEventsLabel,
        defaultSettings.home.allEventsLabel
      ),
      featuredEventId: homeEventsBlockSettings.featuredEventId,
      sideEventFirstId: homeEventsBlockSettings.sideEventFirstId,
      sideEventSecondId: homeEventsBlockSettings.sideEventSecondId,
    }
  }

  return {
    heading: defaultSettings.home.heading,
    allEventsLabel: defaultSettings.home.allEventsLabel,
    featuredEventId: undefined,
    sideEventFirstId: undefined,
    sideEventSecondId: undefined,
  }
}

export async function getAllEvents(): Promise<EventItem[]> {
  const events = await fetchEventEntries()
  return [...events].sort(sortByDateDesc).map(toPublicEvent)
}

export async function getHomeEventsSectionData(): Promise<HomeEventsSectionData> {
  const [events, homeSettings] = await Promise.all([
    fetchEventEntries(),
    fetchHomeEventsBlockSettings(),
  ])

  const homeCandidates = events.filter((event) => event.showOnHome)
  const pool = (homeCandidates.length > 0 ? homeCandidates : events).sort(sortByHomeOrder)
  const mapById = new Map(events.map((event) => [event.id, event]))

  const featuredEvent =
    (homeSettings.featuredEventId ? mapById.get(homeSettings.featuredEventId) : null) || pool[0] || null

  const selectedIds = new Set<string>()
  if (featuredEvent) selectedIds.add(featuredEvent.id)

  const sideEvents: EventEntry[] = []
  const selectedSideIds = [homeSettings.sideEventFirstId, homeSettings.sideEventSecondId].filter(Boolean) as string[]
  selectedSideIds.forEach((id) => {
    const event = mapById.get(id)
    if (!event || selectedIds.has(event.id) || sideEvents.length >= 2) return
    selectedIds.add(event.id)
    sideEvents.push(event)
  })

  for (const event of pool) {
    if (sideEvents.length >= 2) break
    if (selectedIds.has(event.id)) continue
    selectedIds.add(event.id)
    sideEvents.push(event)
  }

  return {
    featuredEvent: featuredEvent ? toPublicEvent(featuredEvent) : null,
    sideEvents: sideEvents.map(toPublicEvent),
    labels: homeSettings,
  }
}

export async function getEventsListingPageData(): Promise<EventsListingPageData> {
  const [events, settings] = await Promise.all([getAllEvents(), fetchEventsSettings()])
  return {
    events,
    labels: settings.listing,
    initialVisibleCount: settings.listing.initialVisibleCount,
  }
}

export async function getEventDetailPageData(slug: string): Promise<EventDetailPageData> {
  const [events, settings] = await Promise.all([fetchEventEntries(), fetchEventsSettings()])
  const sorted = [...events].sort(sortByDateDesc)
  const event = sorted.find((item) => item.slug === slug) || null

  const relatedEvents = sorted
    .filter((item) => item.slug !== slug)
    .slice(0, settings.detail.relatedLimit)
    .map(toPublicEvent)

  return {
    event: event ? toPublicEvent(event) : null,
    relatedEvents,
    labels: settings.detail,
  }
}
