import { cache } from 'react'
import { client } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type ProjectsPageSettingsRaw = {
  title?: LocalizedOptional
  intro?: LocalizedOptional
  descriptionLabel?: LocalizedOptional
  galleryLabel?: LocalizedOptional
  contactsLabel?: LocalizedOptional
}

type CompanyProjectRaw = {
  _id: string
  order?: number
  slug?: string
  name?: LocalizedOptional
  descriptionTitle?: LocalizedOptional
  description?: LocalizedOptional
  logo?: string
  gallery?: string[]
  contacts?: Array<{
    _key?: string
    label?: LocalizedOptional
    value?: string
    href?: string
  }>
}

export type CompanyProjectItem = {
  id: string
  order: number
  slug: string
  name: Localized
  descriptionTitle: Localized
  description: Localized
  logo: string
  gallery: string[]
  contacts: Array<{
    id: string
    label: Localized
    value: string
    href: string
  }>
}

export type ProjectsPageData = {
  title: Localized
  intro: Localized
  descriptionLabel: Localized
  galleryLabel: Localized
  contactsLabel: Localized
  projects: CompanyProjectItem[]
}

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback: Localized = { uz: '', ru: '', en: '' }
): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

const fallbackPageData: Omit<ProjectsPageData, 'projects'> = {
  title: {
    uz: 'LOYIHALAR',
    ru: 'ПРОЕКТЫ',
    en: 'PROJECTS',
  },
  intro: {
    uz: 'Brendlar, formatlar va loyihalar bilan tanishing. Har bir loyiha bir sahifada ochiladi.',
    ru: 'Познакомьтесь с форматами и направлениями группы. Каждый проект раскрывается на этой же странице.',
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

const fallbackProjects: CompanyProjectItem[] = [
  'Gōsht Kids',
  'Gōsht Kids',
  'Lavka by Gōsht',
  'Gōsht Catering',
].map((name, index) => ({
  id: `fallback-project-${index + 1}`,
  order: index + 1,
  slug: `project-${index + 1}`,
  name: { uz: name, ru: name, en: name },
  descriptionTitle: {
    uz: 'Loyiha tavsifi',
    ru: 'Описание проекта',
    en: 'Project overview',
  },
  description: {
    uz: 'Kontent Sanity orqali to‘ldiriladi. Ushbu blok loyiha tavsifi uchun tayyor.',
    ru: 'Контент заполняется через Sanity. Этот блок уже готов для описания проекта.',
    en: 'Content is managed via Sanity. This section is ready for the project narrative.',
  },
  logo: '',
  gallery: [],
  contacts: [],
}))

const getProjectsPageSettings = cache(async (): Promise<ProjectsPageSettingsRaw | null> => {
  try {
    const query = `
      *[_type == "projectsPageSettings" && _id == $documentId][0]{
        title,
        intro,
        descriptionLabel,
        galleryLabel,
        contactsLabel
      }
    `

    return await client.fetch<ProjectsPageSettingsRaw | null>(query, {
      documentId: singletonDocumentIds.projectsPageSettings,
    })
  } catch (error) {
    console.error('Error fetching projects page settings:', error)
    return null
  }
})

const getCompanyProjects = cache(async (): Promise<CompanyProjectItem[]> => {
  try {
    const query = `
      *[_type == "companyProject" && isActive != false] | order(order asc, _createdAt asc) {
        _id,
        order,
        "slug": slug.current,
        name,
        descriptionTitle,
        description,
        "logo": logo.asset->url,
        "gallery": gallery[].asset->url,
        contacts[]{
          _key,
          label,
          value,
          href
        }
      }
    `

    const rawProjects = await client.fetch<CompanyProjectRaw[]>(query)

    if (rawProjects.length === 0) {
      return fallbackProjects
    }

    return rawProjects.map((project, index) => ({
      id: project._id,
      order: typeof project.order === 'number' ? project.order : index + 1,
      slug: project.slug || `company-project-${index + 1}`,
      name: normalizeLocalized(project.name, fallbackProjects[index]?.name || fallbackProjects[0].name),
      descriptionTitle: normalizeLocalized(
        project.descriptionTitle,
        fallbackPageData.descriptionLabel
      ),
      description: normalizeLocalized(project.description, fallbackProjects[index]?.description),
      logo: project.logo || '',
      gallery: project.gallery || [],
      contacts:
        project.contacts?.map((item, contactIndex) => ({
          id: item._key || `${project._id}-contact-${contactIndex}`,
          label: normalizeLocalized(item.label, {
            uz: 'Aloqa',
            ru: 'Контакт',
            en: 'Contact',
          }),
          value: item.value || '',
          href: item.href || '',
        })) || [],
    }))
  } catch (error) {
    console.error('Error fetching company projects:', error)
    return fallbackProjects
  }
})

export const getProjectsPageData = cache(async (): Promise<ProjectsPageData> => {
  const [settings, projects] = await Promise.all([
    getProjectsPageSettings(),
    getCompanyProjects(),
  ])

  return {
    title: normalizeLocalized(settings?.title, fallbackPageData.title),
    intro: normalizeLocalized(settings?.intro, fallbackPageData.intro),
    descriptionLabel: normalizeLocalized(
      settings?.descriptionLabel,
      fallbackPageData.descriptionLabel
    ),
    galleryLabel: normalizeLocalized(settings?.galleryLabel, fallbackPageData.galleryLabel),
    contactsLabel: normalizeLocalized(
      settings?.contactsLabel,
      fallbackPageData.contactsLabel
    ),
    projects,
  }
})
