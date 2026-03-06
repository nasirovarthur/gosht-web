import { createClient } from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const shouldApply = args.has('--apply')
const isDryRun = !shouldApply || args.has('--dry-run')

const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) continue
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^\"|\"$/g, '')
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN

if (!projectId || !dataset) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}

if (shouldApply && !token) {
  console.error('Missing SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN) for write migration')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-05',
  useCdn: false,
  token,
})

const DEFAULT_LEAD_TITLE = {
  uz: 'OSHPAZ BOSHLIG‘I',
  ru: 'ШЕФ-ПОВАР',
  en: 'CHEF',
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function toLocalizedString(value, fallback = '') {
  if (!value) {
    return { uz: fallback, ru: fallback, en: fallback }
  }

  if (typeof value === 'string') {
    return { uz: value, ru: value, en: value }
  }

  return {
    uz: value.uz || fallback || '',
    ru: value.ru || fallback || '',
    en: value.en || fallback || '',
  }
}

function toLocalizedText(value, fallback = '') {
  return toLocalizedString(value, fallback)
}

function parseMap(rawMap, rawMapLink, rawMapEmbedUrl) {
  if (rawMap && typeof rawMap.coordinates === 'string') {
    const [lonRaw, latRaw] = rawMap.coordinates.split(',').map((value) => value.trim())
    const lon = Number(lonRaw)
    const lat = Number(latRaw)
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return {
        coordinates: `${lon},${lat}`,
        zoom: typeof rawMap.zoom === 'number' ? rawMap.zoom : 15,
      }
    }
  }

  if (
    rawMap &&
    typeof rawMap.latitude === 'number' &&
    typeof rawMap.longitude === 'number'
  ) {
    return {
      coordinates: `${rawMap.longitude},${rawMap.latitude}`,
      zoom: typeof rawMap.zoom === 'number' ? rawMap.zoom : 15,
    }
  }

  const candidates = [rawMapEmbedUrl, rawMapLink].filter(Boolean)
  for (const value of candidates) {
    let decoded = String(value)
    try {
      decoded = decodeURIComponent(String(value))
    } catch {
      decoded = String(value)
    }

    const llMatch = decoded.match(/[?&]ll=([-0-9.]+),\s*([-0-9.]+)/)
    if (!llMatch) continue

    const lon = Number(llMatch[1])
    const lat = Number(llMatch[2])
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue

    const zoomMatch = decoded.match(/[?&]z=([0-9.]+)/)
    const zoom = zoomMatch ? Number(zoomMatch[1]) : 15

    return {
      coordinates: `${lon},${lat}`,
      zoom: Number.isNaN(zoom) ? 15 : zoom,
    }
  }

  return undefined
}

function compactObject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input
  const result = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      result[key] = value
      continue
    }
    if (typeof value === 'object') {
      const compacted = compactObject(value)
      if (compacted && Object.keys(compacted).length > 0) {
        result[key] = compacted
      }
      continue
    }
    result[key] = value
  }
  return result
}

