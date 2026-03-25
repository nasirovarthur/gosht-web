import { getCliClient } from 'sanity/cli'
import { singletonDocumentIds } from '../singletons.ts'

const client = getCliClient({ apiVersion: '2024-01-01' })

const homeDefaults = {
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
}

function stripDraftPrefix(id) {
  return id.startsWith('drafts.') ? id.slice(7) : id
}

function dedupePreferDraft(docs) {
  const grouped = new Map()

  for (const doc of docs) {
    const baseId = stripDraftPrefix(doc._id)
    const existing = grouped.get(baseId)

    if (!existing) {
      grouped.set(baseId, doc)
      continue
    }

    const currentIsDraft = doc._id.startsWith('drafts.')
    const existingIsDraft = existing._id.startsWith('drafts.')

    if (currentIsDraft && !existingIsDraft) {
      grouped.set(baseId, doc)
      continue
    }

    if (currentIsDraft === existingIsDraft) {
      const currentUpdatedAt = Date.parse(doc._updatedAt || '') || 0
      const existingUpdatedAt = Date.parse(existing._updatedAt || '') || 0

      if (currentUpdatedAt > existingUpdatedAt) {
        grouped.set(baseId, doc)
      }
    }
  }

  return Array.from(grouped.values())
}

function toRef(ref) {
  return ref?._ref ? { _type: 'reference', _ref: ref._ref } : undefined
}

function mapHeroSlides(legacySlides) {
  return legacySlides.map((slide, index) => ({
    _key: `legacy-slide-${index + 1}`,
    internalTitle:
      slide.title?.ru || slide.title?.uz || slide.title?.en || `Legacy slide ${index + 1}`,
    isActive: true,
    sourceType: 'manual',
    subtitle: slide.subtitle,
    title: slide.title,
    description: slide.description,
    imageSource: 'custom',
    customImage: slide.image,
    buttonMode: slide.showButton !== false && slide.buttonUrl ? 'custom' : 'none',
    buttonText: slide.buttonText,
    customButtonUrl: slide.showButton !== false ? slide.buttonUrl : undefined,
  }))
}

async function fetchDocuments() {
  const query = `{
    "heroSlides": *[_type == "heroSlide"] | order(_createdAt asc),
    "runningLines": *[_type == "runningLine"] | order(_updatedAt desc),
    "groupStories": *[_type == "groupStorySection"] | order(_updatedAt desc),
    "navigations": *[_type == "navigation"] | order(_updatedAt desc),
    "eventsSettings": *[_type == "eventsSettings"] | order(_updatedAt desc),
    "homeHeroSliderDocs": *[_id in ["${singletonDocumentIds.homeHeroSliderSettings}", "drafts.${singletonDocumentIds.homeHeroSliderSettings}"]],
    "homeRunningLineDocs": *[_id in ["${singletonDocumentIds.homeRunningLineSettings}", "drafts.${singletonDocumentIds.homeRunningLineSettings}"]],
    "homeGroupStoryDocs": *[_id in ["${singletonDocumentIds.homeGroupStorySettings}", "drafts.${singletonDocumentIds.homeGroupStorySettings}"]],
    "homeEventsBlockDocs": *[_id in ["${singletonDocumentIds.homeEventsBlockSettings}", "drafts.${singletonDocumentIds.homeEventsBlockSettings}"]],
    "navigationSingletonDocs": *[_id in ["${singletonDocumentIds.navigation}", "drafts.${singletonDocumentIds.navigation}"]],
    "eventsSettingsSingletonDocs": *[_id in ["${singletonDocumentIds.eventsSettings}", "drafts.${singletonDocumentIds.eventsSettings}"]]
  }`

  return client.fetch(query)
}

