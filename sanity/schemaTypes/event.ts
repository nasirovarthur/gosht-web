import { defineArrayMember, defineField, defineType } from 'sanity'

const localizedStringField = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
    ...(required
      ? {
          validation: (rule: { custom: (fn: (value: { uz?: string } | undefined) => true | string) => unknown }) =>
            rule.custom((value) => (value?.uz ? true : 'Поле на узбекском обязательно')),
        }
      : {}),
  })

const localizedTextField = (
  name: string,
  title: string,
  rows = 4,
  required = false,
  requireAllLanguages = false
) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: "O'zbekcha", type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
    ...(required
      ? {
          validation: (
            rule: {
              custom: (
                fn: (value: { uz?: string; ru?: string; en?: string } | undefined) => true | string
              ) => unknown
            }
          ) =>
            rule.custom((value) => {
              if (!value?.uz) return 'Описание на узбекском обязательно'
              if (requireAllLanguages && !value?.ru) return 'Описание на русском обязательно'
              if (requireAllLanguages && !value?.en) return 'Описание на английском обязательно'
              return true
            }),
        }
      : {}),
  })

export const event = defineType({
  name: 'event',
  title: 'Событие',
  type: 'document',
  fields: [
    defineField({
      name: 'isActive',
      title: 'Активное событие',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showOnHome',
      title: 'Показывать в блоке на главной',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'homePriority',
      title: 'Приоритет в блоке на главной',
      description: 'Меньше число = выше приоритет. Используется как fallback, если не выбраны события в настройках.',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.min(0),
    }),
    localizedStringField('title', 'Название', true),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title.ru',
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return true
          return value.current.startsWith('/')
            ? 'Уберите "/" в начале slug. Пример: kids-cooking-class'
            : true
        }),
    }),
    defineField({
      name: 'category',
      title: 'Категория',
      type: 'string',
      options: {
        list: [
          { title: 'Событие', value: 'event' },
          { title: 'Детское мероприятие', value: 'kids' },
        ],
        layout: 'radio',
      },
      initialValue: 'event',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eventDate',
      title: 'Дата события (для сортировки)',
      description: 'Используется для сортировки на сайте. Формат отображения задается в поле "Дата (текст)".',
      type: 'date',
    }),
    localizedStringField('date', 'Дата (текст)', true),
    localizedStringField('time', 'Время', true),
    defineField({
      name: 'branchRef',
      title: 'Филиал',
      description: 'Выберите филиал из существующих активных филиалов.',
      type: 'reference',
      to: [{ type: 'restaurantBranch' }],
      options: {
        filter: 'isActive != false',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Изображение',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Описание (абзацы)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [localizedTextField('text', 'Текст абзаца', 5, true, true)],
          preview: {
            select: {
              title: 'text.ru',
              subtitle: 'text.uz',
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  orderings: [
    {
      title: 'По дате события (новые)',
      name: 'eventDateDesc',
      by: [
        { field: 'eventDate', direction: 'desc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title.ru',
      subtitle: 'slug.current',
      media: 'image',
      category: 'category',
    },
    prepare(selection) {
      const categoryLabel = selection.category === 'kids' ? 'Kids' : 'Event'
      return {
        title: selection.title || 'Без названия',
        subtitle: `${categoryLabel} • ${selection.subtitle || ''}`,
        media: selection.media,
      }
    },
  },
})
