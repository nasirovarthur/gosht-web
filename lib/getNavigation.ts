import { client } from './sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional, NavItem } from '@/types/i18n'

type NavigationItemRaw = {
  _key?: string
  label?: LocalizedOptional
  linkType?: 'internal' | 'external' | 'anchor' | 'none'
  internalPath?: string
  externalUrl?: string
  anchorId?: string
  openInNewTab?: boolean
  link?: string
}

function normalizeLocalized(value?: LocalizedOptional | null): Localized {
  return {
    uz: value?.uz || '',
    ru: value?.ru || value?.uz || '',
    en: value?.en || value?.uz || '',
  }
}

function normalizeNavigationHref(item: NavigationItemRaw): string | null {
  if (item.linkType === 'external') {
    return item.externalUrl || null
  }

  if (item.linkType === 'internal') {
    return item.internalPath || null
  }

  if (item.linkType === 'anchor') {
    return item.anchorId ? `#${item.anchorId.replace(/^#/, '')}` : null
  }

  if (item.linkType === 'none') {
    return null
  }

  const legacyLink = item.link?.trim()

  if (!legacyLink || legacyLink === '/deflink') {
    return null
  }

  if (legacyLink.startsWith('#')) {
    return legacyLink
  }

  return legacyLink
}

function normalizeNavItem(item: NavigationItemRaw, index: number): NavItem {
  return {
    _key: item._key || `nav-item-${index}`,
    label: normalizeLocalized(item.label),
    href: normalizeNavigationHref(item),
    openInNewTab: item.openInNewTab,
  }
}

/**
 * Fetches navigation menu items from Sanity
 */
export async function getNavigation(): Promise<NavItem[]> {
  try {
    const query = `*[_type == "navigation" && _id == $documentId][0]{
      items[]{
        _key,
        label,
        linkType,
        internalPath,
        externalUrl,
        anchorId,
        openInNewTab,
        link
      }
    }`

    const data = await client.fetch<{ items?: NavigationItemRaw[] }>(query, {
      documentId: singletonDocumentIds.navigation,
    })

    return (data?.items || []).map(normalizeNavItem)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return []
  }
}
