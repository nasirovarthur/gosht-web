import {NextRequest, NextResponse} from 'next/server'
import {
  checkRateLimit,
  getClientIp,
  isTrustedOriginRequest,
} from '@/lib/serverSecurity'

export const runtime = 'nodejs'

type TranslateRequestBody = {
  sourceText?: string
  sourceLanguage?: string
  targetLanguages?: string[]
}

type TranslateResult = {
  translations?: Record<string, string>
  error?: string
}

const MAX_SOURCE_TEXT_LENGTH = 5_000
const SUPPORTED_TARGET_LANGUAGES = new Set(['uz', 'en', 'ru'])

function toDeepLSourceLanguage(language: string) {
  if (language === 'ru') return 'RU'
  if (language === 'en') return 'EN'
  if (language === 'uz') return 'UZ'
  return null
}

function toDeepLTargetLanguage(language: string) {
  if (language === 'ru') return 'RU'
  if (language === 'en') return 'EN'
  if (language === 'uz') return 'UZ'
  return null
}

async function translateWithDeepL(
  sourceText: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<TranslateResult> {
  const apiKey = process.env.DEEPL_API_KEY
  const apiUrl = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate'

  if (!apiKey) {
    return {error: 'DEEPL_API_KEY is not configured on the server'}
  }

  const sourceLang = toDeepLSourceLanguage(sourceLanguage)
  const translations: Record<string, string> = {}
  const supportedTargets = targetLanguages
    .map((targetLanguage) => ({
      language: targetLanguage,
      deepLCode: toDeepLTargetLanguage(targetLanguage),
    }))
    .filter(
      (target): target is {language: string; deepLCode: string} =>
        Boolean(target.deepLCode)
    )

  if (supportedTargets.length === 0) {
    return {error: 'No supported target languages for DeepL'}
  }

  for (const target of supportedTargets) {
    const body = new URLSearchParams()
    body.set('text', sourceText)
    body.set('target_lang', target.deepLCode)
    if (sourceLang) {
      body.set('source_lang', sourceLang)
    }

    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `DeepL-Auth-Key ${apiKey}`,
        },
        body: body.toString(),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network error'
      return {error: `DeepL network error: ${message}`}
    }

    if (!response.ok) {
      const errorText = await response.text()
      return {error: `DeepL request failed: ${errorText}`}
    }

    const payload = (await response.json()) as {
      translations?: Array<{text?: string}>
    }

    const translatedText = payload.translations?.[0]?.text
    if (!translatedText) {
      return {error: `DeepL returned empty translation for target ${target.language}`}
    }

    translations[target.language] = translatedText
  }

  return {translations}
}

export async function POST(request: NextRequest) {
  if (
    !isTrustedOriginRequest(request, {
      requireBrowserHeaders: true,
      requireStudioReferer: true,
    })
  ) {
    return NextResponse.json({error: 'Forbidden origin'}, {status: 403})
  }

  const ip = getClientIp(request)
  const rateLimit = checkRateLimit({
    key: `studio-translate:${ip}`,
    limit: 20,
    windowMs: 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      {error: 'Too many requests. Please try again later.'},
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    )
  }

  let body: TranslateRequestBody

  try {
    body = (await request.json()) as TranslateRequestBody
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400})
  }

  const sourceText = body.sourceText?.trim()
  const sourceLanguage = body.sourceLanguage || 'ru'
  const targetLanguages = Array.isArray(body.targetLanguages)
    ? body.targetLanguages.filter(Boolean)
    : []

  if (!sourceText) {
    return NextResponse.json({error: 'sourceText is required'}, {status: 400})
  }

  if (sourceText.length > MAX_SOURCE_TEXT_LENGTH) {
    return NextResponse.json(
      {error: `sourceText must be shorter than ${MAX_SOURCE_TEXT_LENGTH} characters`},
      {status: 400}
    )
  }

  if (targetLanguages.length === 0) {
    return NextResponse.json(
      {error: 'At least one target language is required'},
      {status: 400}
    )
  }

  if (
    targetLanguages.some(
      (language) => !SUPPORTED_TARGET_LANGUAGES.has(language)
    )
  ) {
    return NextResponse.json(
      {error: 'Unsupported target language detected'},
      {status: 400}
    )
  }

  try {
    const deepLResult = await translateWithDeepL(
      sourceText,
      sourceLanguage,
      targetLanguages
    )

    if (!deepLResult.translations) {
      return NextResponse.json(
        {
          error: deepLResult.error || 'DeepL translation failed',
        },
        {status: 500}
      )
    }

    const unresolvedLanguages = targetLanguages.filter(
      (targetLanguage) => !deepLResult.translations?.[targetLanguage]
    )

    if (unresolvedLanguages.length > 0) {
      return NextResponse.json(
        {
          error: `DeepL could not translate target languages: ${unresolvedLanguages.join(', ')}`,
        },
        {status: 500}
      )
    }

    return NextResponse.json({translations: deepLResult.translations})
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    return NextResponse.json({error: `Translation failed: ${message}`}, {status: 500})
  }
}
