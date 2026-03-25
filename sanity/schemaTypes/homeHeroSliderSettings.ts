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
  description?: string
) =>
  defineField({
    name,
    title,
    description,
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
  description?: string
) =>
  defineField({
    name,
    title,
    description,
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

export const homeHeroSliderSettings = defineType({
  name: 'homeHeroSliderSettings',
  title: 'Главная: Слайдер',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная: Слайдер',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slides',
      title: 'Слайды',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'heroSlideItem',
          title: 'Слайд',
          fields: [
            defineField({
              name: 'internalTitle',
              title: 'Название слайда (техническое)',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'isActive',
              title: 'Показывать слайд',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'sourceType',
              title: 'Источник контента',
              type: 'string',
              initialValue: 'manual',
              options: {
                list: [
                  { title: 'Независимый слайд', value: 'manual' },
                  { title: 'Слайд на основе события', value: 'event' },
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
            localizedStringField(
              'subtitle',
              'Надзаголовок',
              'Можно оставить пустым. Для слайда события сайт подставит дату события.'
            ),
            localizedStringField(
              'title',
              'Заголовок',
              'Можно оставить пустым, тогда для слайда события заголовок подтянется из события.'
            ),
            localizedTextField(
              'description',
              'Описание',
              3,
              'Можно оставить пустым, тогда для слайда события описание возьмется из первого абзаца события.'
            ),
            defineField({
              name: 'imageSource',
              title: 'Источник изображения',
              type: 'string',
              initialValue: 'custom',
              options: {
                list: [
                  { title: 'Свое изображение', value: 'custom' },
                  { title: 'Из события', value: 'event' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'customImage',
              title: 'Изображение',
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
                  { title: 'Переход на страницу события', value: 'event' },
                  { title: 'Своя ссылка', value: 'custom' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            localizedStringField('buttonText', 'Текст кнопки'),
            defineField({
              name: 'customButtonUrl',
              title: 'Ссылка кнопки',
              type: 'string',
              description: 'Пример: /events, #about или https://...',
              hidden: ({ parent }) => parent?.buttonMode !== 'custom',
            }),
          ],
          validation: (rule: ObjectRule) =>
            rule.custom((value: HeroSlideValidationValue | undefined) => {
              if (!value) return true

              const hasEventRef = Boolean(value.eventRef?._ref)
              const hasOwnTitle = hasLocalizedText(value.title)

              if (value.sourceType === 'event' && !hasEventRef) {
                return 'Для слайда на основе события выберите событие.'
              }

              if (!hasOwnTitle && !hasEventRef) {
                return 'Заполните заголовок или выберите событие.'
              }

              if (value.imageSource === 'custom' && !value.customImage) {
                return 'Загрузите изображение для слайда.'
              }

              if (value.imageSource === 'event' && !hasEventRef) {
                return 'Чтобы брать картинку из события, выберите событие.'
              }

              if (value.buttonMode === 'event' && !hasEventRef) {
                return 'Для перехода на событие выберите событие.'
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
                title: selection.title || 'Новый слайд',
                subtitle: `${sourceLabel} • button:${selection.buttonMode || 'none'}${eventLabel}${stateLabel}`,
                media: selection.media,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.max(10),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
