import { type SchemaTypeDefinition } from 'sanity'
import { navigation } from './navigation'
import { heroSlide } from './heroSlide'
import { runningLine } from './runningLine'
import { restaurants } from './restaurants'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [navigation, heroSlide, runningLine, restaurants],
}
