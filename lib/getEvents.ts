import { client, sanityReadOptions, urlFor } from '@/lib/sanity'
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

function localized(uz: string, ru: string, en: string): Localized {
  return { uz, ru, en }
}

function devSeedEntries(): EventEntry[] {
  if (process.env.NODE_ENV !== 'development') {
    return []
  }

  const imageUrls = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
  ]

  const branchMirabad = localized('GŌSHT MIRABAD', 'GŌSHT МИРАБАД', 'GŌSHT MIRABAD')
  const branchBoulevard = localized('GŌSHT BOULEVARD', 'GŌSHT BOULEVARD', 'GŌSHT BOULEVARD')
  const branchWest = localized('GŌSHT WEST', 'GŌSHT WEST', 'GŌSHT WEST')
  const branchBrooklyn = localized('GŌSHT BROOKLYN', 'GŌSHT BROOKLYN', 'GŌSHT BROOKLYN')

  const seeds: Array<{
    id: string
    slug: string
    category: EventCategory
    title: Localized
    date: Localized
    time: Localized
    branch: Localized
    description: Localized[]
    sortDate: string
    homePriority: number
  }> = [
    {
      id: 'dev-local-gosht-event-01',
      slug: 'dev-gosht-live-jazz-night',
      category: 'event',
      title: localized('Jonli jazz oqshomi', 'Вечер живого джаза', 'Live Jazz Night'),
      date: localized('3-may, 2026', '3 мая 2026', 'May 3, 2026'),
      time: localized('19:00 - 21:30', '19:00 - 21:30', '7:00 PM - 9:30 PM'),
      branch: branchMirabad,
      description: [
        localized(
          "Kechki dasturda live-jazz, maxsus set va sokin atmosfera bo'ladi.",
          'Вечером вас ждут live-jazz, специальный сет и камерная атмосфера.',
          'An evening with live jazz, a special set, and an intimate atmosphere.'
        ),
        localized(
          "Sahna dasturi uch qismdan iborat: warm-up, asosiy jazz session va final improvizatsiya. Har bo'lim oralig'ida oshxonaning signature taomlari navbatma-navbat taqdim etiladi.",
          'Программа состоит из трех частей: warm-up, основной джаз-сет и финальная импровизация. Между блоками подаются signature-позиции кухни в продуманной последовательности.',
          'The program runs in three acts: warm-up, main jazz session, and final improvisation. Between sets, signature dishes are served in a curated sequence.'
        ),
      ],
      sortDate: '2026-05-03',
      homePriority: 20,
    },
    {
      id: 'dev-local-gosht-event-02',
      slug: 'dev-gosht-steak-pairing-lab',
      category: 'event',
      title: localized('Steak & Pairing laboratoriyasi', 'Лаборатория Steak & Pairing', 'Steak & Pairing Lab'),
      date: localized('10-may, 2026', '10 мая 2026', 'May 10, 2026'),
      time: localized('18:30 - 21:00', '18:30 - 21:00', '6:30 PM - 9:00 PM'),
      branch: branchBoulevard,
      description: [
        localized(
          "Chef bilan birga turli steak cut va juftliklarni sinab ko'rasiz.",
          'Вместе с шефом вы попробуете разные steak cut и гастропары.',
          'Taste different steak cuts with curated pairings guided by the chef.'
        ),
        localized(
          "Ushbu formatda dry-age va classic cutlar orasidagi farq, pishirish darajasi hamda sous tanlovi amaliy misollar orqali tushuntiriladi. Tadbir yakunida savol-javob va individual tavsiyalar bo'ladi.",
          'В формате вечера шеф объясняет разницу между dry-age и classic cut, степень прожарки и выбор соусов на практике. В финале предусмотрены Q&A и персональные рекомендации.',
          'The session explains dry-age vs classic cuts, doneness levels, and sauce selection through practical tasting examples. It closes with Q&A and personal recommendations.'
        ),
      ],
      sortDate: '2026-05-10',
      homePriority: 21,
    },
    {
      id: 'dev-local-gosht-event-03',
      slug: 'dev-gosht-chef-table-fire',
      category: 'event',
      title: localized("Chef's Table: Olovdagi ta'm", "Chef's Table: вкус на огне", "Chef's Table: Flavor on Fire"),
      date: localized('17-may, 2026', '17 мая 2026', 'May 17, 2026'),
      time: localized('20:00 - 22:00', '20:00 - 22:00', '8:00 PM - 10:00 PM'),
      branch: branchWest,
      description: [
        localized(
          'Bir kechalik maxsus tasting menyu va chefdan taqdimot.',
          'Специальное tasting-меню вечера с подачей от шефа.',
          'A one-night-only tasting menu presented by the chef.'
        ),
        localized(
          "Har bir kurs oldidan ingredientlar manbasi, texnika va ta'm balansiga doir qisqa sharh beriladi. Bu format gastronomiyani yaqinroq his qilish va jarayonni ichidan ko'rish uchun mo'ljallangan.",
          'Перед каждым курсом шеф дает короткий комментарий о происхождении ингредиентов, технике и балансе вкуса. Формат позволяет увидеть кухню изнутри и глубже понять концепцию подачи.',
          'Before each course, the chef gives a short brief on ingredient origin, technique, and flavor balance. The format is designed to give guests an inside view of the kitchen concept.'
        ),
      ],
      sortDate: '2026-05-17',
      homePriority: 22,
    },
    {
      id: 'dev-local-gosht-event-04',
      slug: 'dev-gosht-sunday-brunch-club',
      category: 'event',
      title: localized('Sunday Brunch Club', 'Sunday Brunch Club', 'Sunday Brunch Club'),
      date: localized('24-may, 2026', '24 мая 2026', 'May 24, 2026'),
      time: localized('12:00 - 15:00', '12:00 - 15:00', '12:00 PM - 3:00 PM'),
      branch: branchBrooklyn,
      description: [
        localized(
          "Oilaviy brunch formati: asosiy taomlar, salatlar va dessert stansiya.",
          'Семейный brunch-формат: основные блюда, салаты и dessert station.',
          'Family brunch format with mains, salads, and a dessert station.'
        ),
        localized(
          "Brunch davomida mehmonlar uchun jonli servis zonalari, tez yangilanadigan vitrina va bolalar uchun yengil faoliyat burchagi ishlaydi. Format dam olish kunini shoshilmasdan, butun oila bilan o'tkazishga moslashtirilgan.",
          'Во время brunch работают живые станции, динамично обновляемая витрина и легкая activity-зона для детей. Формат рассчитан на спокойный семейный ритм выходного дня.',
          'During brunch, guests get live service stations, a frequently refreshed display line, and a light activity corner for children. The format is built for a relaxed family weekend rhythm.'
        ),
      ],
      sortDate: '2026-05-24',
      homePriority: 23,
    },
    {
      id: 'dev-local-gosht-kids-01',
      slug: 'dev-gosht-kids-pizza-workshop',
      category: 'kids',
      title: localized('Kids Pizza Workshop', 'Детский мастер-класс по пицце', 'Kids Pizza Workshop'),
      date: localized('31-may, 2026', '31 мая 2026', 'May 31, 2026'),
      time: localized('11:00 - 12:30', '11:00 - 12:30', '11:00 AM - 12:30 PM'),
      branch: branchMirabad,
      description: [
        localized(
          "Bolalar chef bilan birga mini-pitsa tayyorlashni o'rganadi.",
          'Дети вместе с шефом приготовят собственную мини-пиццу.',
          'Kids will prepare their own mini pizza together with the chef.'
        ),
        localized(
          "Darsda xamir shakllantirish, toppinglar bilan ishlash va pechga tayyorlash bosqichlari ketma-ket o'rgatiladi. Yakunda ishtirokchilar ishini taqdim etib, umumiy degustatsiyada qatnashadi.",
          'На занятии дети пошагово проходят формовку теста, работу с topping и подготовку к печи. В финале каждый презентует свою работу и участвует в общей дегустации.',
          'The class covers dough shaping, topping composition, and oven preparation step by step. At the end, each participant presents their result and joins a shared tasting.'
        ),
      ],
      sortDate: '2026-05-31',
      homePriority: 24,
    },
    {
      id: 'dev-local-gosht-kids-02',
      slug: 'dev-gosht-kids-burger-lab',
      category: 'kids',
      title: localized('Kids Burger Lab', 'Детская Burger Lab', 'Kids Burger Lab'),
      date: localized('7-iyun, 2026', '7 июня 2026', 'June 7, 2026'),
      time: localized('11:30 - 13:00', '11:30 - 13:00', '11:30 AM - 1:00 PM'),
      branch: branchBoulevard,
      description: [
        localized(
          "Yosh mehmonlar ingredientlar bilan ishlashni va burger yig'ishni o'rganadi.",
          'Юные гости изучат ингредиенты и соберут свой авторский бургер.',
          'Young guests will learn ingredients and build their own burger.'
        ),
        localized(
          "Mashg'ulot davomida mahsulot gigiyenasi, ta'm kombinatsiyasi va plating asoslari sodda formatda tushuntiriladi. Ota-onalar uchun alohida kuzatuv zonasi va foto nuqtasi ham bo'ladi.",
          'В рамках занятия в простом формате объясняются основы гигиены, сочетания вкусов и базовый plating. Для родителей организованы отдельная зона наблюдения и фото-точка.',
          'The workshop introduces hygiene basics, flavor combinations, and simple plating in an easy format. A separate viewing area and photo spot are prepared for parents.'
        ),
      ],
      sortDate: '2026-06-07',
      homePriority: 25,
    },
    {
      id: 'dev-local-gosht-kids-03',
      slug: 'dev-gosht-kids-mini-chef-day',
      category: 'kids',
      title: localized('Mini Chef Day', 'День Mini Chef', 'Mini Chef Day'),
      date: localized('14-iyun, 2026', '14 июня 2026', 'June 14, 2026'),
      time: localized('10:30 - 12:00', '10:30 - 12:00', '10:30 AM - 12:00 PM'),
      branch: branchWest,
      description: [
        localized(
          'Interaktiv kulinariya darsi, apronlar va mini-stansiyalar bilan.',
          'Интерактивный кулинарный класс с фартуками и мини-станциями.',
          'An interactive culinary class with aprons and mini stations.'
        ),
        localized(
          "Bolalar jamoalarda ishlash, rollarni bo'lishish va retsept bo'yicha harakat qilishni o'rganadi. Dastur oxirida kichik taqdirlash marosimi va Mini Chef sertifikatlari topshiriladi.",
          'Дети учатся работать в командах, распределять роли и следовать рецепту по шагам. В завершение проходит мини-награждение и выдача сертификатов Mini Chef.',
          'Children practice teamwork, role sharing, and following a recipe step by step. The program ends with a mini awards moment and Mini Chef certificates.'
        ),
      ],
      sortDate: '2026-06-14',
      homePriority: 26,
    },
    {
      id: 'dev-local-gosht-kids-04',
      slug: 'dev-gosht-kids-family-brunch',
      category: 'kids',
      title: localized('Family Kids Brunch', 'Семейный Kids Brunch', 'Family Kids Brunch'),
      date: localized('21-iyun, 2026', '21 июня 2026', 'June 21, 2026'),
      time: localized('12:00 - 14:30', '12:00 - 14:30', '12:00 PM - 2:30 PM'),
      branch: branchBrooklyn,
      description: [
        localized(
          'Bolalar menyusi, animator va ijodiy mini-zona bo‘lgan oilaviy format.',
          'Семейный формат с детским меню, аниматором и творческой mini-zone.',
          'A family format with kids menu, animator, and creative mini-zone.'
        ),
        localized(
          "Brunch ssenariysi turli yosh guruhlari uchun moslashtirilgan: kichiklar uchun soft-activity, kattaroqlar uchun ijodiy topshiriqlar, ota-onalar uchun esa alohida tasting bloklari mavjud.",
          'Сценарий brunch адаптирован под разные возрастные группы: для малышей предусмотрены soft-активности, для старших — творческие задания, для родителей — отдельные tasting-блоки.',
          'The brunch scenario is tailored to different age groups: soft activities for younger kids, creative tasks for older ones, and separate tasting blocks for parents.'
        ),
      ],
      sortDate: '2026-06-21',
      homePriority: 27,
    },
  ]

  return seeds.map((seed, index) => ({
    ...seed,
    image: imageUrls[index % imageUrls.length],
    showOnHome: true,
  }))
}

function withDevSeedEntries(entries: EventEntry[]): EventEntry[] {
  if (process.env.NODE_ENV !== 'development') {
    return entries
  }

  const existingSlugs = new Set(entries.map((entry) => entry.slug))
  const extras = devSeedEntries().filter((entry) => !existingSlugs.has(entry.slug))
  return [...entries, ...extras]
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
    const rawEvents = await client.fetch<EventRaw[]>(query, {}, sanityReadOptions)
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

    const withSeeds = withDevSeedEntries(mapped)
    if (withSeeds.length > 0) {
      return withSeeds
    }
  } catch (error) {
    console.error('Error fetching events from Sanity:', error)
  }

  return withDevSeedEntries(fallbackEntries())
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
    const raw = await client.fetch<EventsSettingsRaw | null>(
      query,
      {
        documentId: singletonDocumentIds.eventsSettings,
      },
      sanityReadOptions
    )
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
