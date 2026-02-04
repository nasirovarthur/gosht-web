// sanity/schemaTypes/navigation.ts
import { defineField, defineType } from 'sanity'

export const navigation = defineType({
  name: 'navigation',
  title: 'Навигация (Меню)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название меню (техническое)',
      type: 'string',
      initialValue: 'Главное меню',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Пункты меню',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Ссылка',
          fields: [
            // МУЛЬТИЯЗЫЧНОЕ НАЗВАНИЕ
            defineField({
              name: 'label',
              title: 'Название',
              type: 'object',
              fields: [
                { name: 'uz', title: 'O‘zbekcha (Main)', type: 'string' },
                { name: 'ru', title: 'Русский', type: 'string' },
                { name: 'en', title: 'English', type: 'string' },
              ],
              // Проверка: Узбекский обязателен
              validation: (rule) => rule.custom((fields: any) => {
                if (!fields?.uz) return 'Название на узбекском обязательно'
                return true
              })
            }),
            // ССЫЛКА (Одна для всех языков, Next.js сам разберется)
            defineField({
              name: 'link',
              title: 'Ссылка',
              type: 'string',
              description: 'Пример: /about или #contacts',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label.uz',
              subtitle: 'link',
            },
          },
        },
      ],
    }),
  ],
})