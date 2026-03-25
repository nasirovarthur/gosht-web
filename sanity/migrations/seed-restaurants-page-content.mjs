import { getCliClient } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '90iua6vo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = getCliClient({
  apiVersion: '2025-01-01',
  projectId,
  dataset,
})

const restaurantsPageSettings = {
  _id: 'restaurants-page-settings',
  _type: 'restaurantsPageSettings',
  eyebrow: {
    uz: 'RESTORANLAR TARMOg‘I',
    ru: 'СЕТЬ ПРОЕКТОВ',
    en: 'RESTAURANT NETWORK',
  },
  title: {
    uz: 'RESTORANLAR',
    ru: 'РЕСТОРАНЫ',
    en: 'RESTAURANTS',
  },
  intro: {
    uz: 'Loyihani tanlang, ro‘yxat va xarita o‘rtasida almashing va kerakli filialni darhol toping.',
    ru: 'Выбирайте проект, переключайтесь между списком и картой и сразу находите нужный филиал.',
    en: 'Choose a project, switch between list and map, and find the right branch right away.',
  },
}

async function main() {
  await client.createOrReplace(restaurantsPageSettings)

  console.log(
    JSON.stringify(
      {
        pageSettings: restaurantsPageSettings._id,
        seeded: true,
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
