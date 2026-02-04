import { type SchemaTypeDefinition } from 'sanity'
import { navigation } from './navigation'
import { heroSlide } from './heroSlide'
import { runningLine } from './runningLine'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [navigation, heroSlide, runningLine],
}
