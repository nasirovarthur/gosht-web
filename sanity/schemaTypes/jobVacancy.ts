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

const localizedListField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineField({
        name: 'item',
        title: 'Пункт',
        type: 'object',
        fields: [
          { name: 'uz', title: "O'zbekcha", type: 'string' },
          { name: 'ru', title: 'Русский', type: 'string' },
          { name: 'en', title: 'English', type: 'string' },
        ],
        validation: (rule) =>
          rule.custom((fields: { uz?: string } | undefined) => {
            if (!fields?.uz) return 'Пункт на узбекском обязателен'
            return true
          }),
      }),
    ],
  })

export const jobVacancy = defineType({
  name: 'jobVacancy',
  title: 'Вакансия',
  type: 'document',
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Техническое название',
      type: 'string',
      description: 'Только для админки. Например: Head Chef / Gosht City',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'professionRef',
      title: 'Профессия',
      type: 'reference',
      to: [{ type: 'jobProfession' }],
      options: {
        filter: 'isActive != false',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок внутри профессии',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(1),
    }),
    localizedStringField('restaurantName', 'Название ресторана'),
    localizedTextField('restaurantSummary', 'Краткое описание ресторана', 3),
    localizedStringField('salary', 'Оклад'),
    localizedStringField('experience', 'Опыт'),
    localizedStringField('schedule', 'График'),
    localizedListField('responsibilities', 'Обязанности'),
    localizedListField('requirements', 'Требования'),
    localizedListField('conditions', 'Условия'),
    defineField({
      name: 'contactPhone',
      title: 'Контактный телефон',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Контактный email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'isActive',
      title: 'Активная вакансия',
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
      title: 'restaurantName.ru',
      titleUz: 'restaurantName.uz',
      internalTitle: 'internalTitle',
      profession: 'professionRef.internalTitle',
      isActive: 'isActive',
    },
    prepare(selection) {
      const title =
        selection.title || selection.titleUz || selection.internalTitle || 'Вакансия'
      const profession = selection.profession || 'Без профессии'
      const status = selection.isActive === false ? 'Неактивна' : 'Активна'

      return {
        title,
        subtitle: `${profession} • ${status}`,
      }
    },
  },
})
