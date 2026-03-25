import type {StructureResolver} from 'sanity/structure'
import { singletonDocumentIds } from './singletons'

const singletonEditor = (
  S: Parameters<StructureResolver>[0],
  title: string,
  schemaType: string,
  documentId: string
) =>
  S.listItem()
    .title(title)
    .schemaType(schemaType)
    .child(S.editor().id(documentId).schemaType(schemaType).documentId(documentId))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Сайт')
        .child(
          S.list()
            .title('Сайт')
            .items([
              singletonEditor(
                S,
                'Хедер и меню',
                'navigation',
                singletonDocumentIds.navigation
              ),
              singletonEditor(
                S,
                'Футер',
                'footerSettings',
                singletonDocumentIds.footerSettings
              ),
              singletonEditor(
                S,
                'Обратная связь',
                'feedbackSettings',
                singletonDocumentIds.feedbackSettings
              ),
            ])
        ),
      singletonEditor(
        S,
        'Страница About',
        'aboutPageSettings',
        singletonDocumentIds.aboutPageSettings
      ),
      singletonEditor(
        S,
        'Страница партнеров',
        'partnersPageSettings',
        singletonDocumentIds.partnersPageSettings
      ),
      S.listItem()
        .title('Вакансии')
        .child(
          S.list()
            .title('Вакансии')
            .items([
              S.listItem()
                .title('Настройки страницы')
                .schemaType('jobsPageSettings')
                .child(
                  S.documentTypeList('jobsPageSettings').title('Настройки страницы')
                ),
              S.listItem()
                .title('Профессии')
                .schemaType('jobProfession')
                .child(S.documentTypeList('jobProfession').title('Профессии')),
              S.listItem()
                .title('Вакансии')
                .schemaType('jobVacancy')
                .child(S.documentTypeList('jobVacancy').title('Вакансии')),
            ])
        ),
      S.listItem()
        .title('Главная')
        .child(
          S.list()
            .title('Главная')
            .items([
              singletonEditor(
                S,
                'Слайдер',
                'homeHeroSliderSettings',
                singletonDocumentIds.homeHeroSliderSettings
              ),
              singletonEditor(
                S,
                'Бегущая строка',
                'homeRunningLineSettings',
                singletonDocumentIds.homeRunningLineSettings
              ),
              singletonEditor(
                S,
                'История',
                'homeGroupStorySettings',
                singletonDocumentIds.homeGroupStorySettings
              ),
              singletonEditor(
                S,
                'Блок событий',
                'homeEventsBlockSettings',
                singletonDocumentIds.homeEventsBlockSettings
              ),
            ])
        ),
      S.listItem()
        .title('События')
        .child(
          S.list()
            .title('События')
            .items([
              S.listItem()
                .title('Все события')
                .schemaType('event')
                .child(S.documentTypeList('event').title('События')),
              singletonEditor(
                S,
                'Настройки раздела',
                'eventsSettings',
                singletonDocumentIds.eventsSettings
              ),
            ])
        ),
      S.listItem()
        .title('Проекты')
        .child(
          S.list()
            .title('Проекты')
            .items([
              singletonEditor(
                S,
                'Страница проектов',
                'projectsPageSettings',
                singletonDocumentIds.projectsPageSettings
              ),
              singletonEditor(
                S,
                'Страница ресторанов',
                'restaurantsPageSettings',
                singletonDocumentIds.restaurantsPageSettings
              ),
              S.listItem()
                .title('Проекты компании')
                .schemaType('companyProject')
                .child(S.documentTypeList('companyProject').title('Проекты компании')),
              S.listItem()
                .title('Ресторанные проекты')
                .schemaType('restaurant')
                .child(S.documentTypeList('restaurant').title('Проекты')),
              S.listItem()
                .title('Филиалы')
                .schemaType('restaurantBranch')
                .child(S.documentTypeList('restaurantBranch').title('Филиалы')),
            ])
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return (
          id !== 'navigation' &&
          id !== 'footerSettings' &&
          id !== 'feedbackSettings' &&
          id !== 'projectsPageSettings' &&
          id !== 'aboutPageSettings' &&
          id !== 'partnersPageSettings' &&
          id !== 'jobsPageSettings' &&
          id !== 'jobProfession' &&
          id !== 'jobVacancy' &&
          id !== 'homeHeroSliderSettings' &&
          id !== 'homeRunningLineSettings' &&
          id !== 'homeGroupStorySettings' &&
          id !== 'homeEventsBlockSettings' &&
          id !== 'restaurant' &&
          id !== 'restaurantBranch' &&
          id !== 'restaurantsPageSettings' &&
          id !== 'companyProject' &&
          id !== 'event' &&
          id !== 'eventsSettings'
        )
      }),
    ])
