import { getCliClient } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '90iua6vo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = getCliClient({
  apiVersion: '2025-01-01',
  projectId,
  dataset,
})

const feedbackSettings = {
  _id: 'feedback-settings',
  _type: 'feedbackSettings',
  title: 'Настройки формы обратной связи',
  drawerTitle: {
    uz: 'QAYTA ALOQA',
    ru: 'ОБРАТНАЯ СВЯЗЬ',
    en: 'FEEDBACK',
  },
  subtitle: {
    uz: 'Savolingiz yoki taklifingizni yuboring, tez orada javob beramiz.',
    ru: 'Оставьте вопрос или пожелание, мы свяжемся с вами в ближайшее время.',
    en: 'Leave your question or request and we will get back to you shortly.',
  },
  consentLabel: {
    uz: 'Согласен(а) на обработку персональных данных',
    ru: 'Согласен(а) на обработку персональных данных',
    en: 'I agree to personal data processing',
  },
  successTitle: {
    uz: 'ЗАЯВКА ОТПРАВЛЕНА',
    ru: 'ЗАЯВКА ОТПРАВЛЕНА',
    en: 'REQUEST SENT',
  },
  successDescription: {
    uz: 'Ваша заявка направлена директору ресторана, менеджеру по сервису Gōsht Group и в центральный офис группы компаний.',
    ru: 'Ваша заявка направлена директору ресторана, менеджеру по сервису Gōsht Group и в центральный офис группы компаний.',
    en: 'Your request has been sent to the restaurant director, the Gōsht Group service manager, and the central office of the group.',
  },
  errorLabel: {
    uz: 'Не удалось отправить. Проверьте поля и попробуйте снова.',
    ru: 'Не удалось отправить. Проверьте поля и попробуйте снова.',
    en: 'Failed to send. Please check the fields and try again.',
  },
}

async function main() {
  await client.createOrReplace(feedbackSettings)
  console.log(
    JSON.stringify(
      {
        settingsId: feedbackSettings._id,
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
