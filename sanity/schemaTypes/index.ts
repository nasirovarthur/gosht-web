import { type SchemaTypeDefinition } from 'sanity'
import { aboutPageSettings } from './aboutPageSettings'
import { companyProject } from './companyProject'
import { event } from './event'
import { eventsSettings } from './eventsSettings'
import { feedbackSettings } from './feedbackSettings'
import { footerSettings } from './footerSettings'
import { navigation } from './navigation'
import { heroSlide } from './heroSlide'
import { groupStorySection } from './groupStorySection'
import { homeEventsBlockSettings } from './homeEventsBlockSettings'
import { homeGroupStorySettings } from './homeGroupStorySettings'
import { homeHeroSliderSettings } from './homeHeroSliderSettings'
import { homePageSettings } from './homePageSettings'
import { homeRunningLineSettings } from './homeRunningLineSettings'
import { jobProfession } from './jobProfession'
import { jobsPageSettings } from './jobsPageSettings'
import { jobVacancy } from './jobVacancy'
import { partnersPageSettings } from './partnersPageSettings'
import { projectsPageSettings } from './projectsPageSettings'
import { restaurant } from './restaurant'
import { restaurantBranch } from './restaurantBranch'
import { restaurants } from './restaurants'
import { restaurantsPageSettings } from './restaurantsPageSettings'
import { runningLine } from './runningLine'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    aboutPageSettings,
    companyProject,
    event,
    eventsSettings,
    feedbackSettings,
    footerSettings,
    navigation,
    heroSlide,
    groupStorySection,
    homeEventsBlockSettings,
    homeGroupStorySettings,
    homeHeroSliderSettings,
    homePageSettings,
    homeRunningLineSettings,
    jobProfession,
    jobsPageSettings,
    jobVacancy,
    partnersPageSettings,
    projectsPageSettings,
    restaurant,
    restaurantBranch,
    restaurants,
    restaurantsPageSettings,
    runningLine,
  ],
}
