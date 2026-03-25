import { defineField, defineType } from 'sanity'

const localizedStringField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'uz', title: 'O‘zbekcha (Main)', type: 'string' },
      { name: 'ru', title: 'Русский', type: 'string' },
      { name: 'en', title: 'English', type: 'string' },
    ],
    validation: (rule) =>
      rule.custom((fields: { uz?: string } | undefined) => {
        if (!fields?.uz) return 'Поле на узбекском обязательно'
        return true
      }),
  })

const linkFields = [
  defineField({
    name: 'linkType',
    title: 'Тип ссылки',
    type: 'string',
    initialValue: 'none',
    options: {
      layout: 'radio',
      list: [
        { title: 'Без ссылки', value: 'none' },
        { title: 'Внутренняя страница', value: 'internal' },
        { title: 'Внешняя ссылка', value: 'external' },
        { title: 'Якорь на странице', value: 'anchor' },
      ],
    },
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'internalPath',
    title: 'Внутренний путь',
    type: 'string',
    description: 'Пример: /events или /projects. Язык подставится автоматически.',
    hidden: ({ parent }) => parent?.linkType !== 'internal',
  }),
  defineField({
    name: 'externalUrl',
    title: 'Внешняя ссылка',
    type: 'url',
    hidden: ({ parent }) => parent?.linkType !== 'external',
  }),
  defineField({
    name: 'openInNewTab',
    title: 'Открывать в новой вкладке',
    type: 'boolean',
    initialValue: false,
    hidden: ({ parent }) => parent?.linkType !== 'external',
  }),
  defineField({
    name: 'anchorId',
    title: 'Якорь',
    type: 'string',
    description: 'Например: contacts или footer. Без символа #.',
    hidden: ({ parent }) => parent?.linkType !== 'anchor',
  }),
] as const

export const footerSettings = defineType({
  name: 'footerSettings',
  title: 'Футер',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название блока (техническое)',
      type: 'string',
      initialValue: 'Футер сайта',
      validation: (rule) => rule.required(),
    }),
    localizedStringField('heading', 'Заголовок'),
    localizedStringField('subtitle', 'Подзаголовок'),
    localizedStringField('languageLabel', 'Подпись выбора языка'),
    localizedStringField('feedbackLabel', 'Текст кнопки обратной связи'),
    defineField({
      name: 'feedbackLink',
      title: 'Ссылка кнопки обратной связи',
      type: 'object',
      fields: [...linkFields],
    }),
    localizedStringField('rightsText', 'Текст внизу слева'),
    localizedStringField('madeByLabel', 'Текст ссылки внизу справа'),
    defineField({
      name: 'madeByLink',
      title: 'Ссылка внизу справа',
      type: 'object',
      fields: [...linkFields],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Социальные сети',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Соцсеть',
          fields: [
            defineField({
              name: 'label',
              title: 'Название',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            ...linkFields,
          ],
          preview: {
            select: {
              title: 'label',
              linkType: 'linkType',
              internalPath: 'internalPath',
              externalUrl: 'externalUrl',
              anchorId: 'anchorId',
            },
            prepare(selection) {
              const subtitle =
                selection.linkType === 'internal'
                  ? selection.internalPath
                  : selection.linkType === 'external'
                    ? selection.externalUrl
                    : selection.linkType === 'anchor'
                      ? selection.anchorId
                        ? `#${selection.anchorId}`
                        : 'Якорь не заполнен'
                      : 'Без ссылки'

              return {
                title: selection.title,
                subtitle,
              }
            },
          },
        },
      ],
    }),
  ],
})