async function run() {
  const data = await fetchDocuments()

  const legacySlides = dedupePreferDraft(data.heroSlides || [])
  const runningLine = dedupePreferDraft(data.runningLines || [])[0]
  const groupStory = dedupePreferDraft(data.groupStories || [])[0]
  const navigation = dedupePreferDraft(data.navigations || []).find(
    (doc) => stripDraftPrefix(doc._id) !== singletonDocumentIds.navigation
  )
  const legacyEventsSettings = dedupePreferDraft(data.eventsSettings || []).find(
    (doc) => stripDraftPrefix(doc._id) !== singletonDocumentIds.eventsSettings
  )

  const tx = client.transaction()

  tx.createOrReplace({
    _id: singletonDocumentIds.homeHeroSliderSettings,
    _type: 'homeHeroSliderSettings',
    title: 'Главная: Слайдер',
    slides: mapHeroSlides(legacySlides),
  })

  tx.createOrReplace({
    _id: singletonDocumentIds.homeRunningLineSettings,
    _type: 'homeRunningLineSettings',
    title: 'Главная: Бегущая строка',
    text: runningLine?.text,
  })

  tx.createOrReplace({
    _id: singletonDocumentIds.homeGroupStorySettings,
    _type: 'homeGroupStorySettings',
    title: 'Главная: История',
    isActive: groupStory?.isActive ?? true,
    marquee: groupStory?.marquee,
    titleTop: groupStory?.titleTop,
    titleBottom: groupStory?.titleBottom,
    description: groupStory?.description,
    ctaText: groupStory?.ctaText,
    ctaUrl: groupStory?.ctaUrl,
    previewImage: groupStory?.previewImage,
    portraitImage: groupStory?.portraitImage,
  })

  tx.createOrReplace({
    _id: singletonDocumentIds.homeEventsBlockSettings,
    _type: 'homeEventsBlockSettings',
    title: 'Главная: Блок событий',
    heading: homeDefaults.heading,
    allEventsLabel: homeDefaults.allEventsLabel,
    featuredEvent: toRef(legacyEventsSettings?.home?.featuredEvent),
    sideEventFirst: toRef(legacyEventsSettings?.home?.sideEventFirst),
    sideEventSecond: toRef(legacyEventsSettings?.home?.sideEventSecond),
  })

  if (navigation) {
    tx.createOrReplace({
      _id: singletonDocumentIds.navigation,
      _type: 'navigation',
      title: navigation.title || 'Главное меню',
      items: navigation.items || [],
    })
  }

  if (legacyEventsSettings) {
    tx.createOrReplace({
      _id: singletonDocumentIds.eventsSettings,
      _type: 'eventsSettings',
      title: legacyEventsSettings.title || 'Настройки раздела событий',
      listing: legacyEventsSettings.listing || { initialVisibleCount: 12 },
    })
  }

  const idsToDelete = new Set([
    ...((data.heroSlides || []).map((doc) => doc._id)),
    ...((data.runningLines || []).map((doc) => doc._id)),
    ...((data.groupStories || []).map((doc) => doc._id)),
    ...((data.homeHeroSliderDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.homeHeroSliderSettings)),
    ...((data.homeRunningLineDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.homeRunningLineSettings)),
    ...((data.homeGroupStoryDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.homeGroupStorySettings)),
    ...((data.homeEventsBlockDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.homeEventsBlockSettings)),
    ...((data.navigationSingletonDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.navigation)),
    ...((data.eventsSettingsSingletonDocs || [])
      .map((doc) => doc._id)
      .filter((id) => id !== singletonDocumentIds.eventsSettings)),
    ...((data.navigations || [])
      .map((doc) => doc._id)
      .filter((id) => ![singletonDocumentIds.navigation, `drafts.${singletonDocumentIds.navigation}`].includes(id))),
    ...((data.eventsSettings || [])
      .map((doc) => doc._id)
      .filter((id) => ![singletonDocumentIds.eventsSettings, `drafts.${singletonDocumentIds.eventsSettings}`].includes(id))),
  ])

  for (const id of idsToDelete) {
    tx.delete(id)
  }

  const result = await tx.commit()

  console.log(
    JSON.stringify(
      {
        migratedSlides: legacySlides.length,
        deletedDocuments: idsToDelete.size,
        transactionId: result.transactionId,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
