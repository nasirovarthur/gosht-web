import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'heroSlide',
  title: 'Главный Слайдер',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок (например: INTERNATIONAL)',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Надзаголовок (например: GLOBAL PRESENCE)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Описание снизу',
      type: 'string',
    }),
    defineField({
      name: 'buttonText',
      title: 'Текст кнопки',
      type: 'string',
      initialValue: 'ВСЕ ПРОЕКТЫ'
    }),
    defineField({
      name: 'image',
      title: 'Фоновое фото',
      type: 'image',
      options: {
        hotspot: true, // Позволяет выбирать центр картинки, чтобы она красиво обрезалась
      },
    }),
  ],
})