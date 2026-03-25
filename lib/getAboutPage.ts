import { cache } from 'react'
import { client } from '@/lib/sanity'
import { singletonDocumentIds } from '@/sanity/singletons'
import type { Localized, LocalizedOptional } from '@/types/i18n'

type AboutPageSectionHeroRaw = {
  title?: LocalizedOptional
  bodyFirst?: LocalizedOptional
  bodySecond?: LocalizedOptional
  accentTitle?: LocalizedOptional
  primaryImage?: string
  primaryCaption?: LocalizedOptional
  secondaryImage?: string
}

type AboutPageSectionFounderRaw = {
  leadFirst?: LocalizedOptional
  leadSecond?: LocalizedOptional
  aside?: LocalizedOptional
  name?: LocalizedOptional
  role?: LocalizedOptional
  image?: string
  caption?: LocalizedOptional
}

type AboutPageSectionBrandsRaw = {
  title?: LocalizedOptional
  body?: LocalizedOptional
  includeCompanyProjects?: boolean
  includeRestaurantProjects?: boolean
}

type AboutPageSectionSystemRaw = {
  image?: string
  caption?: LocalizedOptional
  title?: LocalizedOptional
  body?: LocalizedOptional
}

type AboutPageSettingsRaw = {
  heroSection?: AboutPageSectionHeroRaw
  founderSection?: AboutPageSectionFounderRaw
  brandsSection?: AboutPageSectionBrandsRaw
  systemSection?: AboutPageSectionSystemRaw
}

export type AboutPageData = {
  heroSection: {
    title: Localized
    bodyFirst: Localized
    bodySecond: Localized
    accentTitle: Localized
    primaryImage: string
    primaryCaption: Localized
    secondaryImage: string
  }
  founderSection: {
    leadFirst: Localized
    leadSecond: Localized
    aside: Localized
    name: Localized
    role: Localized
    image: string
    caption: Localized
  }
  brandsSection: {
    title: Localized
    body: Localized
    includeCompanyProjects: boolean
    includeRestaurantProjects: boolean
  }
  systemSection: {
    image: string
    caption: Localized
    title: Localized
    body: Localized
  }
}

const emptyLocalized: Localized = {
  uz: '',
  ru: '',
  en: '',
}

