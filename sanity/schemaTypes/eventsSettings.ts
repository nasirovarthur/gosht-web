import { defineField, defineType } from 'sanity'

export const eventsSettings = defineType({
  name: 'eventsSettings',
  title: 'События: Настройки',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Настройки раздела событий',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'listing',
      title: 'Страница "Все события"',
      type: 'object',
      fields: [
        defineField({
          name: 'initialVisibleCount',
          title: 'Количество карточек до кнопки "Смотреть ещё"',
          type: 'number',
          initialValue: 12,
          validation: (rule) => rule.required().min(1).max(60),
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
