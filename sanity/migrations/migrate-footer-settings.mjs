import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2025-01-01' })

const localized = (uz, ru, en) => ({ uz, ru, en })

const noLink = {
  linkType: 'none',
  openInNewTab: false,
}

const footerDocument = {
  _id: 'site-footer-settings',
  _type: 'footerSettings',
  title: 'Футер сайта',
  heading: localized("XABARDOR BO'LING", 'БУДЬТЕ В КУРСЕ', 'STAY INFORMED'),
  subtitle: localized(
    'Gastronomik yangiliklar, aksiyalar va foydali tavsiyalar',
    'Гастрономические новости, советы, акции и многое другое',
    'Gastronomic news, tips, promos, and more'
  ),
  languageLabel: localized('TIL', 'ЯЗЫК', 'LANGUAGE'),
  feedbackLabel: localized('QAYTA ALOQA', 'ОБРАТНАЯ СВЯЗЬ', 'FEEDBACK'),
  feedbackLink: { ...noLink },
  rightsText: localized(
    '© GOSHT Group. Barcha huquqlar himoyalangan',
    '© GOSHT Group. Все права защищены',
    '© GOSHT Group. All rights reserved'
  ),
  madeByLabel: localized('Реализовано Артуром', 'Реализовано Артуром', 'Реализовано Артуром'),
  madeByLink: { ...noLink },
  socialLinks: [
    { _key: 'social-telegram', label: 'Telegram', ...noLink },
    { _key: 'social-instagram', label: 'Instagram', ...noLink },
    { _key: 'social-facebook', label: 'Facebook', ...noLink },
  ],
}

async function main() {
  const result = await client.createOrReplace(footerDocument)
  console.log(
    JSON.stringify(
      {
        documentId: result._id,
        updatedAt: result._updatedAt,
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
