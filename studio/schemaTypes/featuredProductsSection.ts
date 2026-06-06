import {defineField, defineType} from 'sanity'

export const featuredProductsSection = defineType({
  name: 'featuredProductsSection',
  title: 'Featured Products Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'productHandles',
      title: 'Product Handles',
      description:
        'Shopify product handles to feature. Hydrogen looks these up against the Storefront API (Mock.shop in dev).',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Featured Products'}
    },
  },
})
