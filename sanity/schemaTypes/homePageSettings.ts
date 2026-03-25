import { defineArrayMember, defineField, defineType } from 'sanity'
import type { ObjectRule } from 'sanity'

type LocalizedValue = {
  uz?: string
  ru?: string
  en?: string
}

type HeroSlideValidationValue = {
  sourceType?: 'manual' | 'event'
  eventRef?: { _ref?: string }
  title?: LocalizedValue
  imageSource?: 'custom' | 'event'
  customImage?: unknown
  buttonMode?: 'none' | 'event' | 'custom'
  customButtonUrl?: string
}

const localizedStringField = (
  name: string,
  title: string,
  options?: {
    description?: string
  }
) =>
  defineField({
    name,
    title,
    description: options?.description,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
  })

const localizedTextField = (
  name: string,
  title: string,
  rows = 4,
  options?: {
    description?: string
  }
) =>
  defineField({
    name,
    title,
    description: options?.description,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
  })

function hasLocalizedText(value: LocalizedValue | undefined): boolean {
  return Boolean(value?.uz || value?.ru || value?.en)
}

export const homePageSettings = defineType({
  name: 'homePageSettings',
  title: 'Главная: Настройки',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная страница',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSlides',
      title: 'Hero / Баннеры',
      description:
        'Баннер может быть полностью независимым или связанным с событием. Если поля текста оставить пустыми, сайт попытается взять данные из события.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'heroSlideItem',
          title: 'Баннер',
          fields: [
            defineField({
              name: 'internalTitle',
              title: 'Название баннера (техническое)',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'isActive',
              title: 'Показывать баннер',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'sourceType',
              title: 'Источник баннера',
              description:
                'Manual: полностью самостоятельный баннер. Event: баннер может брать картинку и ссылку из события.',
              type: 'string',
              initialValue: 'manual',
              options: {
                list: [
                  { title: 'Независимый баннер', value: 'manual' },
                  { title: 'Баннер на основе события', value: 'event' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'eventRef',
              title: 'Событие',
              type: 'reference',
              to: [{ type: 'event' }],
              options: {
                filter: 'isActive != false && defined(slug.current)',
              },
              hidden: ({ parent }) => parent?.sourceType !== 'event',
            }),
            localizedStringField('subtitle', 'Надзаголовок', {
              description:
                'Можно оставить пустым. Для баннера события сайт подставит дату события как fallback.',
            }),
            localizedStringField('title', 'Заголовок', {
              description:
                'Для баннера события можно оставить пустым, тогда заголовок подтянется из события.',
            }),
            localizedTextField('description', 'Описание', 3, {
              description:
                'Для баннера события можно оставить пустым, тогда описание возьмется из первого абзаца события.',
            }),
            defineField({
              name: 'imageSource',
              title: 'Источник изображения',
              type: 'string',
              initialValue: 'custom',
              options: {
                list: [
                  { title: 'Свое изображение', value: 'custom' },
                  { title: 'Из выбранного события', value: 'event' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'customImage',
              title: 'Изображение баннера',
              type: 'image',
              options: { hotspot: true },
              hidden: ({ parent }) => parent?.imageSource !== 'custom',
            }),
            defineField({
              name: 'buttonMode',
              title: 'Действие кнопки',
              type: 'string',
              initialValue: 'none',
              options: {
                list: [
                  { title: 'Без кнопки', value: 'none' },
                  { title: 'Открывать страницу события', value: 'event' },
                  { title: 'Своя ссылка', value: 'custom' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            localizedStringField('buttonText', 'Текст кнопки', {
              description:
                'Если не заполнить, сайт покажет безопасный fallback.',
            }),
            defineField({
              name: 'customButtonUrl',
              title: 'Ссылка кнопки',
              type: 'string',
              description:
                'Можно указать внутренний путь (/events), якорь (#about) или внешнюю ссылку.',
              hidden: ({ parent }) => parent?.buttonMode !== 'custom',
            }),
          ],
          validation: (rule: ObjectRule) =>
            rule.custom((value: HeroSlideValidationValue | undefined) => {
              if (!value) return true

              const hasEventRef = Boolean(value.eventRef?._ref)
              const hasOwnTitle = hasLocalizedText(value.title)

              if (value.sourceType === 'event' && !hasEventRef) {
                return 'Для баннера на основе события выберите событие.'
              }

              if (!hasOwnTitle && !hasEventRef) {
                return 'Заполните заголовок или выберите событие как источник данных.'
              }

              if (value.imageSource === 'custom' && !value.customImage) {
                return 'Для собственного изображения загрузите картинку баннера.'
              }

              if (value.imageSource === 'event' && !hasEventRef) {
                return 'Чтобы брать изображение из события, сначала выберите событие.'
              }

              if (value.buttonMode === 'event' && !hasEventRef) {
                return 'Чтобы кнопка вела на событие, выберите событие.'
              }

              if (value.buttonMode === 'custom' && !value.customButtonUrl) {
                return 'Укажите ссылку для кнопки.'
              }

              return true
            }),
          preview: {
            select: {
              title: 'internalTitle',
              sourceType: 'sourceType',
              buttonMode: 'buttonMode',
              eventTitle: 'eventRef.title.ru',
              media: 'customImage',
              isActive: 'isActive',
            },
            prepare(selection) {
              const sourceLabel =
                selection.sourceType === 'event' ? 'Event' : 'Manual'
              const eventLabel = selection.eventTitle
                ? ` • ${selection.eventTitle}`
                : ''
              const stateLabel = selection.isActive === false ? ' • hidden' : ''

              return {
                title: selection.title || 'Новый баннер',
                subtitle: `${sourceLabel} • button:${selection.buttonMode || 'none'}${eventLabel}${stateLabel}`,
                media: selection.media,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: 'runningLine',
      title: 'Бегущая строка',
      type: 'object',
      fields: [
        localizedStringField('text', 'Текст строки'),
      ],
    }),
    defineField({
      name: 'groupStory',
      title: 'Блок Group Story',
      type: 'object',
      fields: [
        defineField({
          name: 'isActive',
          title: 'Показывать блок',
          type: 'boolean',
          initialValue: true,
        }),
        localizedStringField('marquee', 'Текст бегущей строки'),
        localizedStringField('titleTop', 'Заголовок: верхняя строка'),
        localizedStringField('titleBottom', 'Заголовок: нижняя строка'),
        localizedTextField('description', 'Описание'),
        localizedStringField('ctaText', 'Текст кнопки'),
        defineField({
          name: 'ctaUrl',
          title: 'Ссылка кнопки',
          type: 'string',
          description: 'Пример: /about или #about',
        }),
        defineField({
          name: 'previewImage',
          title: 'Фото (маленькое)',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'portraitImage',
          title: 'Фото (портрет)',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
