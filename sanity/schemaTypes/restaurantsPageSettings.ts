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
  })

const localizedTextField = (name: string, title: string, rows = 3) =>
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

export const restaurantsPageSettings = defineType({
  name: 'restaurantsPageSettings',
  title: 'Страница ресторанов',
  type: 'document',
  fields: [
    localizedStringField('eyebrow', 'Надзаголовок'),
    localizedStringField('title', 'Заголовок страницы'),
    localizedTextField('intro', 'Вступительный текст', 4),
  ],
  preview: {
    select: {
      title: 'title.ru',
      subtitle: 'eyebrow.ru',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Страница ресторанов',
        subtitle: selection.subtitle || 'Настройки',
      }
    },
  },
})
