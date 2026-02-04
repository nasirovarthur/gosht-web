// sanity/schemaTypes/runningLine.ts
import { defineField, defineType } from 'sanity'

export const runningLine = defineType({
  name: 'runningLine',
  title: 'Running Line (Бегущая строка)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная бегущая строка',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Текст строки',
      type: 'object',
      fields: [
        { name: 'uz', title: "O'zbekcha", type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (rule) => rule.custom((fields: any) => {
        if (!fields?.uz) return "Text in Uzbek is required"
        return true
      })
    }),
  ],
})
