import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'

const envPath = path.join(process.cwd(), '.env.local')

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue

    let [, key, value] = match
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-02-19',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const DRAFT_ONLY = process.env.SANITY_DRAFT_ONLY !== 'false'

const localized = (ru, en = ru, uz = ru) => ({ ru, en, uz })

const stableDraftId = (id) => (id.startsWith('drafts.') ? id : `drafts.${id}`)

const sanitize = (doc) => {
  if (!doc) return null
  const cloned = { ...doc }
  delete cloned._rev
  delete cloned._updatedAt
  delete cloned._createdAt
  return cloned
}

async function loadDocuments(ids) {
  const docs = await client.getDocuments(ids)
  return Object.fromEntries(docs.filter(Boolean).map((doc) => [doc._id, doc]))
}

function withTargetId(doc, id) {
  const base = sanitize(doc)
  if (!base) throw new Error(`Missing document ${id}`)
  return {
    ...base,
    _id: DRAFT_ONLY ? stableDraftId(id) : id,
  }
}

async function main() {
  const existingIds = [
    '89f6fa52-ddb6-497c-964e-0105c5bb9ceb',
    '18578762-44e5-4679-87a5-7f17bdf19228',
    '29840ac1-31ad-466a-9371-005b84bff737',
    '0237ac37-a266-46ea-8464-81533a2369f8',
    '34865e95-ffe4-448d-82ca-cd59d1bcce05',
    '022a0b4a-df1f-49c2-94d5-a320bc083e65',
    '64dab2d6-effc-42ff-ad20-06fdbd8a1e96',
    '2cfdb534-2ebb-4ddb-ac01-1fa4b38ed7c2',
    '81f7fe8f-92c7-40ba-9590-b49e04abab88',
    'company-project-gosht-catering',
    'company-project-gosht-kids-01',
  ]

  const byId = await loadDocuments(existingIds)
  const tx = client.transaction()

  const updateExisting = (id, updates) => {
    const draft = withTargetId(byId[id], id)
    tx.createOrReplace({
      ...draft,
      ...updates,
    })
  }

  updateExisting('29840ac1-31ad-466a-9371-005b84bff737', {
    description: localized(
      'Mahalla by Gōsht — fast food проект Gōsht Group, где быстрый городской ритм сочетается с уютной домашней атмосферой.'
    ),
    descriptionExtended: localized(
      'Формат строится вокруг бургеров, роллов, хот-догов и снеков. Бургеры готовятся на углях в Josper-печи, а меню сочетает понятные позиции и локальные вкусовые акценты.'
    ),
    descriptionAdditional: localized(
      'Проект рассчитан на быстрый casual-визит, формат take away и доставку. Это понятная, доступная и динамичная гастрономия внутри экосистемы Gōsht Group.'
    ),
  })

  updateExisting('0237ac37-a266-46ea-8464-81533a2369f8', {
    detailPrimaryInfo: localized('Донеры, лаваши, хот-доги'),
    description: localized(
      'GŌSHT DONER — fast food проект внутри Gōsht Group, построенный вокруг донеров, дурумов и фирменного лаваша.'
    ),
    descriptionExtended: localized(
      'Мясо готовится на углях, а меню собрано из донеров, лавашей, хот-догов, снеков и быстрых напитков. Формат делает ставку на понятный вкус, скорость и мясной характер бренда.'
    ),
    descriptionAdditional: localized(
      'Это городской формат для быстрого и сытного перекуса, рассчитанный на активный ритм, take away и доставку.'
    ),
  })

  updateExisting('34865e95-ffe4-448d-82ca-cd59d1bcce05', {
    detailPrimaryInfo: localized('Бургеры, хот-доги, fast casual'),
    description: localized(
      'BLACK STAR BURGER — городской fast casual формат с акцентом на фирменные бургеры, хот-доги, картофель фри и доставку.'
    ),
    descriptionExtended: localized(
      'Проект работает как понятная бургерная для быстрого визита, take away и food court формата. Основу меню составляют сочные бургеры, снеки и напитки.'
    ),
    descriptionAdditional: localized(
      'По открытым городским каталогам это один из заметных бургерных брендов Ташкента с фокусом на доступный и понятный street food формат.'
    ),
  })

  updateExisting('022a0b4a-df1f-49c2-94d5-a320bc083e65', {
    workingHours: localized('Пн - Сб: 8:00 - 23:00 | Вс: 10:00 - 23:00'),
  })

  updateExisting('64dab2d6-effc-42ff-ad20-06fdbd8a1e96', {
    address: localized('Шахрисабзкий проезд, 5А'),
    workingHours: localized('Пн - Сб: 8:00 - 03:00 | Вс: 10:00 - 03:00'),
  })

  updateExisting('2cfdb534-2ebb-4ddb-ac01-1fa4b38ed7c2', {
    address: localized('улица Укчи, 3'),
    workingHours: localized('Пн - Сб: 8:00 - 00:00 | Вс: 10:00 - 00:00'),
  })

  updateExisting('81f7fe8f-92c7-40ba-9590-b49e04abab88', {
    address: localized('Мирабад, 21/2'),
    phone: '+998971318800',
    workingHours: localized('Каждый день с 10:00 до 21:00'),
    map: { coordinates: '69.268596,41.297648', zoom: 15 },
    hasVipRoom: true,
    hasKidsHaircut: true,
  })

  const targetId = (id) => (DRAFT_ONLY ? stableDraftId(id) : id)

  const newDocs = [
    {
      _id: targetId('restaurant-branch-gosht-barocco'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '89f6fa52-ddb6-497c-964e-0105c5bb9ceb' },
      branchName: localized('GŌSHT BAROCCO'),
      slug: { _type: 'slug', current: 'gosht-barocco' },
      city: 'tashkent',
      address: localized('Ниезбек Йули, 29/5'),
      phone: '+998777038800',
      workingHours: localized('Пн - Сб: 8:00 - 00:00 | Вс: 10:00 - 00:00'),
      averageCheck: localized('200 000 - 300 000 сум'),
      map: { zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
    {
      _id: targetId('restaurant-branch-mahalla-riviera'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '29840ac1-31ad-466a-9371-005b84bff737' },
      branchName: localized('Mahalla by Gōsht Riviera'),
      slug: { _type: 'slug', current: 'mahalla-riviera' },
      city: 'tashkent',
      address: localized('ТРЦ Riviera Mall, Нодиры, 4, 3 этаж'),
      workingHours: localized('Ежедневно с 10:00 до 23:00'),
      averageCheck: localized('50 000 сум'),
      map: { coordinates: '69.254846,41.339764', zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
    {
      _id: targetId('restaurant-branch-mahalla-islam-karimov'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '29840ac1-31ad-466a-9371-005b84bff737' },
      branchName: localized('Mahalla by Gōsht Ислама Каримова'),
      slug: { _type: 'slug', current: 'mahalla-islam-karimova' },
      city: 'tashkent',
      address: localized('Улица Ислама Каримова, 6/1'),
      workingHours: localized('Ежедневно с 10:00 до 02:00'),
      averageCheck: localized('50 000 сум'),
      map: { coordinates: '69.27357,41.309318', zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
    {
      _id: targetId('restaurant-branch-mahalla-index'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '29840ac1-31ad-466a-9371-005b84bff737' },
      branchName: localized('Mahalla by Gōsht INDEX'),
      slug: { _type: 'slug', current: 'mahalla-index' },
      city: 'tashkent',
      address: localized('Бизнес-парк INDEX'),
      workingHours: localized('Ежедневно с 10:00 до 22:00'),
      averageCheck: localized('50 000 сум'),
      map: { coordinates: '69.232847,41.20177', zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
    {
      _id: targetId('restaurant-branch-gosht-doner-ipak-yuli'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '0237ac37-a266-46ea-8464-81533a2369f8' },
      branchName: localized('GŌSHT DONER Ipak Yuli'),
      slug: { _type: 'slug', current: 'gosht-doner-ipak-yuli' },
      city: 'tashkent',
      address: localized('Буюк Ипак Йули, 123'),
      workingHours: localized('Ежедневно с 10:00 до 02:00'),
      averageCheck: localized('65 000 сум'),
      map: { coordinates: '69.337508,41.327588', zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
    {
      _id: targetId('restaurant-branch-black-star-riviera'),
      _type: 'restaurantBranch',
      projectType: 'restaurant',
      project: { _type: 'reference', _ref: '34865e95-ffe4-448d-82ca-cd59d1bcce05' },
      branchName: localized('BLACK STAR BURGER Riviera'),
      slug: { _type: 'slug', current: 'black-star-riviera' },
      city: 'tashkent',
      address: localized('ТРЦ Riviera Mall, Нодиры, 4, 3 этаж'),
      workingHours: localized('Ежедневно с 10:00 до 22:00'),
      averageCheck: localized('101 000 сум'),
      map: { coordinates: '69.254732,41.3398', zoom: 15 },
      isActive: false,
      hasBanquet: false,
      hasPlayground: false,
    },
  ]

  for (const doc of newDocs) {
    tx.createOrReplace(doc)
  }

  updateExisting('company-project-gosht-catering', {
    descriptionTitle: localized('О проекте'),
    description: localized(
      'Gōsht Catering — кейтеринговое направление Gōsht Group для частных и корпоративных мероприятий. Формат охватывает банкетную подачу, фуршеты и выездные гастрономические сценарии под задачи события.'
    ),
  })

  updateExisting('company-project-gosht-kids-01', {
    descriptionTitle: localized('О проекте'),
    description: localized(
      'Gōsht Kids — интерактивное детское направление в экосистеме Gōsht, где дети получают отдельный сценарий отдыха: мероприятия, игры, анимацию и детское меню.'
    ),
    contacts: [
      {
        _key: 'kids-contact-phone',
        label: localized('Контакты'),
        value: '+998971308800',
        href: 'tel:+998971308800',
      },
    ],
  })

  const result = await tx.commit({ autoGenerateArrayKeys: true })
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: DRAFT_ONLY ? 'drafts' : 'published',
        mutations: result.results.length,
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
