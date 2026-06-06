import {defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      description: 'For editor reference only — not shown on the site.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Compose the page from reusable section blocks.',
      type: 'array',
      of: [{type: 'heroSection'}, {type: 'richTextSection'}, {type: 'featuredProductsSection'}],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
