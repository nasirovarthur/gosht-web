import { defineField, defineType } from 'sanity'

const localizedStringField = (
  name: string,
  title: string,
  description?: string
) =>
  defineField({
    name,
    title,
    type: 'object',
    description,
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

export const feedbackSettings = defineType({
  name: 'feedbackSettings',
  title: 'Обратная связь',
  type: 'document',
  fields: [
    localizedStringField('drawerTitle', 'Заголовок кнопки в форме'),
    localizedStringField('subtitle', 'Вступительный текст'),
    localizedStringField('consentLabel', 'Согласие на обработку данных'),
    localizedStringField('successTitle', 'Заголовок успешной отправки'),
    localizedStringField('successDescription', 'Текст успешной отправки'),
    localizedStringField('errorLabel', 'Ошибка отправки'),
  ],
  preview: {
    prepare() {
      return {
        title: 'Настройки формы обратной связи',
      }
    },
  },
})
