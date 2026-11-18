import type { LangCode } from '@/types/i18n'

export const SUPPORTED_LANGS: LangCode[] = ['uz', 'ru', 'en']
export const BRAND_NAME = 'Gōsht Group'
export const BRAND_VARIANTS = ['Gōsht Group', 'Gosht Group', 'Гошт Групп', 'Гошт групп']

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, '')
}

export function resolveLang(lang: string): LangCode {
  return SUPPORTED_LANGS.includes(lang as LangCode) ? (lang as LangCode) : 'uz'
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    'https://gosht.uz',
  ]

  const siteUrl = candidates.find(Boolean)
  return normalizeOrigin(siteUrl!)
}

export function getLocalizedPath(lang: LangCode, pathname = ''): string {
  const normalizedPath = pathname.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
  return normalizedPath ? `/${lang}/${normalizedPath}` : `/${lang}`
}

export function getAbsoluteUrl(pathname = ''): string {
  if (/^https?:\/\//i.test(pathname)) {
    return pathname
  }

  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(path, `${getSiteUrl()}/`).toString()
}

export function getCanonicalUrl(lang: LangCode, pathname = ''): string {
  return getAbsoluteUrl(getLocalizedPath(lang, pathname))
}

export function getLanguageAlternates(pathname = '', languages: LangCode[] = SUPPORTED_LANGS): Partial<Record<LangCode, string>> {
  return Object.fromEntries(languages.map(lang => [lang, getCanonicalUrl(lang, pathname)]))
}

export function toTitleCase(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}
