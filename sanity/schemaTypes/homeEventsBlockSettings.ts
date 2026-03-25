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

export const homeEventsBlockSettings = defineType({
  name: 'homeEventsBlockSettings',
  title: 'Главная: Блок событий',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название (техническое)',
      type: 'string',
      initialValue: 'Главная: Блок событий',
      validation: (rule) => rule.required(),
    }),
    localizedStringField('heading', 'Заголовок блока'),
    localizedStringField('allEventsLabel', 'Текст ссылки "Все события"'),
    defineField({
      name: 'featuredEvent',
      title: 'Главное событие (большая карточка)',
      type: 'reference',
      to: [{ type: 'event' }],
      options: {
        filter: 'isActive != false',
      },
    }),
    defineField({
      name: 'sideEventFirst',
      title: 'Маленькая карточка #1',
      type: 'reference',
      to: [{ type: 'event' }],
      options: {
        filter: 'isActive != false',
      },
    }),
    defineField({
      name: 'sideEventSecond',
      title: 'Маленькая карточка #2',
      type: 'reference',
      to: [{ type: 'event' }],
      options: {
        filter: 'isActive != false',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
