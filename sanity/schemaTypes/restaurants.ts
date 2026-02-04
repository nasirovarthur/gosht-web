import { defineField, defineType } from 'sanity'

export const restaurants = defineType({
  name: 'restaurants',
  title: 'Рестораны',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Название',
      type: 'object',
      fields: [
        { name: 'uz', title: 'O‘zbekcha', type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (rule) => rule.required(),
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
      title: 'Ссылка',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'name.ru',
      subtitle: 'city',
      media: 'image',
    },
  },
})