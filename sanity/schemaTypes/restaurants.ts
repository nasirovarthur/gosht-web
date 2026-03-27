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

const localizedTextField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha', type: 'text', rows: 4 },
      { name: 'ru', title: 'Русский', type: 'text', rows: 4 },
      { name: 'en', title: 'English', type: 'text', rows: 4 },
    ],
  })

export const restaurants = defineType({
  name: 'restaurants',
  title: 'Legacy: Рестораны (старый тип)',
  type: 'document',
  fields: [
    localizedStringField('name', 'Название (карточка)'),
    localizedStringField('branchName', 'Название филиала (детальная страница)'),
    defineField({
      name: 'slug',
      title: 'Slug (URL детальной страницы)',
      type: 'slug',
      options: {
        source: 'name.ru',
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return true
          return value.current.startsWith('/')
            ? 'Уберите "/" в начале slug. Пример: gosht-west'
            : true
        }),
    }),
    // НОВОЕ ПОЛЕ: Логотип
    defineField({
      name: 'logo',
      title: 'Логотип ресторана',
      type: 'image',
      options: { hotspot: true },
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
      name: 'image',
      title: 'Фото карточки',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    // НОВЫЕ ПОЛЯ: Метки
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
      name: 'url',
      title: 'Внешняя ссылка (опционально)',
      type: 'url',
    }),
    localizedStringField('address', 'Адрес'),
    defineField({
      name: 'phone',
      title: 'Телефон',
      type: 'string',
    }),
    localizedStringField('workingHours', 'Режим работы'),
    localizedStringField('averageCheck', 'Средний чек'),
    localizedTextField('description', 'Краткое описание'),
    localizedTextField('descriptionExtended', 'Расширенное описание'),
    defineField({
      name: 'yearOpened',
      title: 'Год открытия',
      type: 'string',
    }),
    defineField({
      name: 'menuFiles',
      title: 'Меню (PDF, несколько файлов)',
      type: 'array',
      of: [
        {
          type: 'file',
          options: {
            accept: 'application/pdf',
          },
        },
      ],
    }),
    defineField({
      name: 'menuFile',
      title: 'Меню (PDF, legacy)',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
    }),
    defineField({
      name: 'gallery',
      title: 'Галерея',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
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
      name: 'chef',
      title: 'Шеф-повар',
      type: 'object',
      fields: [
        localizedStringField('title', 'Заголовок блока'),
        localizedStringField('name', 'Имя'),
        localizedTextField('description', 'Описание'),
        defineField({
          name: 'image',
          title: 'Фото шефа',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name.ru',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
})
