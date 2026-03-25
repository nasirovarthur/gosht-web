import { getCliClient } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '90iua6vo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = getCliClient({
  apiVersion: '2026-03-25',
  projectId,
  dataset,
})

const TOPOR_PROJECT_ID = 'restaurant-topor-barbershop'

const toporProject = {
  _id: TOPOR_PROJECT_ID,
  _type: 'restaurant',
  projectType: 'barbershop',
  isActive: true,
  name: {
    uz: 'TOPOR BARBERSHOP',
    ru: 'TOPOR BARBERSHOP',
    en: 'TOPOR BARBERSHOP',
  },
  description: {
    uz: 'Topor barbershop premium servis, aniq geometriya va zamonaviy erkaklar parvarishi formatida ishlaydi.',
    ru: 'Topor barbershop работает в формате премиального сервиса, точной геометрии и современного мужского ухода.',
    en: 'Topor barbershop runs as a premium grooming concept focused on precision cuts and modern men\'s care.',
  },
  descriptionExtended: {
    uz: 'Bu test kontent bo\'lib, keyin real tavsif bilan almashtiriladi.',
    ru: 'Это тестовый контент, позже замените на фактическое описание бренда.',
    en: 'This is placeholder content and can be replaced with the final brand narrative.',
  },
  descriptionAdditional: {
    uz: 'Onlayn bron qilish, soch turmagi konsultatsiyasi va master tanlash imkoniyati mavjud.',
    ru: 'Доступны онлайн-запись, консультация по стилю и выбор мастера.',
    en: 'Online booking, style consultation, and master selection are available.',
  },
  lead: {
    title: {
      uz: 'BOSH BARBER',
      ru: 'ВЕДУЩИЙ БАРБЕР',
      en: 'LEAD BARBER',
    },
    name: {
      uz: 'Akmal Karimov',
      ru: 'Акмал Каримов',
      en: 'Akmal Karimov',
    },
    description: {
      uz: '10+ yil tajriba, klassik va zamonaviy uslublarda ixtisoslashgan.',
      ru: 'Опыт более 10 лет, специализация на классических и современных техниках.',
      en: '10+ years of experience, focused on both classic and modern techniques.',
    },
  },
}

const toporBranches = [
  {
    _id: 'restaurant-branch-topor-central',
    _type: 'restaurantBranch',
    projectType: 'barbershop',
    isActive: true,
    project: {
      _type: 'reference',
      _ref: TOPOR_PROJECT_ID,
    },
    branchName: {
      uz: 'TOPOR MARKAZIY',
      ru: 'TOPOR ЦЕНТР',
      en: 'TOPOR CENTRAL',
    },
    slug: { current: 'topor-central' },
    city: 'tashkent',
    address: {
      uz: 'Amir Temur ko\'chasi 88, Toshkent',
      ru: 'ул. Амира Темура, 88, Ташкент',
      en: '88 Amir Temur St, Tashkent',
    },
    phone: '+998900001122',
    workingHours: {
      uz: 'Har kuni 10:00 - 22:00',
      ru: 'Ежедневно 10:00 - 22:00',
      en: 'Daily 10:00 AM - 10:00 PM',
    },
    averageCheck: {
      uz: '150 000 - 450 000 so\'m',
      ru: '150 000 - 450 000 сум',
      en: '150,000 - 450,000 UZS',
    },
    yearOpened: '2024',
    map: {
      coordinates: '69.281163,41.311081',
      zoom: 15,
    },
    hasVipRoom: true,
    hasKidsHaircut: true,
    externalUrl: 'https://topor.example.com/book',
  },
  {
    _id: 'restaurant-branch-topor-riverside',
    _type: 'restaurantBranch',
    projectType: 'barbershop',
    isActive: true,
    project: {
      _type: 'reference',
      _ref: TOPOR_PROJECT_ID,
    },
    branchName: {
      uz: 'TOPOR RIVERSIDE',
      ru: 'TOPOR RIVERSIDE',
      en: 'TOPOR RIVERSIDE',
    },
    slug: { current: 'topor-riverside' },
    city: 'tashkent',
    address: {
      uz: 'Shahrisabz ko\'chasi 14, Toshkent',
      ru: 'ул. Шахрисабз, 14, Ташкент',
      en: '14 Shahrisabz St, Tashkent',
    },
    phone: '+998900003344',
    workingHours: {
      uz: 'Har kuni 11:00 - 23:00',
      ru: 'Ежедневно 11:00 - 23:00',
      en: 'Daily 11:00 AM - 11:00 PM',
    },
    averageCheck: {
      uz: '180 000 - 520 000 so\'m',
      ru: '180 000 - 520 000 сум',
      en: '180,000 - 520,000 UZS',
    },
    yearOpened: '2025',
    map: {
      coordinates: '69.300487,41.305793',
      zoom: 15,
    },
    hasVipRoom: true,
    hasKidsHaircut: true,
    externalUrl: 'https://topor.example.com/book',
  },
]

async function attachFallbackImage() {
  const firstImageAssetId = await client.fetch(`*[_type == "sanity.imageAsset"][0]._id`)
  if (!firstImageAssetId) return null

  toporProject.logo = {
    _type: 'image',
    asset: { _type: 'reference', _ref: firstImageAssetId },
  }

  for (const branch of toporBranches) {
    branch.cardImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: firstImageAssetId },
    }
  }

  return firstImageAssetId
}

async function main() {
  const fallbackImageAssetId = await attachFallbackImage()

  await client.createOrReplace(toporProject)

  for (const branch of toporBranches) {
    await client.createOrReplace(branch)
  }

  console.log(
    JSON.stringify(
      {
        seeded: true,
        projectId: TOPOR_PROJECT_ID,
        branchIds: toporBranches.map((branch) => branch._id),
        fallbackImageAssetId: fallbackImageAssetId || null,
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
