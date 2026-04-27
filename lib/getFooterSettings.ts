import { cache } from 'react'
import { client, sanityReadOptions } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type FooterLinkRaw = {
  _key?: string
  label?: string | LocalizedOptional
  linkType?: 'internal' | 'external' | 'anchor' | 'none'
  internalPath?: string
  externalUrl?: string
  anchorId?: string
  openInNewTab?: boolean
}

type FooterSettingsRaw = {
  heading?: LocalizedOptional
  subtitle?: LocalizedOptional
  languageLabel?: LocalizedOptional
  feedbackLabel?: LocalizedOptional
  rightsText?: LocalizedOptional
  madeByLabel?: LocalizedOptional
  feedbackLink?: Omit<FooterLinkRaw, 'label'>
  madeByLink?: Omit<FooterLinkRaw, 'label'>
  socialLinks?: FooterLinkRaw[]
}

export type FooterLinkItem = {
  _key: string
  label: string
  href: string | null
  openInNewTab: boolean
}

export type FooterSettingsData = {
  heading: Localized
  subtitle: Localized
  languageLabel: Localized
  feedbackLabel: Localized
  feedbackHref: string | null
  feedbackOpenInNewTab: boolean
  rightsText: Localized
  madeByLabel: Localized
  madeByHref: string | null
  madeByOpenInNewTab: boolean
  socialLinks: FooterLinkItem[]
}

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback?: Localized
): Localized {
  return {
    uz: value?.uz || fallback?.uz || '',
    ru: value?.ru || value?.uz || fallback?.ru || fallback?.uz || '',
    en: value?.en || value?.uz || fallback?.en || fallback?.uz || '',
  }
}

function normalizeLinkHref(item?: Omit<FooterLinkRaw, 'label'> | FooterLinkRaw | null): string | null {
  if (!item) return null

  if (item.linkType === 'external') {
    return item.externalUrl || null
  }

  if (item.linkType === 'internal') {
    return item.internalPath || null
  }

  if (item.linkType === 'anchor') {
    return item.anchorId ? `#${item.anchorId.replace(/^#/, '')}` : null
  }

  return null
}

function createKey(prefix: string, index: number, rawKey?: string): string {
  return rawKey || `${prefix}-${index}`
}

const fallbackSettings: FooterSettingsData = {
  heading: {
    uz: "XABARDOR BO'LING",
    ru: 'БУДЬТЕ В КУРСЕ',
    en: 'STAY INFORMED',
  },
  subtitle: {
    uz: 'Gastronomik yangiliklar, aksiyalar va foydali tavsiyalar',
    ru: 'Гастрономические новости, советы, акции и многое другое',
    en: 'Gastronomic news, tips, promos, and more',
  },
  languageLabel: {
    uz: 'TIL',
    ru: 'ЯЗЫК',
    en: 'LANGUAGE',
  },
  feedbackLabel: {
    uz: 'QAYTA ALOQA',
    ru: 'ОБРАТНАЯ СВЯЗЬ',
    en: 'FEEDBACK',
  },
  feedbackHref: null,
  feedbackOpenInNewTab: false,
  rightsText: {
    uz: '© GOSHT Group. Barcha huquqlar himoyalangan',
    ru: '© GOSHT Group. Все права защищены',
    en: '© GOSHT Group. All rights reserved',
  },
  madeByLabel: {
    uz: 'Реализовано Артуром',
    ru: 'Реализовано Артуром',
    en: 'Реализовано Артуром',
  },
  madeByHref: null,
  madeByOpenInNewTab: false,
  socialLinks: [
    { _key: 'social-telegram', label: 'Telegram', href: null, openInNewTab: false },
    { _key: 'social-instagram', label: 'Instagram', href: null, openInNewTab: false },
    { _key: 'social-facebook', label: 'Facebook', href: null, openInNewTab: false },
  ],
}

export const getFooterSettings = cache(async (): Promise<FooterSettingsData> => {
  try {
    const query = `
      *[_type == "footerSettings" && _id == $documentId][0]{
        heading,
        subtitle,
        languageLabel,
        feedbackLabel,
        rightsText,
        madeByLabel,
        "feedbackLink": feedbackLink{
          linkType,
          internalPath,
          externalUrl,
          anchorId,
          openInNewTab
        },
        "madeByLink": madeByLink{
          linkType,
          internalPath,
          externalUrl,
          anchorId,
          openInNewTab
        },
        socialLinks[]{
          _key,
          label,
          linkType,
          internalPath,
          externalUrl,
          anchorId,
          openInNewTab
        }
      }
    `

    const raw = await client.fetch<FooterSettingsRaw | null>(
      query,
      {
        documentId: singletonDocumentIds.footerSettings,
      },
      sanityReadOptions
    )

    if (!raw) {
      return fallbackSettings
    }

    const socialLinks =
      raw.socialLinks
        ?.map((item, index) => {
          const label = typeof item.label === 'string' ? item.label : ''

          if (!label) return null

          return {
            _key: createKey('social', index, item._key),
            label,
            href: normalizeLinkHref(item),
            openInNewTab: item.openInNewTab,
          }
        })
        .filter((item): item is FooterLinkItem => Boolean(item)) || fallbackSettings.socialLinks

    return {
      heading: normalizeLocalized(raw.heading, fallbackSettings.heading),
      subtitle: normalizeLocalized(raw.subtitle, fallbackSettings.subtitle),
      languageLabel: normalizeLocalized(raw.languageLabel, fallbackSettings.languageLabel),
      feedbackLabel: normalizeLocalized(raw.feedbackLabel, fallbackSettings.feedbackLabel),
      feedbackHref: normalizeLinkHref(raw.feedbackLink),
      feedbackOpenInNewTab: raw.feedbackLink?.openInNewTab || false,
      rightsText: normalizeLocalized(raw.rightsText, fallbackSettings.rightsText),
      madeByLabel: normalizeLocalized(raw.madeByLabel, fallbackSettings.madeByLabel),
      madeByHref: normalizeLinkHref(raw.madeByLink),
      madeByOpenInNewTab: raw.madeByLink?.openInNewTab || false,
      socialLinks,
    }
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return fallbackSettings
  }
})
