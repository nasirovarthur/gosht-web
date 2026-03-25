import { defineField, defineType } from 'sanity'

const localizedStringField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha', type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
    validation: (rule) =>
      rule.custom((fields: { uz?: string } | undefined) => {
        if (!fields?.uz) return 'Название на узбекском обязательно'
        return true
      }),
  })

const localizedTextField = (name: string, title: string, rows = 5) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha', type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
  })

export const companyProject = defineType({
  name: 'companyProject',
  title: 'Проект компании',
  type: 'document',
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Техническое название',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(1),
    }),
    localizedStringField('name', 'Название проекта'),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'internalTitle',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Логотип проекта',
      type: 'image',
      options: { hotspot: true },
    }),
    localizedStringField('descriptionTitle', 'Заголовок описания'),
    localizedTextField('description', 'Описание', 6),
    defineField({
      name: 'gallery',
      title: 'Галерея',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: 'contacts',
      title: 'Контакты для связи',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Контакт',
          fields: [
            localizedStringField('label', 'Название контакта'),
            defineField({
              name: 'value',
              title: 'Значение',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Ссылка',
              type: 'string',
              description: 'Пример: tel:+998..., mailto:..., https://...',
            }),
          ],
          preview: {
            select: {
              title: 'label.ru',
              subtitle: 'value',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Активный проект',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'internalTitle',
      subtitle: 'name.ru',
      media: 'logo',
    },
  },
})