async function run() {
  const legacyQuery = `
    *[_type == "restaurants"] | order(_createdAt asc) {
      _id,
      _createdAt,
      name,
      branchName,
      slug,
      city,
      image,
      logo,
      hasBanquet,
      hasPlayground,
      url,
      address,
      phone,
      workingHours,
      averageCheck,
      description,
      descriptionExtended,
      descriptionAdditional,
      yearOpened,
      menuFile,
      gallery,
      map,
      mapLink,
      mapEmbedUrl,
      chef,
      branchInfo
    }
  `

  const docs = await client.fetch(legacyQuery)
  if (!Array.isArray(docs) || docs.length === 0) {
    console.log('No legacy restaurants found. Nothing to migrate.')
    return
  }

  const seenProjects = new Set()
  let skippedNoImage = 0
  let projectsPlanned = 0
  let branchesPlanned = 0

  for (const legacy of docs) {
    const fallbackName = legacy?.name?.uz || legacy?.name?.ru || legacy?.name?.en || legacy._id
    const slugCurrent = legacy?.slug?.current || slugify(fallbackName) || legacy._id

    if (!legacy.image) {
      skippedNoImage += 1
      console.warn(`[skip] ${legacy._id}: missing card image`) 
      continue
    }

    const projectDocId = `restaurant-${slugCurrent}`
    const branchDocId = `restaurantBranch-${slugCurrent}-${legacy._id.slice(-6)}`

    const addressRaw = legacy.address || legacy.branchInfo?.address
    const phoneRaw = legacy.phone || legacy.branchInfo?.phone || ''
    const workingHoursRaw = legacy.workingHours || legacy.branchInfo?.workingHours
    const averageCheckRaw = legacy.averageCheck || legacy.branchInfo?.averageCheck
    const parsedMap = parseMap(
      legacy.map,
      legacy.mapLink || legacy.branchInfo?.mapLink,
      legacy.mapEmbedUrl
    )

    const projectDoc = compactObject({
      _id: projectDocId,
      _type: 'restaurant',
      projectType: 'restaurant',
      name: toLocalizedString(legacy.name, fallbackName),
      logo: legacy.logo,
      description: toLocalizedText(legacy.description),
      descriptionExtended: toLocalizedText(legacy.descriptionExtended),
      descriptionAdditional: toLocalizedText(legacy.descriptionAdditional),
      lead: {
        title: toLocalizedString(legacy.chef?.title, DEFAULT_LEAD_TITLE.ru),
        name: toLocalizedString(legacy.chef?.name),
        description: toLocalizedText(legacy.chef?.description),
        image: legacy.chef?.image,
      },
      defaultMenuFile: legacy.menuFile,
      isActive: true,
    })

    const branchDoc = compactObject({
      _id: branchDocId,
      _type: 'restaurantBranch',
      project: {
        _type: 'reference',
        _ref: projectDocId,
      },
      branchName: toLocalizedString(legacy.branchName || legacy.name, fallbackName),
      slug: {
        _type: 'slug',
        current: slugCurrent,
      },
      city: legacy.city || 'tashkent',
      cardImage: legacy.image,
      gallery: Array.isArray(legacy.gallery) ? legacy.gallery : [],
      address: toLocalizedString(addressRaw),
      phone: phoneRaw,
      workingHours: toLocalizedString(workingHoursRaw),
      averageCheck: toLocalizedString(averageCheckRaw),
      yearOpened: legacy.yearOpened,
      map: parsedMap,
      hasBanquet: Boolean(legacy.hasBanquet),
      hasPlayground: Boolean(legacy.hasPlayground),
      menuFile: legacy.menuFile,
      externalUrl: legacy.url,
      isActive: true,
    })

    if (isDryRun) {
      if (!seenProjects.has(projectDocId)) projectsPlanned += 1
      branchesPlanned += 1
      seenProjects.add(projectDocId)
      continue
    }

    let tx = client.transaction()

    if (!seenProjects.has(projectDocId)) {
      tx = tx.createIfNotExists(projectDoc)
      seenProjects.add(projectDocId)
      projectsPlanned += 1
    }

    tx = tx.createIfNotExists(branchDoc)
    await tx.commit({ autoGenerateArrayKeys: true })
    branchesPlanned += 1

    console.log(`[migrated] ${legacy._id} -> ${projectDocId} + ${branchDocId}`)
  }

  const modeLabel = isDryRun ? 'DRY RUN' : 'APPLY'
  console.log(`\n[${modeLabel}] Migration summary:`)
  console.log(`Legacy docs scanned: ${docs.length}`)
  console.log(`Projects planned/created: ${projectsPlanned}`)
  console.log(`Branches planned/created: ${branchesPlanned}`)
  console.log(`Skipped (missing card image): ${skippedNoImage}`)

  if (isDryRun) {
    console.log('\nRun with --apply to write data into Sanity.')
  }
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
