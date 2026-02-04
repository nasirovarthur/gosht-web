// sanity/schemaTypes/heroSlide.ts
import { defineField, defineType } from 'sanity'

export const heroSlide = defineType({
  name: 'heroSlide',
  title: 'Hero Slide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: [
        { name: 'uz', title: "O'zbekcha", type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (rule) => rule.custom((fields: any) => {
        if (!fields?.uz) return "Title in Uzbek is required"
        return true
      })
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'object',
      fields: [
        { name: 'uz', title: "O'zbekcha", type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'uz', title: "O'zbekcha", type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'image',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'object',
      fields: [
        { name: 'uz', title: "O'zbekcha", type: 'string' },
        { name: 'ru', title: 'Русский', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'buttonUrl',
      title: 'Button URL',
      type: 'string',
    }),
    defineField({
      name: 'showButton',
      title: 'Show Button',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
