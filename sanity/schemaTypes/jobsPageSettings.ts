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
      { name: 'uz', title: "O'zbekcha", type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
    validation: (rule) =>
      rule.custom((fields: { uz?: string } | undefined) => {
        if (!fields?.uz) return 'Поле на узбекском обязательно'
        return true
      }),
  })

export const jobsPageSettings = defineType({
  name: 'jobsPageSettings',
  title: 'Страница вакансий',
  type: 'document',
  fields: [
    localizedStringField('title', 'Заголовок страницы'),
    localizedTextField('intro', 'Вступительный текст'),
    localizedStringField('roleLabel', 'Подпись над профессиями'),
    localizedStringField('vacanciesLabel', 'Подпись над вакансиями'),
    localizedStringField('applyLabel', 'Текст кнопки отклика'),
    localizedStringField('salaryLabel', 'Подпись: оклад'),
    localizedStringField('experienceLabel', 'Подпись: опыт'),
    localizedStringField('scheduleLabel', 'Подпись: график'),
    localizedStringField('responsibilitiesLabel', 'Подпись: обязанности'),
    localizedStringField('requirementsLabel', 'Подпись: требования'),
    localizedStringField('conditionsLabel', 'Подпись: условия'),
    localizedStringField('contactsLabel', 'Подпись: контакты'),
    localizedStringField('emptyState', 'Текст пустого состояния'),
  ],
  preview: {
    select: {
      titleRu: 'title.ru',
      titleUz: 'title.uz',
      titleEn: 'title.en',
    },
    prepare(selection) {
      return {
        title:
          selection.titleRu ||
          selection.titleUz ||
          selection.titleEn ||
          'Страница вакансий',
      }
    },
  },
})
