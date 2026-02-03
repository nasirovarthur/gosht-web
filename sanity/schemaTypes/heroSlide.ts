import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'heroSlide',
  title: 'Главный Слайдер',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Надзаголовок',
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
      initialValue: 'Замените текст'
    }),
    defineField({
      name: 'showButton',
      title: 'Показывать кнопку',
      type: 'boolean',
      initialValue: true
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