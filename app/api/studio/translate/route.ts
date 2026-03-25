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

const languagePrompts: Record<string, string> = {
  uz: 'Uzbek in Latin script, natural and professional tone.',
  en: 'English, natural and professional tone.',
}

function buildPrompt(sourceText: string, sourceLanguage: string, targetLanguages: string[]) {
  const targetInstructions = targetLanguages
    .map((language) => `${language}: ${languagePrompts[language] || language}`)
    .join('\n')

  return [
    'Translate the provided text carefully.',
    'Preserve meaning, formatting, line breaks, and list structure.',
    'Do not translate brand names unless a standard translation exists.',
    'Return valid JSON only with this exact shape:',
    '{"translations":{"uz":"...","en":"..."}}',
    'Do not wrap JSON in markdown code fences.',
    'Do not add explanations.',
    `Source language: ${sourceLanguage}`,
    `Targets:\n${targetInstructions}`,
    `Text:\n${sourceText}`,
  ].join('\n\n')
}

function parseJsonContent(content: string) {
  try {
    return JSON.parse(content) as {translations?: Record<string, string>}
  } catch {
    return null
  }
}

function extractJsonObject(content: string) {
  const direct = parseJsonContent(content)
  if (direct) return direct

  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) {
    const fenced = parseJsonContent(fencedMatch[1].trim())
    if (fenced) return fenced
  }

  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = parseJsonContent(content.slice(firstBrace, lastBrace + 1))
    if (sliced) return sliced
  }

  return null
}

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

async function translateWithGemini(
  sourceText: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<TranslateResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_TRANSLATION_MODEL || 'gemini-2.0-flash'

  if (!apiKey) {
    return {error: 'GEMINI_API_KEY is not configured on the server'}
  }

  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{text: buildPrompt(sourceText, sourceLanguage, targetLanguages)}],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    return {error: `Gemini network error: ${message}`}
  }

  if (!response.ok) {
    const errorText = await response.text()
    return {error: `Gemini request failed: ${errorText}`}
  }

  const completion = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
        }>
      }
    }>
  }

  const content = completion.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    return {error: 'Gemini returned an empty response'}
  }

  const parsed = extractJsonObject(content)

  if (!parsed?.translations) {
    return {error: `Gemini returned invalid JSON: ${content}`}
  }

  return {translations: parsed.translations}
}

async function translateWithOpenAI(
  sourceText: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<TranslateResult> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1-mini'

  if (!apiKey) {
    return {error: 'OPENAI_API_KEY is not configured on the server'}
  }

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: {type: 'json_object'},
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator for CMS content. Return JSON only in the format {"translations":{"uz":"...","en":"..."}}.',
          },
          {
            role: 'user',
            content: buildPrompt(sourceText, sourceLanguage, targetLanguages),
          },
        ],
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    return {error: `OpenAI network error: ${message}`}
  }

  if (!response.ok) {
    const errorText = await response.text()
    return {error: `OpenAI request failed: ${errorText}`}
  }

  const completion = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  const content = completion.choices?.[0]?.message?.content

  if (!content) {
    return {error: 'OpenAI returned an empty response'}
  }

  const parsed = extractJsonObject(content)

  if (!parsed?.translations) {
    return {error: `OpenAI returned invalid JSON: ${content}`}
  }

  return {translations: parsed.translations}
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
    const mergedTranslations: Record<string, string> = {}
    const providerErrors: string[] = []

    if (process.env.DEEPL_API_KEY) {
      const deepLResult = await translateWithDeepL(
        sourceText,
        sourceLanguage,
        targetLanguages
      )

      if (deepLResult.translations) {
        Object.assign(mergedTranslations, deepLResult.translations)
      } else if (deepLResult.error) {
        providerErrors.push(deepLResult.error)
      }
    }

    const unresolvedAfterDeepL = targetLanguages.filter(
      (targetLanguage) => !mergedTranslations[targetLanguage]
    )

    if (unresolvedAfterDeepL.length > 0) {
      const geminiResult = await translateWithGemini(
        sourceText,
        sourceLanguage,
        unresolvedAfterDeepL
      )

      if (geminiResult.translations) {
        Object.assign(mergedTranslations, geminiResult.translations)
      } else if (geminiResult.error) {
        providerErrors.push(geminiResult.error)
      }
    }

    const unresolvedAfterGemini = targetLanguages.filter(
      (targetLanguage) => !mergedTranslations[targetLanguage]
    )

    if (unresolvedAfterGemini.length > 0 && process.env.OPENAI_API_KEY) {
      const openAiResult = await translateWithOpenAI(
        sourceText,
        sourceLanguage,
        unresolvedAfterGemini
      )

      if (openAiResult.translations) {
        Object.assign(mergedTranslations, openAiResult.translations)
      } else if (openAiResult.error) {
        providerErrors.push(openAiResult.error)
      }
    }

    const unresolvedLanguages = targetLanguages.filter(
      (targetLanguage) => !mergedTranslations[targetLanguage]
    )

    if (unresolvedLanguages.length > 0) {
      return NextResponse.json(
        {
          error:
            providerErrors[0] ||
            `Could not translate target languages: ${unresolvedLanguages.join(', ')}`,
        },
        {status: 500}
      )
    }

    return NextResponse.json({translations: mergedTranslations})
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    return NextResponse.json({error: `Translation failed: ${message}`}, {status: 500})
  }
}
