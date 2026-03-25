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
    validation: (rule) =>
      rule.custom((fields: { uz?: string } | undefined) => {
        if (!fields?.uz) return 'Название на узбекском обязательно'
        return true
      }),
  })

export const jobProfession = defineType({
  name: 'jobProfession',
  title: 'Профессия',
  type: 'document',
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Техническое название',
      type: 'string',
      description: 'Только для админки. Например: Head Chef / Waiter / Barista',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(1),
    }),
    localizedStringField('title', 'Название профессии'),
    defineField({
      name: 'isActive',
      title: 'Активная профессия',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'По порядку',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.ru',
      titleUz: 'title.uz',
      internalTitle: 'internalTitle',
      isActive: 'isActive',
    },
    prepare(selection) {
      const title =
        selection.title || selection.titleUz || selection.internalTitle || 'Профессия'

      return {
        title,
        subtitle: selection.isActive === false ? 'Неактивна' : 'Активна',
      }
    },
  },
})
