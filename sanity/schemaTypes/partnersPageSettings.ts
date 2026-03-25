import { defineField, defineType } from 'sanity'

export const partnersPageSettings = defineType({
  name: 'partnersPageSettings',
  title: 'Страница партнеров',
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
    defineField({
      name: 'partners',
      title: 'Список партнеров',
      type: 'array',
      of: [
        defineField({
          name: 'partner',
          title: 'Партнер',
          type: 'object',
          fields: [
            defineField({
              name: 'companyName',
              title: 'Название компании',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'website',
              title: 'Ссылка на сайт',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'logo',
              title: 'Логотип',
              type: 'image',
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'companyName',
              media: 'logo',
              subtitle: 'website',
            },
            prepare(selection) {
              return {
                title: selection.title || 'Партнер',
                subtitle: selection.subtitle || '',
                media: selection.media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      titleRu: 'title.ru',
      titleUz: 'title.uz',
      titleEn: 'title.en',
      partners: 'partners',
    },
    prepare(selection) {
      const title =
        selection.titleRu || selection.titleUz || selection.titleEn || 'Страница партнеров'

      const count = Array.isArray(selection.partners) ? selection.partners.length : 0
      const subtitle = count > 0 ? `Партнеров: ${count}` : 'Список партнеров пуст'

      return {
        title,
        subtitle,
      }
    },
  },
})
