import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2025-01-01' })

const localized = (value) => ({
  uz: value,
  ru: value,
  en: value,
})

const projectsPageSettings = {
  _id: 'projects-page-settings',
  _type: 'projectsPageSettings',
  title: {
    uz: 'LOYIHALAR',
    ru: 'ПРОЕКТЫ',
    en: 'PROJECTS',
  },
  intro: {
    uz: 'Guruhning yo‘nalishlari va formatlari bilan tanishing. Har bir loyiha shu sahifada ochiladi.',
    ru: 'Познакомьтесь с форматами и направлениями группы. Каждый проект раскрывается прямо на этой странице.',
    en: 'Explore the group’s formats and ventures. Each project opens right on this page.',
  },
  descriptionLabel: {
    uz: 'Loyiha haqida',
    ru: 'О проекте',
    en: 'About the project',
  },
  galleryLabel: {
    uz: 'Galereya',
    ru: 'Галерея',
    en: 'Gallery',
  },
  contactsLabel: {
    uz: 'Aloqa',
    ru: 'Контакты',
    en: 'Contacts',
  },
}

const companyProjects = [
  {
    _id: 'company-project-gosht-kids-01',
    _type: 'companyProject',
    internalTitle: 'Gōsht Kids / 01',
    order: 1,
    name: localized('Gōsht Kids'),
    slug: { current: 'gosht-kids-01' },
    descriptionTitle: {
      uz: 'Loyiha tavsifi',
      ru: 'Описание проекта',
      en: 'Project overview',
    },
    description: {
      uz: 'Kontent Sanity orqali to‘ldiriladi. Ushbu loyiha uchun tavsif tayyor joylashgan.',
      ru: 'Контент заполняется через Sanity. Этот блок уже готов для описания проекта.',
      en: 'Content is managed via Sanity. This section is ready for the project narrative.',
    },
    contacts: [],
    gallery: [],
    isActive: true,
  },
  {
    _id: 'company-project-gosht-kids-02',
    _type: 'companyProject',
    internalTitle: 'Gōsht Kids / 02',
    order: 2,
    name: localized('Gōsht Kids'),
    slug: { current: 'gosht-kids-02' },
    descriptionTitle: {
      uz: 'Loyiha tavsifi',
      ru: 'Описание проекта',
      en: 'Project overview',
    },
    description: {
      uz: 'Kontent Sanity orqali to‘ldiriladi. Ushbu loyiha uchun tavsif tayyor joylashgan.',
      ru: 'Контент заполняется через Sanity. Этот блок уже готов для описания проекта.',
      en: 'Content is managed via Sanity. This section is ready for the project narrative.',
    },
    contacts: [],
    gallery: [],
    isActive: true,
  },
  {
    _id: 'company-project-lavka-by-gosht',
    _type: 'companyProject',
    internalTitle: 'Lavka by Gōsht',
    order: 3,
    name: localized('Lavka by Gōsht'),
    slug: { current: 'lavka-by-gosht' },
    descriptionTitle: {
      uz: 'Loyiha tavsifi',
      ru: 'Описание проекта',
      en: 'Project overview',
    },
    description: {
      uz: 'Kontent Sanity orqali to‘ldiriladi. Ushbu loyiha uchun tavsif tayyor joylashgan.',
      ru: 'Контент заполняется через Sanity. Этот блок уже готов для описания проекта.',
      en: 'Content is managed via Sanity. This section is ready for the project narrative.',
    },
    contacts: [],
    gallery: [],
    isActive: true,
  },
  {
    _id: 'company-project-gosht-catering',
    _type: 'companyProject',
    internalTitle: 'Gōsht Catering',
    order: 4,
    name: localized('Gōsht Catering'),
    slug: { current: 'gosht-catering' },
    descriptionTitle: {
      uz: 'Loyiha tavsifi',
      ru: 'Описание проекта',
      en: 'Project overview',
    },
    description: {
      uz: 'Kontent Sanity orqali to‘ldiriladi. Ushbu loyiha uchun tavsif tayyor joylashgan.',
      ru: 'Контент заполняется через Sanity. Этот блок уже готов для описания проекта.',
      en: 'Content is managed via Sanity. This section is ready for the project narrative.',
    },
    contacts: [],
    gallery: [],
    isActive: true,
  },
]

async function patchNavigationProjectsLink() {
  const navigation = await client.fetch(`*[_id == "site-navigation"][0]`)

  if (!navigation?.items?.length) {
    return false
  }

  const items = navigation.items.map((item) => {
    const ru = item?.label?.ru
    const en = item?.label?.en
    const uz = item?.label?.uz
    const isProjectsItem =
      ru === 'ПРОЕКТЫ' || en === 'PROJECTS' || uz === 'LOYIHALAR'

    if (!isProjectsItem) {
      return item
    }

    return {
      ...item,
      linkType: 'internal',
      internalPath: '/projects',
      externalUrl: undefined,
      anchorId: undefined,
      openInNewTab: false,
    }
  })

  await client.patch('site-navigation').set({ items }).commit()
  return true
}

async function main() {
  await client.createOrReplace(projectsPageSettings)

  for (const project of companyProjects) {
    await client.createOrReplace(project)
  }

  const navigationUpdated = await patchNavigationProjectsLink()

  console.log(
    JSON.stringify(
      {
        pageSettings: projectsPageSettings._id,
        projectCount: companyProjects.length,
        navigationUpdated,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