export const aboutPageFallback: AboutPageData = {
  heroSection: {
    title: {
      uz: [
        'GŌSHT GROUP TARIXI BOSHLANDI',
        '2017 YILDA GŌSHT LOYIHASI BILAN, U GO‘SHT MADANIYATI',
        'OCHIQ OLAV VA KUCHLI RESTORAN MUHITI ATROFIDA QURILGAN.',
      ].join('\n'),
      ru: [
        'ИСТОРИЯ GŌSHT GROUP НАЧАЛАСЬ',
        'В 2017 ГОДУ С ПРОЕКТА GŌSHT, ПОСТРОЕННЫЙ ВОКРУГ КУЛЬТУРЫ',
        'МЯСА, ОТКРЫТОГО ОГНЯ И СИЛЬНОЙ РЕСТОРАННОЙ АТМОСФЕРЫ.',
      ].join('\n'),
      en: [
        'THE STORY OF GŌSHT GROUP BEGAN',
        'IN 2017 WITH THE GŌSHT PROJECT, BUILT AROUND MEAT CULTURE,',
        'OPEN FIRE, AND A DISTINCT RESTAURANT ATMOSPHERE.',
      ].join('\n'),
    },
    bodyFirst: {
      uz: 'Bugun Gōsht Group zamonaviy restoran xoldingi sifatida rivojlanmoqda: o‘z xarakteri, vizual tili va kuchli mahalliy identiteti bilan.',
      ru: 'Сегодня Gōsht Group развивается как современный ресторанный холдинг со своим характером, визуальным языком и сильной локальной идентичностью.',
      en: 'Today, Gōsht Group is growing as a modern restaurant holding with its own character, visual language, and strong local identity.',
    },
    bodySecond: {
      uz: 'Biz shunchaki restoranlar yaratmaymiz. Oshxona, olov, servis va atmosfera atrofida mustaqil brendlar hamda madaniy makonlar quramiz.',
      ru: 'Мы создаем не просто рестораны, а самостоятельные бренды и культурные пространства вокруг кухни, огня, сервиса и атмосферы.',
      en: 'We do not just open restaurants. We build independent brands and cultural spaces around cuisine, fire, service, and atmosphere.',
    },
    accentTitle: {
      uz: ['YAGONA SIFAT STANDARTI,', 'TURFA FORMATLAR VA', 'XARAKTERLAR'].join('\n'),
      ru: ['ЕДИНЫЙ СТАНДАРТ КАЧЕСТВА,', 'РАЗНЫЕ ФОРМАТЫ И', 'ХАРАКТЕРЫ'].join('\n'),
      en: ['ONE QUALITY STANDARD,', 'DIFFERENT FORMATS AND', 'CHARACTERS'].join('\n'),
    },
    primaryImage:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    primaryCaption: {
      uz: 'Gōsht restorani ochilishi, 2017 yil',
      ru: 'Открытие ресторана Gōsht, 2017 год',
      en: 'Opening of Gōsht restaurant, 2017',
    },
    secondaryImage:
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
  },
  founderSection: {
    leadFirst: {
      uz: 'Abdurashid Iminov Gōsht Group’ni sifat, intizom, servis va aniq pozitsionirovka orqali birlashgan mustaqil brendlar ekotizimi sifatida shakllantirdi.',
      ru: 'Абдурашид Иминов сформировал Gōsht Group как экосистему независимых брендов, объединённых качеством, дисциплиной сервиса и точным позиционированием.',
      en: 'Abdurashid Iminov shaped Gōsht Group as an ecosystem of independent brands united by quality, service discipline, and precise positioning.',
    },
    leadSecond: {
      uz: 'Xolding food, retail va hospitality yo‘nalishlarida rivojlanib, ko‘lam, tanilish va har bir loyiha individual xarakteri o‘rtasida muvozanatni saqlaydi.',
      ru: 'Холдинг развивается в направлениях food, retail и hospitality, удерживая баланс между масштабом, узнаваемостью и индивидуальностью каждого проекта.',
      en: 'The holding grows across food, retail, and hospitality while balancing scale, recognition, and the individuality of each concept.',
    },
    aside: {
      uz: 'Har bir loyiha alohida hikoya sifatida quriladi, ammo umumiy ta’m, atmosfera va servis arxitekturasi ichida ishlaydi.',
      ru: 'Каждый проект строится как отдельная история, но внутри одной архитектуры вкуса, атмосферы и сервиса.',
      en: 'Every project is built as a standalone story, yet all of them live inside one architecture of taste, atmosphere, and service.',
    },
    name: {
      uz: 'ABDURASHID IMINOV',
      ru: 'АБДУРАШИД ИМИНОВ',
      en: 'ABDURASHID IMINOV',
    },
    role: {
      uz: 'GŌSHT GROUP ASOSCHISI',
      ru: 'ОСНОВАТЕЛЬ GŌSHT GROUP',
      en: 'FOUNDER OF GŌSHT GROUP',
    },
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80',
    caption: {
      uz: 'Gōsht NYC restorani ochilishi, 2022 yil',
      ru: 'Открытие ресторана Gōsht NYC, 2022 год',
      en: 'Opening of Gōsht NYC restaurant, 2022',
    },
  },
  brandsSection: {
    title: {
      uz: ['GURUH ICHIDAGI BRENDLAR RO‘YXAT', 'SIFATIDA EMAS, TIZIM SIFATIDA ISHLAYDI.'].join('\n'),
      ru: ['БРЕНДЫ ВНУТРИ ГРУППЫ РАБОТАЮТ', 'НЕ КАК СПИСОК, А КАК СИСТЕМА.'].join('\n'),
      en: ['BRANDS INSIDE THE GROUP WORK', 'NOT AS A LIST, BUT AS A SYSTEM.'].join('\n'),
    },
    body: {
      uz: 'Shuning uchun bu yerda nafaqat logotiplar, balki har bir loyiha xolding ichida o‘z o‘rnini qanday egallashi ham muhim.',
      ru: 'Поэтому здесь важны не только логотипы, но и то, как каждый проект занимает собственное место внутри холдинга.',
      en: 'That is why the logos matter here, but even more important is how each project occupies its own place inside the holding.',
    },
    includeCompanyProjects: true,
    includeRestaurantProjects: true,
  },
  systemSection: {
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
    caption: {
      uz: 'Gōsht NYC restorani ochilishi, 2022 yil',
      ru: 'Открытие ресторана Gōsht NYC, 2022 год',
      en: 'Opening of Gōsht NYC restaurant, 2022',
    },
    title: {
      uz: [
        'GŌSHT GROUP BREND',
        'SISTEMA SIFATIDA O‘SADI,',
        'UNGACHA ODAT BO‘YICHA EMAS,',
        'HISSIYOT BO‘YICHA QAYTISHADI.',
      ].join('\n'),
      ru: [
        'GŌSHT GROUP РАСТЕТ КАК',
        'БРЕНДОВАЯ СИСТЕМА, В КОТОРУЮ',
        'ВОЗВРАЩАЮТСЯ НЕ ПО ПРИВЫЧКЕ,',
        'А ПО ОЩУЩЕНИЮ.',
      ].join('\n'),
      en: [
        'GŌSHT GROUP GROWS AS A',
        'BRAND SYSTEM PEOPLE RETURN TO',
        'NOT BY HABIT, BUT BY FEELING.',
      ].join('\n'),
    },
    body: {
      uz: 'Bu xolding aniq falsafa, kuchli vizual madaniyat va mehmonning brend bilan har bir kontaktiga e’tibor asosida qurilgan.',
      ru: 'Это холдинг с четкой философией, сильной визуальной культурой и вниманием к каждому контакту гостя с брендом.',
      en: 'This is a holding built on a clear philosophy, a strong visual culture, and attention to every contact between the guest and the brand.',
    },
  },
}

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback: Localized = emptyLocalized
): Localized {
  return {
    uz: value?.uz || fallback.uz,
    ru: value?.ru || value?.uz || fallback.ru,
    en: value?.en || value?.uz || fallback.en,
  }
}

