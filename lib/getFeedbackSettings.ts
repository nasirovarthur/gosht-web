import { client } from "@/lib/sanity";
import { singletonDocumentIds } from "@/sanity/singletons";
import type { Localized, LocalizedOptional } from "@/types/i18n";
import type { FeedbackSettingsData } from "@/types/feedback";

type FeedbackSettingsRaw = {
  drawerTitle?: LocalizedOptional;
  subtitle?: LocalizedOptional;
  consentLabel?: LocalizedOptional;
  successTitle?: LocalizedOptional;
  successDescription?: LocalizedOptional;
  errorLabel?: LocalizedOptional;
};

function normalizeLocalized(
  value?: LocalizedOptional | null,
  fallback?: Localized
): Localized {
  const clean = (input?: string) => {
    const trimmed = input?.trim();
    return trimmed ? trimmed : "";
  };

  const uz = clean(value?.uz) || fallback?.uz || "";
  const ru = clean(value?.ru) || uz || fallback?.ru || fallback?.uz || "";
  const en = clean(value?.en) || uz || fallback?.en || fallback?.uz || "";

  return {
    uz,
    ru,
    en,
  };
}

const fallbackSettings: FeedbackSettingsData = {
  title: { uz: "QAYTA ALOQA", ru: "ОБРАТНАЯ СВЯЗЬ", en: "FEEDBACK" },
  subtitle: {
    uz: "Savolingiz yoki taklifingizni yuboring, tez orada javob beramiz.",
    ru: "Оставьте вопрос или пожелание, мы свяжемся с вами в ближайшее время.",
    en: "Leave your question or request and we will get back to you shortly.",
  },
  consent: {
    uz: "Согласен(а) на обработку персональных данных",
    ru: "Согласен(а) на обработку персональных данных",
    en: "I agree to personal data processing",
  },
  successTitle: {
    uz: "ЗАЯВКА ОТПРАВЛЕНА",
    ru: "ЗАЯВКА ОТПРАВЛЕНА",
    en: "REQUEST SENT",
  },
  successDescription: {
    uz: "Ваша заявка направлена директору ресторана, менеджеру по сервису Gōsht Group и в центральный офис группы компаний.",
    ru: "Ваша заявка направлена директору ресторана, менеджеру по сервису Gōsht Group и в центральный офис группы компаний.",
    en: "Your request has been sent to the restaurant director, the Gōsht Group service manager, and the central office of the group.",
  },
  error: {
    uz: "Не удалось отправить. Проверьте поля и попробуйте снова.",
    ru: "Не удалось отправить. Проверьте поля и попробуйте снова.",
    en: "Failed to send. Please check the fields and try again.",
  },
};

export async function getFeedbackSettings(): Promise<FeedbackSettingsData> {
  try {
    const query = `
      *[_type == "feedbackSettings" && _id == $documentId][0]{
        drawerTitle,
        subtitle,
        consentLabel,
        successTitle,
        successDescription,
        errorLabel
      }
    `;

    const raw = await client.fetch<FeedbackSettingsRaw | null>(
      query,
      {
        documentId: singletonDocumentIds.feedbackSettings,
      },
      {
        cache: "no-store",
      }
    );

    if (!raw) {
      return fallbackSettings;
    }

    return {
      title: normalizeLocalized(raw.drawerTitle, fallbackSettings.title),
      subtitle: normalizeLocalized(raw.subtitle, fallbackSettings.subtitle),
      consent: normalizeLocalized(raw.consentLabel, fallbackSettings.consent),
      successTitle: normalizeLocalized(raw.successTitle, fallbackSettings.successTitle),
      successDescription: normalizeLocalized(raw.successDescription, fallbackSettings.successDescription),
      error: normalizeLocalized(raw.errorLabel, fallbackSettings.error),
    };
  } catch (error) {
    console.error("Error fetching feedback settings:", error);
    return fallbackSettings;
  }
}
