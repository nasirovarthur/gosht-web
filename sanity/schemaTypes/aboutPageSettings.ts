import { defineField, defineType } from 'sanity'

const localizedStringField = (name: string, title: string) =>
  defineField({
    name,
    title,
    description: 'Заполняйте узбекскую версию обязательно. Если нужно, русскую и английскую можно отредактировать отдельно.',
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
    description:
      'Для ручных переносов в дизайне используйте новую строку. Узбекская версия обязательна.',
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha', type: 'text', rows },
      { name: 'ru', title: 'Русский', type: 'text', rows },
      { name: 'en', title: 'English', type: 'text', rows },
    ],
    validation: (rule) =>
      rule.custom((fields: { uz?: string } | undefined) => {
        if (!fields?.uz) return 'Поле на узбекском обязательно'
        return true
      }),
  })

const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    description: 'Если изображение не загрузить, на сайте останется текущий резервный визуал.',
    type: 'image',
    options: { hotspot: true },
  })

export const aboutPageSettings = defineType({
  name: 'aboutPageSettings',
  title: 'Страница About',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название документа',
      type: 'string',
      initialValue: 'Страница About',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSection',
      title: 'Первый экран',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        localizedTextField('title', 'Большой заголовок', 4),
        localizedTextField('bodyFirst', 'Первый абзац', 4),
        localizedTextField('bodySecond', 'Второй абзац', 4),
        localizedTextField('accentTitle', 'Крупный нижний заголовок', 4),
        imageField('primaryImage', 'Большое фото слева'),
        localizedStringField('primaryCaption', 'Подпись под большим фото'),
        imageField('secondaryImage', 'Малое фото справа'),
      ],
    }),
    defineField({
      name: 'founderSection',
      title: 'Блок основателя',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        localizedTextField('leadFirst', 'Верхний абзац 1', 4),
        localizedTextField('leadSecond', 'Верхний абзац 2', 4),
        localizedTextField('aside', 'Левый короткий абзац', 4),
        localizedStringField('name', 'Имя'),
        localizedStringField('role', 'Роль'),
        imageField('image', 'Фото справа'),
        localizedStringField('caption', 'Подпись под фото'),
      ],
    }),
    defineField({
      name: 'brandsSection',
      title: 'Блок брендов',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        localizedTextField('title', 'Заголовок', 3),
        localizedTextField('body', 'Описание', 4),
        defineField({
          name: 'includeCompanyProjects',
          title: 'Показывать логотипы проектов компании',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'includeRestaurantProjects',
          title: 'Показывать логотипы ресторанных проектов',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'systemSection',
      title: 'Финальный блок',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        imageField('image', 'Фото слева'),
        localizedStringField('caption', 'Вертикальная подпись'),
        localizedTextField('title', 'Большой заголовок справа', 4),
        localizedTextField('body', 'Нижний абзац', 4),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'heroSection.title.ru',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Страница About',
        subtitle: selection.subtitle || 'Настройки страницы About',
      }
    },
  },
})
