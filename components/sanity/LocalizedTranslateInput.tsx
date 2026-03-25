'use client'

import {useMemo, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {
  isObjectInputProps,
  PatchEvent,
  set,
  setIfMissing,
  type InputProps,
  type ObjectInputProps,
} from 'sanity'

type LocalizedValue = {
  ru?: string
  uz?: string
  en?: string
}

type TranslateResponse = {
  translations?: {
    uz?: string
    en?: string
  }
  error?: string
}

function isLocalizedObjectInput(
  props: InputProps | Omit<InputProps, 'renderDefault'>
): props is ObjectInputProps<LocalizedValue> {
  if (!isObjectInputProps(props)) return false

  const fieldNames = props.schemaType.fields.map((field) => field.name)
  return ['ru', 'uz', 'en'].every((fieldName) => fieldNames.includes(fieldName))
}

export function LocalizedTranslateInput(props: InputProps) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isErrorMessage, setIsErrorMessage] = useState(false)

  const isLocalized = isLocalizedObjectInput(props)
  const sourceText = useMemo(() => {
    if (!isLocalized) return ''
    return typeof props.value?.ru === 'string' ? props.value.ru.trim() : ''
  }, [isLocalized, props.value])

  const handleTranslate = async () => {
    if (!isLocalized || !sourceText || isTranslating) return

    setIsTranslating(true)
    setMessage(null)

    try {
      const endpoint =
        typeof window === 'undefined'
          ? '/api/studio/translate'
          : new URL('/api/studio/translate', window.location.origin).toString()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          sourceText,
          sourceLanguage: 'ru',
          targetLanguages: ['uz', 'en'],
        }),
      })

      const result = (await response.json()) as TranslateResponse

      if (!response.ok || !result.translations) {
        throw new Error(result.error || 'Не удалось выполнить перевод')
      }

      props.onChange(
        PatchEvent.from([
          setIfMissing({}),
          set(result.translations.uz || '', ['uz']),
          set(result.translations.en || '', ['en']),
        ])
      )

      setIsErrorMessage(false)
      setMessage('Перевод обновлён')
    } catch (error) {
      setIsErrorMessage(true)
      setMessage(
        error instanceof Error
          ? `Ошибка сети: ${error.message}`
          : 'Ошибка сети при запросе перевода'
      )
    } finally {
      setIsTranslating(false)
    }
  }

  if (!isLocalized) {
    return props.renderDefault(props)
  }

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Flex align="center" justify="space-between" gap={3}>
          <Box flex={1}>
            <Text size={1} muted>
              Заполните поле `ru`, затем нажмите кнопку, чтобы обновить `uz` и `en`.
            </Text>
          </Box>
          <Button
            text={isTranslating ? 'Переводим...' : 'Перевести из RU'}
            mode="ghost"
            tone="primary"
            disabled={!sourceText || isTranslating}
            onClick={handleTranslate}
          />
        </Flex>
        {message ? (
          <Box marginTop={3}>
            <Text
              size={1}
              style={{
                color: isErrorMessage
                  ? 'var(--card-critical-fg-color)'
                  : 'var(--card-positive-fg-color)',
              }}
            >
              {message}
            </Text>
          </Box>
        ) : null}
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
