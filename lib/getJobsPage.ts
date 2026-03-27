import { cache } from 'react'
import { client } from '@/lib/sanity'
import { jobsPageFallbackData } from '@/lib/jobsData'
import type { JobsPageData, ProfessionItem, VacancyItem } from '@/lib/jobsData'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type LocalizedListItemRaw = {
  uz?: string
  ru?: string
  en?: string
}

type JobsPageSettingsRaw = {
  title?: LocalizedOptional
  intro?: LocalizedOptional
  roleLabel?: LocalizedOptional
  vacanciesLabel?: LocalizedOptional
  applyLabel?: LocalizedOptional
  salaryLabel?: LocalizedOptional
  experienceLabel?: LocalizedOptional
  scheduleLabel?: LocalizedOptional
  responsibilitiesLabel?: LocalizedOptional
  requirementsLabel?: LocalizedOptional
  conditionsLabel?: LocalizedOptional
  contactsLabel?: LocalizedOptional
  emptyState?: LocalizedOptional
}

type ProfessionRaw = {
  _id: string
  title?: LocalizedOptional
}

type VacancyRaw = {
  _id: string
  professionId?: string
  restaurantRefId?: string
  restaurantName?: LocalizedOptional
  restaurantSummary?: LocalizedOptional
  salary?: LocalizedOptional
  experience?: LocalizedOptional
  schedule?: LocalizedOptional
  responsibilities?: LocalizedListItemRaw[]
  requirements?: LocalizedListItemRaw[]
  conditions?: LocalizedListItemRaw[]
  contactPhone?: string
  contactEmail?: string
}

const EMPTY_LOCALIZED: Localized = { uz: '', ru: '', en: '' }

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback: Localized = EMPTY_LOCALIZED
): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

function normalizeLocalizedList(
  list: LocalizedListItemRaw[] | undefined,
  fallback: Localized[]
): Localized[] {
  const mapped =
    list
      ?.map((item) => normalizeLocalized(item))
      .filter((item) => item.uz || item.ru || item.en) || []

  return mapped.length > 0 ? mapped : fallback
}

const getJobsSettingsDocument = cache(async (): Promise<JobsPageSettingsRaw | null> => {
  try {
    return await client.fetch<JobsPageSettingsRaw | null>(
      `
        *[_type == "jobsPageSettings"]
        | order(_updatedAt desc, _createdAt desc)[0]{
          title,
          intro,
          roleLabel,
          vacanciesLabel,
          applyLabel,
          salaryLabel,
          experienceLabel,
          scheduleLabel,
          responsibilitiesLabel,
          requirementsLabel,
          conditionsLabel,
          contactsLabel,
          emptyState
        }
      `
    )
  } catch (error) {
    console.error('Error fetching jobs page settings:', error)
    return null
  }
})

const getProfessions = cache(async (): Promise<ProfessionRaw[]> => {
  try {
    return await client.fetch<ProfessionRaw[]>(
      `
        *[_type == "jobProfession" && isActive != false]
        | order(order asc, _createdAt asc){
          _id,
          title
        }
      `
    )
  } catch (error) {
    console.error('Error fetching job professions:', error)
    return []
  }
})

const getVacancies = cache(async (): Promise<VacancyRaw[]> => {
  try {
    return await client.fetch<VacancyRaw[]>(
      `
        *[_type == "jobVacancy" && isActive != false && defined(professionRef->_id)]
        | order(order asc, _createdAt asc){
          _id,
          "professionId": professionRef->_id,
          "restaurantRefId": restaurantRef->_id,
          "restaurantName": coalesce(restaurantRef->name, restaurantName),
          "restaurantSummary": coalesce(restaurantRef->detailPrimaryInfo, restaurantSummary),
          salary,
          experience,
          schedule,
          "responsibilities": responsibilities[]{uz,ru,en},
          "requirements": requirements[]{uz,ru,en},
          "conditions": conditions[]{uz,ru,en},
          contactPhone,
          contactEmail
        }
      `
    )
  } catch (error) {
    console.error('Error fetching job vacancies:', error)
    return []
  }
})

