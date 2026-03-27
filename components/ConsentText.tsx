import { PERSONAL_DATA_CONSENT_URL } from "@/lib/legal";
import type { LangCode, Localized } from "@/types/i18n";
import { pickLocalized } from "@/types/i18n";

const consentPrefix: Localized = {
  uz: "Согласен(а) на обработку ",
  ru: "Согласен(а) на обработку ",
  en: "I consent to the processing of ",
};

const consentLinkText: Localized = {
  uz: "персональных данных",
  ru: "персональных данных",
  en: "personal data",
};

type ConsentTextProps = {
  lang: LangCode;
};

export default function ConsentText({ lang }: ConsentTextProps) {
  return (
    <>
      {pickLocalized(consentPrefix, lang)}
      <a
        href={PERSONAL_DATA_CONSENT_URL}
        target="_blank"
        rel="noreferrer"
        className="border-b border-white/30 pb-[1px] text-white/58 transition-colors hover:text-white hover:border-white/55"
      >
        {pickLocalized(consentLinkText, lang)}
      </a>
      .
    </>
  );
}
