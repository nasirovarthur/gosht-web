import { getCliClient } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '90iua6vo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = getCliClient({
  apiVersion: '2025-01-01',
  projectId,
  dataset,
})

const partnersPageSettings = {
  _id: 'partners-page-settings',
  _type: 'partnersPageSettings',
  title: {
    uz: 'HAMKORLAR GŌSHT GROUP',
    ru: 'ПАРТНЁРЫ GŌSHT GROUP',
    en: 'GŌSHT GROUP PARTNERS',
  },
  partners: [
    {
      _key: 'exeed',
      companyName: 'EXEED',
      website: 'https://exeed.ru/',
    },
    {
      _key: 'world-class',
      companyName: 'WORLD CLASS',
      website: 'https://special.worldclass.ru/',
    },
    {
      _key: 'medical-center',
      companyName: 'ЛЕЧЕБНЫЙ ЦЕНТР',
      website: 'https://www.lcenter.ru/',
    },
    {
      _key: 'simple-wine',
      companyName: 'SIMPLE WINE',
      website: 'https://simplewine.ru',
    },
    {
      _key: 'mir-supreme',
      companyName: 'MIR SUPREME',
      website: 'https://vamprivet.ru/supreme/',
    },
  ],
}

async function main() {
  await client.createOrReplace(partnersPageSettings)

  console.log(
    JSON.stringify(
      {
        pageSettings: partnersPageSettings._id,
        partnerCount: partnersPageSettings.partners.length,
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
