import { getCliClient } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '90iua6vo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = getCliClient({
  apiVersion: '2025-01-01',
  projectId,
  dataset,
})

const aboutPageSettings = {
  _id: 'about-page-settings',
  _type: 'aboutPageSettings',
  title: 'Страница About',
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
    primaryCaption: {
      uz: 'Gōsht restorani ochilishi, 2017 yil',
      ru: 'Открытие ресторана Gōsht, 2017 год',
      en: 'Opening of Gōsht restaurant, 2017',
    },
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

async function main() {
  await client.createOrReplace(aboutPageSettings)

  console.log(
    JSON.stringify(
      {
        pageSettings: aboutPageSettings._id,
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
