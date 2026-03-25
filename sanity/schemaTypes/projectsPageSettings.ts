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
        if (!fields?.uz) return 'Поле на узбекском обязательно'
        return true
      }),
  })

const localizedTextField = (name: string, title: string, rows = 4) =>
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

export const projectsPageSettings = defineType({
  name: 'projectsPageSettings',
  title: 'Страница проектов',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок страницы',
      type: 'object',
      fields: [
        { name: 'uz', title: 'O‘zbekcha', type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (rule) =>
        rule.custom((fields: { uz?: string } | undefined) => {
          if (!fields?.uz) return 'Заголовок на узбекском обязателен'
          return true
        }),
    }),
    localizedTextField('intro', 'Вступительный текст'),
    localizedStringField('descriptionLabel', 'Заголовок блока описания'),
    localizedStringField('galleryLabel', 'Заголовок блока галереи'),
    localizedStringField('contactsLabel', 'Заголовок блока контактов'),
  ],
  preview: {
    select: {
      titleRu: 'title.ru',
      titleUz: 'title.uz',
      titleEn: 'title.en',
      introRu: 'intro.ru',
      introUz: 'intro.uz',
      introEn: 'intro.en',
    },
    prepare(selection) {
      const title =
        selection.titleRu || selection.titleUz || selection.titleEn || 'Страница проектов'
      const intro =
        selection.introRu || selection.introUz || selection.introEn || 'Настройки страницы проектов'

      return {
        title,
        subtitle: intro,
      }
    },
  },
})
