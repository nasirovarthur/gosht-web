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
    validation: (rule) => rule.required(),
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

const localizedOptionalStringField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha', type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
  })

export const restaurant = defineType({
  name: 'restaurant',
  title: 'Проект',
  type: 'document',
  fields: [
    defineField({
      name: 'projectType',
      title: 'Тип проекта',
      type: 'string',
      options: {
        list: [
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Barbershop', value: 'barbershop' },
        ],
        layout: 'radio',
      },
      initialValue: 'restaurant',
      validation: (rule) => rule.required(),
    }),
    localizedStringField('name', 'Название проекта'),
    localizedOptionalStringField(
      'detailPrimaryInfo',
      'Текст под меткой «КУХНЯ/ФОРМАТ» на детальной странице'
    ),
    defineField({
      name: 'logo',
      title: 'Логотип',
      type: 'image',
      options: { hotspot: true },
    }),
    localizedTextField('description', 'Описание (главный блок)'),
    localizedTextField('descriptionExtended', 'Описание (дополнительный блок)'),
    localizedTextField('descriptionAdditional', 'Описание (третий блок)'),
    defineField({
      name: 'lead',
      title: 'Ведущий специалист (Шеф/Мастер)',
      type: 'object',
      fields: [
        localizedStringField('title', 'Заголовок блока'),
        localizedStringField('name', 'Имя'),
        localizedTextField('description', 'Описание'),
        defineField({
          name: 'image',
          title: 'Фото',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: 'defaultMenuFile',
      title: 'Меню по умолчанию (опционально)',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
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
      title: 'name.ru',
      subtitle: 'projectType',
      media: 'logo',
    },
  },
})
