import { type SchemaTypeDefinition } from 'sanity'
import { navigation } from './navigation'
import { heroSlide } from './heroSlide'
import { runningLine } from './runningLine'
import { restaurant } from './restaurant'
import { restaurantBranch } from './restaurantBranch'
import { restaurants } from './restaurants'
import { groupStorySection } from './groupStorySection'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [navigation, heroSlide, runningLine, groupStorySection, restaurant, restaurantBranch, restaurants],
}
