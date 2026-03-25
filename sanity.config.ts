'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import { singletonTypes } from './sanity/singletons'
import { LocalizedTranslateInput } from './components/sanity/LocalizedTranslateInput'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  form: {
    components: {
      input: LocalizedTranslateInput,
    },
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type !== 'global') {
        return prev
      }

      return prev.filter((templateItem) => !singletonTypes.has(templateItem.templateId))
    },
    actions: (prev, context) => {
      if (!singletonTypes.has(context.schemaType)) {
        return prev
      }

      return prev.filter(
        ({action}) =>
          action !== 'duplicate' &&
          action !== 'unpublish' &&
          action !== 'delete'
      )
    },
  },
})