export const getJobsPageData = cache(async (): Promise<JobsPageData> => {
  const [settings, professionDocs, vacancyDocs] = await Promise.all([
    getJobsSettingsDocument(),
    getProfessions(),
    getVacancies(),
  ])

  if (!settings && professionDocs.length === 0 && vacancyDocs.length === 0) {
    return jobsPageFallbackData
  }

  const professions: ProfessionItem[] = professionDocs.map((professionDoc, professionIndex) => {
    const fallbackProfession =
      jobsPageFallbackData.professions[professionIndex % jobsPageFallbackData.professions.length]

    const vacancies: VacancyItem[] = vacancyDocs
      .filter((vacancyDoc) => vacancyDoc.professionId === professionDoc._id)
      .map((vacancyDoc, vacancyIndex) => {
        const fallbackVacancy =
          fallbackProfession?.vacancies[vacancyIndex] ||
          jobsPageFallbackData.vacancies[
            (professionIndex + vacancyIndex) % jobsPageFallbackData.vacancies.length
          ]

        const hasRestaurantRef = Boolean(vacancyDoc.restaurantRefId)

        return {
          id: vacancyDoc._id,
          role: professionDoc._id,
          restaurantName: normalizeLocalized(
            vacancyDoc.restaurantName,
            fallbackVacancy.restaurantName
          ),
          restaurantSummary: normalizeLocalized(
            hasRestaurantRef ? vacancyDoc.restaurantSummary : undefined,
            fallbackVacancy.restaurantSummary
          ),
          location: fallbackVacancy.location,
          salary: normalizeLocalized(vacancyDoc.salary, fallbackVacancy.salary),
          experience: normalizeLocalized(vacancyDoc.experience, fallbackVacancy.experience),
          schedule: normalizeLocalized(vacancyDoc.schedule, fallbackVacancy.schedule),
          responsibilities: normalizeLocalizedList(
            vacancyDoc.responsibilities,
            fallbackVacancy.responsibilities
          ),
          requirements: normalizeLocalizedList(
            vacancyDoc.requirements,
            fallbackVacancy.requirements
          ),
          conditions: normalizeLocalizedList(
            vacancyDoc.conditions,
            fallbackVacancy.conditions
          ),
          contactPhone: vacancyDoc.contactPhone || fallbackVacancy.contactPhone,
          contactEmail: vacancyDoc.contactEmail || fallbackVacancy.contactEmail,
        }
      })

    return {
      id: professionDoc._id,
      label: normalizeLocalized(professionDoc.title, fallbackProfession?.label),
      vacancies,
    }
  })

  const roleOptions = professions.map((profession) => ({
    value: profession.id,
    label: profession.label,
  }))

  return {
    title: normalizeLocalized(settings?.title, jobsPageFallbackData.title),
    intro: normalizeLocalized(settings?.intro, jobsPageFallbackData.intro),
    roleLabel: normalizeLocalized(settings?.roleLabel, jobsPageFallbackData.roleLabel),
    vacanciesLabel: normalizeLocalized(
      settings?.vacanciesLabel,
      jobsPageFallbackData.vacanciesLabel
    ),
    detailsLabel: jobsPageFallbackData.detailsLabel,
    applyLabel: normalizeLocalized(settings?.applyLabel, jobsPageFallbackData.applyLabel),
    roleOptions,
    salaryLabel: normalizeLocalized(settings?.salaryLabel, jobsPageFallbackData.salaryLabel),
    experienceLabel: normalizeLocalized(
      settings?.experienceLabel,
      jobsPageFallbackData.experienceLabel
    ),
    scheduleLabel: normalizeLocalized(
      settings?.scheduleLabel,
      jobsPageFallbackData.scheduleLabel
    ),
    responsibilitiesLabel: normalizeLocalized(
      settings?.responsibilitiesLabel,
      jobsPageFallbackData.responsibilitiesLabel
    ),
    requirementsLabel: normalizeLocalized(
      settings?.requirementsLabel,
      jobsPageFallbackData.requirementsLabel
    ),
    conditionsLabel: normalizeLocalized(
      settings?.conditionsLabel,
      jobsPageFallbackData.conditionsLabel
    ),
    contactsLabel: normalizeLocalized(
      settings?.contactsLabel,
      jobsPageFallbackData.contactsLabel
    ),
    emptyState: normalizeLocalized(settings?.emptyState, jobsPageFallbackData.emptyState),
    professions,
    vacancies: professions.flatMap((profession) => profession.vacancies),
  }
})
