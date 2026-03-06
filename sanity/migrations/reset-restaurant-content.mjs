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
  console.error('Missing SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN) for reset apply mode')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-06',
  useCdn: false,
  token,
})

const TARGET_TYPES = ['restaurants', 'restaurant', 'restaurantBranch']

function chunkArray(items, chunkSize) {
  const chunks = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

async function run() {
  const docs = await client.withConfig({ perspective: 'raw' }).fetch(
    `*[_type in $types]{_id, _type}`,
    { types: TARGET_TYPES }
  )

  if (!Array.isArray(docs) || docs.length === 0) {
    console.log('No restaurant/project/branch documents found. Nothing to delete.')
    return
  }

  const ids = Array.from(new Set(docs.map((doc) => doc._id).filter(Boolean)))
  const stats = TARGET_TYPES.reduce((acc, type) => {
    acc[type] = docs.filter((doc) => doc._type === type).length
    return acc
  }, {})

  const mode = isDryRun ? 'DRY RUN' : 'APPLY'
  console.log(`[${mode}] Documents found: ${ids.length}`)
  for (const type of TARGET_TYPES) {
    console.log(`- ${type}: ${stats[type] || 0}`)
  }

  if (isDryRun) {
    console.log('\nRun with --apply to delete these documents.')
    return
  }

  const chunks = chunkArray(ids, 100)
  let deleted = 0

  for (const batch of chunks) {
    let tx = client.transaction()
    for (const id of batch) {
      tx = tx.delete(id)
    }
    await tx.commit()
    deleted += batch.length
    console.log(`[deleted] ${deleted}/${ids.length}`)
  }

  console.log(`\nDone. Deleted ${deleted} documents.`)
}

run().catch((error) => {
  console.error('Reset failed:', error)
  process.exit(1)
})
