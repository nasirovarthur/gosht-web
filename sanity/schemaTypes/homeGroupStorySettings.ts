import { defineField, defineType } from 'sanity'

const localizedStringField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
  })

const localizedTextField = (name: string, title: string, rows = 4) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
  })

export const homeGroupStorySettings = defineType({
  name: 'homeGroupStorySettings',
  title: 'Главная: История',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная: История',
      validation: (rule) => rule.required(),
    }),
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
  preview: {
    select: {
      title: 'title',
      media: 'portraitImage',
    },
  },
})

