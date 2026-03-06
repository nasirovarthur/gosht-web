import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Проекты')
        .schemaType('restaurant')
        .child(S.documentTypeList('restaurant').title('Проекты')),
      S.listItem()
        .title('Филиалы')
        .schemaType('restaurantBranch')
        .child(S.documentTypeList('restaurantBranch').title('Филиалы')),
      S.listItem()
        .title('Главная: Group Story')
        .schemaType('groupStorySection')
        .child(S.documentTypeList('groupStorySection').title('Главная: Group Story')),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return id !== 'restaurant' && id !== 'restaurantBranch' && id !== 'restaurants' && id !== 'groupStorySection'
      }),
    ])
