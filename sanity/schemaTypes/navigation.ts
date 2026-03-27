// sanity/schemaTypes/navigation.ts
import { defineField, defineType } from 'sanity'

export const navigation = defineType({
  name: 'navigation',
  title: 'Хедер и меню',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название блока (техническое)',
      type: 'string',
      initialValue: 'Хедер и меню',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Пункты хедера',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Пункт меню',
          validation: (rule) =>
            rule.custom((value) => {
              const item = value as
                | {
                    linkType?: 'internal' | 'external' | 'anchor' | 'none'
                    internalPath?: string
                    externalUrl?: string
                    anchorId?: string
                  }
                | undefined

              if (!item) return true

              if (item.linkType === 'internal' && !item.internalPath) {
                return 'Укажите внутренний путь'
              }

              if (item.linkType === 'external' && !item.externalUrl) {
                return 'Укажите внешнюю ссылку'
              }

              if (item.linkType === 'anchor' && !item.anchorId) {
                return 'Укажите якорь без #'
              }

              return true
            }),
          fields: [
            defineField({
              name: 'label',
              title: 'Название',
              type: 'object',
              fields: [
                { name: 'uz', title: 'O‘zbekcha (Main)', type: 'string' },
                { name: 'ru', title: 'Русский', type: 'string' },
                { name: 'en', title: 'English', type: 'string' },
              ],
              // Проверка: Узбекский обязателен
              validation: (rule) => rule.custom((fields: { uz?: string } | undefined) => {
                if (!fields?.uz) return 'Название на узбекском обязательно'
                return true
              })
            }),
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
            defineField({
              name: 'showInHeader',
              title: 'Показывать в Header',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'showInFooter',
              title: 'Показывать в Footer',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'link',
              title: 'Legacy ссылка',
              type: 'string',
              hidden: true,
              readOnly: true,
            }),
          ],
          preview: {
            select: {
              title: 'label.uz',
              linkType: 'linkType',
              internalPath: 'internalPath',
              externalUrl: 'externalUrl',
              anchorId: 'anchorId',
              legacyLink: 'link',
            },
            prepare(selection) {
              const {
                title,
                linkType,
                internalPath,
                externalUrl,
                anchorId,
                legacyLink,
              } = selection as {
                title?: string
                linkType?: string
                internalPath?: string
                externalUrl?: string
                anchorId?: string
                legacyLink?: string
              }

              const subtitle =
                linkType === 'internal'
                  ? internalPath || 'Внутренняя ссылка не заполнена'
                  : linkType === 'external'
                    ? externalUrl || 'Внешняя ссылка не заполнена'
                    : linkType === 'anchor'
                      ? anchorId ? `#${anchorId}` : 'Якорь не заполнен'
                      : legacyLink || 'Без ссылки'

              return {
                title,
                subtitle,
              }
            },
          },
        },
      ],
    }),
  ],
})
