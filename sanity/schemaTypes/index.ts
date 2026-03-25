import { type SchemaTypeDefinition } from 'sanity'
import { navigation } from './navigation'
import { footerSettings } from './footerSettings'
import { feedbackSettings } from './feedbackSettings'
import { projectsPageSettings } from './projectsPageSettings'
import { aboutPageSettings } from './aboutPageSettings'
import { partnersPageSettings } from './partnersPageSettings'
import { homeHeroSliderSettings } from './homeHeroSliderSettings'
import { homeRunningLineSettings } from './homeRunningLineSettings'
import { homeGroupStorySettings } from './homeGroupStorySettings'
import { homeEventsBlockSettings } from './homeEventsBlockSettings'
import { restaurant } from './restaurant'
import { restaurantBranch } from './restaurantBranch'
import { companyProject } from './companyProject'
import { event } from './event'
import { eventsSettings } from './eventsSettings'
import { jobsPageSettings } from './jobsPageSettings'
import { jobProfession } from './jobProfession'
import { jobVacancy } from './jobVacancy'
import { restaurantsPageSettings } from './restaurantsPageSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    navigation,
    footerSettings,
    feedbackSettings,
    projectsPageSettings,
    aboutPageSettings,
    partnersPageSettings,
    homeHeroSliderSettings,
    homeRunningLineSettings,
    homeGroupStorySettings,
    homeEventsBlockSettings,
    restaurant,
    restaurantBranch,
    companyProject,
    event,
    eventsSettings,
    restaurantsPageSettings,
    jobsPageSettings,
    jobProfession,
    jobVacancy,
  ],
}