const getAboutPageSettingsDocument = cache(async (): Promise<AboutPageSettingsRaw | null> => {
  try {
    const query = `
      *[_type == "aboutPageSettings" && _id == $documentId][0]{
        "heroSection": heroSection{
          title,
          bodyFirst,
          bodySecond,
          accentTitle,
          "primaryImage": primaryImage.asset->url,
          primaryCaption,
          "secondaryImage": secondaryImage.asset->url
        },
        "founderSection": founderSection{
          leadFirst,
          leadSecond,
          aside,
          name,
          role,
          "image": image.asset->url,
          caption
        },
        "brandsSection": brandsSection{
          title,
          body,
          includeCompanyProjects,
          includeRestaurantProjects
        },
        "systemSection": systemSection{
          "image": image.asset->url,
          caption,
          title,
          body
        }
      }
    `

    return await client.fetch<AboutPageSettingsRaw | null>(query, {
      documentId: singletonDocumentIds.aboutPageSettings,
    })
  } catch (error) {
    console.error('Error fetching about page settings:', error)
    return null
  }
})

export const getAboutPageData = cache(async (): Promise<AboutPageData> => {
  const settings = await getAboutPageSettingsDocument()

  return {
    heroSection: {
      title: normalizeLocalized(settings?.heroSection?.title, aboutPageFallback.heroSection.title),
      bodyFirst: normalizeLocalized(
        settings?.heroSection?.bodyFirst,
        aboutPageFallback.heroSection.bodyFirst
      ),
      bodySecond: normalizeLocalized(
        settings?.heroSection?.bodySecond,
        aboutPageFallback.heroSection.bodySecond
      ),
      accentTitle: normalizeLocalized(
        settings?.heroSection?.accentTitle,
        aboutPageFallback.heroSection.accentTitle
      ),
      primaryImage:
        settings?.heroSection?.primaryImage || aboutPageFallback.heroSection.primaryImage,
      primaryCaption: normalizeLocalized(
        settings?.heroSection?.primaryCaption,
        aboutPageFallback.heroSection.primaryCaption
      ),
      secondaryImage:
        settings?.heroSection?.secondaryImage || aboutPageFallback.heroSection.secondaryImage,
    },
    founderSection: {
      leadFirst: normalizeLocalized(
        settings?.founderSection?.leadFirst,
        aboutPageFallback.founderSection.leadFirst
      ),
      leadSecond: normalizeLocalized(
        settings?.founderSection?.leadSecond,
        aboutPageFallback.founderSection.leadSecond
      ),
      aside: normalizeLocalized(
        settings?.founderSection?.aside,
        aboutPageFallback.founderSection.aside
      ),
      name: normalizeLocalized(settings?.founderSection?.name, aboutPageFallback.founderSection.name),
      role: normalizeLocalized(settings?.founderSection?.role, aboutPageFallback.founderSection.role),
      image: settings?.founderSection?.image || aboutPageFallback.founderSection.image,
      caption: normalizeLocalized(
        settings?.founderSection?.caption,
        aboutPageFallback.founderSection.caption
      ),
    },
    brandsSection: {
      title: normalizeLocalized(
        settings?.brandsSection?.title,
        aboutPageFallback.brandsSection.title
      ),
      body: normalizeLocalized(settings?.brandsSection?.body, aboutPageFallback.brandsSection.body),
      includeCompanyProjects:
        settings?.brandsSection?.includeCompanyProjects ??
        aboutPageFallback.brandsSection.includeCompanyProjects,
      includeRestaurantProjects:
        settings?.brandsSection?.includeRestaurantProjects ??
        aboutPageFallback.brandsSection.includeRestaurantProjects,
    },
    systemSection: {
      image: settings?.systemSection?.image || aboutPageFallback.systemSection.image,
      caption: normalizeLocalized(
        settings?.systemSection?.caption,
        aboutPageFallback.systemSection.caption
      ),
      title: normalizeLocalized(
        settings?.systemSection?.title,
        aboutPageFallback.systemSection.title
      ),
      body: normalizeLocalized(settings?.systemSection?.body, aboutPageFallback.systemSection.body),
    },
  }
})
