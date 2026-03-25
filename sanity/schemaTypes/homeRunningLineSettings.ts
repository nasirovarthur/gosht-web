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

export const homeRunningLineSettings = defineType({
  name: 'homeRunningLineSettings',
  title: 'Главная: Бегущая строка',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная: Бегущая строка',
      validation: (rule) => rule.required(),
    }),
    localizedStringField('text', 'Текст строки'),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})

