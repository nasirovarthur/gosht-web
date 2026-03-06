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

export const restaurantBranch = defineType({
  name: 'restaurantBranch',
  title: 'Филиал проекта',
  type: 'document',
  fields: [
    defineField({
      name: 'project',
      title: 'Проект',
      type: 'reference',
      to: [{ type: 'restaurant' }],
      validation: (rule) => rule.required(),
    }),
    localizedStringField('branchName', 'Название филиала'),
    defineField({
      name: 'slug',
      title: 'Slug (для URL)',
      type: 'slug',
      options: {
        source: 'branchName.ru',
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return true
          return value.current.startsWith('/')
            ? 'Уберите "/" в начале slug. Пример: gosht-west'
            : true
        }),
    }),
    defineField({
      name: 'city',
      title: 'Город',
      type: 'string',
      options: {
        list: [
          { title: 'Ташкент', value: 'tashkent' },
          { title: 'Нью-Йорк', value: 'new_york' },
        ],
        layout: 'radio',
      },
      initialValue: 'tashkent',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cardImage',
      title: 'Фото карточки (для главной)',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Галерея филиала',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
    localizedStringField('address', 'Адрес'),
    defineField({
      name: 'phone',
      title: 'Телефон',
      type: 'string',
    }),
    localizedStringField('workingHours', 'Режим работы'),
    localizedStringField('averageCheck', 'Средний чек (для ресторанов)'),
    defineField({
      name: 'yearOpened',
      title: 'Год открытия',
      type: 'string',
      description: 'Показывается в верхнем инфо-блоке детальной страницы.',
    }),
    defineField({
      name: 'map',
      title: 'Карта (Yandex)',
      type: 'object',
      fields: [
        defineField({
          name: 'coordinates',
          title: 'Координаты (долгота, широта)',
          type: 'string',
          description: 'Формат: 69.279737,41.311081',
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true
              const [lonRaw, latRaw] = String(value).split(',').map((item) => item.trim())
              if (!lonRaw || !latRaw) return 'Введите координаты в формате: долгота,широта'

              const lon = Number(lonRaw)
              const lat = Number(latRaw)
              if (Number.isNaN(lon) || Number.isNaN(lat)) {
                return 'Координаты должны быть числом.'
              }
              if (lon < -180 || lon > 180) return 'Долгота должна быть в диапазоне -180...180.'
              if (lat < -90 || lat > 90) return 'Широта должна быть в диапазоне -90...90.'
              return true
            }),
        }),
        defineField({
          name: 'zoom',
          title: 'Zoom',
          type: 'number',
          initialValue: 15,
          validation: (rule) => rule.min(1).max(19),
        }),
      ],
    }),
    defineField({
      name: 'hasBanquet',
      title: 'Есть банкетный зал?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasPlayground',
      title: 'Есть детская площадка?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'menuFile',
      title: 'Меню филиала (PDF)',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
    }),
    defineField({
      name: 'externalUrl',
      title: 'Внешняя ссылка (опционально)',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Активный филиал',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'branchName.ru',
      subtitle: 'project.name.ru',
      media: 'cardImage',
    },
  },
})
