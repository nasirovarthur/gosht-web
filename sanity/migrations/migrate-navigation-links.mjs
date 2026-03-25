import { getCliClient } from 'sanity/cli'
import { nanoid } from 'nanoid'

const client = getCliClient({ apiVersion: '2025-01-01' })

function mapLegacyLink(link) {
  const normalizedLink = typeof link === 'string' ? link.trim() : ''

  if (!normalizedLink || normalizedLink === '/deflink') {
    return {
      linkType: 'none',
      internalPath: undefined,
      externalUrl: undefined,
      anchorId: undefined,
      openInNewTab: false,
    }
  }

  if (normalizedLink.startsWith('#')) {
    return {
      linkType: 'anchor',
      internalPath: undefined,
      externalUrl: undefined,
      anchorId: normalizedLink.replace(/^#/, ''),
      openInNewTab: false,
    }
  }

  if (/^(https?:|mailto:|tel:)/.test(normalizedLink)) {
    return {
      linkType: 'external',
      internalPath: undefined,
      externalUrl: normalizedLink,
      anchorId: undefined,
      openInNewTab: normalizedLink.startsWith('http'),
    }
  }

  return {
    linkType: 'internal',
    internalPath: normalizedLink,
    externalUrl: undefined,
    anchorId: undefined,
    openInNewTab: false,
  }
}

function migrateItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const legacyLink = typeof item.link === 'string' ? item.link : ''

  if (item.linkType) {
    return {
      ...item,
      _key: item._key || nanoid(),
      link: legacyLink,
    }
  }

  return {
    ...item,
    _key: item._key || nanoid(),
    link: legacyLink,
    ...mapLegacyLink(legacyLink),
  }
}

async function migrateNavigationDocument(documentId) {
  const document = await client.fetch(`*[_id == $documentId][0]`, { documentId })

  if (!document) {
    return { documentId, updated: false, reason: 'not-found' }
  }

  const items = Array.isArray(document.items) ? document.items.map(migrateItem).filter(Boolean) : []

  await client
    .patch(documentId)
    .set({
      title: document.title || 'Хедер и меню',
      items,
    })
    .commit()

  return { documentId, updated: true, items: items.length }
}

async function main() {
  const results = await Promise.all([
    migrateNavigationDocument('site-navigation'),
    migrateNavigationDocument('drafts.site-navigation'),
  ])

  console.log(
    JSON.stringify(
      {
        migrated: results.filter((result) => result.updated),
        skipped: results.filter((result) => !result.updated),
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
