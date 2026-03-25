export const singletonDocumentIds = {
  navigation: 'site-navigation',
  footerSettings: 'site-footer-settings',
  feedbackSettings: 'feedback-settings',
  projectsPageSettings: 'projects-page-settings',
  aboutPageSettings: 'about-page-settings',
  partnersPageSettings: 'partners-page-settings',
  homeHeroSliderSettings: 'home-hero-slider-settings',
  homeRunningLineSettings: 'home-running-line-settings',
  homeGroupStorySettings: 'home-group-story-settings',
  homeEventsBlockSettings: 'home-events-block-settings',
  eventsSettings: 'events-settings',
  restaurantsPageSettings: 'restaurants-page-settings',
} as const

export const singletonTypes = new Set([
  'navigation',
  'footerSettings',
  'feedbackSettings',
  'projectsPageSettings',
  'aboutPageSettings',
  'partnersPageSettings',
  'homeHeroSliderSettings',
  'homeRunningLineSettings',
  'homeGroupStorySettings',
  'homeEventsBlockSettings',
  'eventsSettings',
  'restaurantsPageSettings',
])
