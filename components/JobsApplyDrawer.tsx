"use client";

import { useRef, useState } from "react";
import ConsentText from "@/components/ConsentText";
import SliderButton from "@/components/SliderButton";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { pickLocalized, type LangCode, type Localized } from "@/types/i18n";

type JobsApplyDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  vacancyId: string;
  vacancyTitle: string;
  vacancyRole: string;
};

const MAX_ATTACHMENTS = 2;

type FloatingInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

type FloatingTextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const ui: {
  title: Localized;
  name: Localized;
  phone: Localized;
  email: Localized;
  about: Localized;
  attach: Localized;
  send: Localized;
  sending: Localized;
  successTitle: Localized;
  successDescription: Localized;
  fileLabel: Localized;
  filesLimit: Localized;
  robotCheck: Localized;
  genericError: Localized;
} = {
  title: {
    uz: "VAKANSIYAGA JAVOB QOLDIRISH",
    ru: "ОТКЛИКНУТЬСЯ НА ВАКАНСИЮ",
    en: "APPLY FOR THIS VACANCY",
  },
  name: { uz: "ИМЯ", ru: "ИМЯ", en: "NAME" },
  phone: { uz: "НОМЕР ТЕЛЕФОНА", ru: "НОМЕР ТЕЛЕФОНА", en: "PHONE NUMBER" },
  email: { uz: "ПОЧТА", ru: "ПОЧТА", en: "EMAIL" },
  about: {
    uz: "НЕБОЛЬШОЙ РАССКАЗ О СЕБЕ",
    ru: "НЕБОЛЬШОЙ РАССКАЗ О СЕБЕ",
    en: "SHORT INFO ABOUT YOU",
  },
  attach: {
    uz: "ПРИКРЕПИТЬ ФАЙЛ",
    ru: "ПРИКРЕПИТЬ ФАЙЛ",
    en: "ATTACH FILE",
  },
  send: { uz: "Отправить", ru: "Отправить", en: "Send" },
  sending: { uz: "Отправляем...", ru: "Отправляем...", en: "Sending..." },
  successTitle: {
    uz: "ЗАЯВКА ОТПРАВЛЕНА",
    ru: "ЗАЯВКА ОТПРАВЛЕНА",
    en: "APPLICATION SENT",
  },
  successDescription: {
    uz: "Мы получили ваш отклик и свяжемся с вами после рассмотрения.",
    ru: "Мы получили ваш отклик и свяжемся с вами после рассмотрения.",
    en: "We received your application and will contact you after review.",
  },
  fileLabel: { uz: "Резюме", ru: "Резюме", en: "Resume" },
  filesLimit: {
    uz: "Можно добавить максимум 2 файла",
    ru: "Можно добавить максимум 2 файла",
    en: "You can attach up to 2 files",
  },
  robotCheck: {
    uz: "Подтвердите, что вы не робот",
    ru: "Подтвердите, что вы не робот",
    en: "Confirm that you are not a robot",
  },
  genericError: {
    uz: "Не удалось отправить. Проверьте поля и попробуйте снова.",
    ru: "Не удалось отправить. Проверьте поля и попробуйте снова.",
    en: "Could not submit. Please check fields and try again.",
  },
};

function formatFileName(name: string, maxLength = 24): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: FloatingInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative pt-7">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        required={required}
        className="peer h-11 w-full border-0 border-b border-[#3B3B3B] bg-transparent px-0 text-[16px] text-white outline-none transition-colors focus:border-white/58"
      />
      <span
        className={`pointer-events-none absolute left-0 transition-all duration-200 ${
          hasValue
            ? "top-0 text-[11px] tracking-[0.14em] text-white/44"
            : "top-[32px] text-[15px] text-white/44"
        } peer-focus:top-0 peer-focus:text-[11px] peer-focus:tracking-[0.14em] peer-focus:text-white/65`}
      >
        {label}
      </span>
      <span className="pointer-events-none absolute bottom-0 right-1/2 h-[2px] w-0 bg-white/70 transition-all duration-200 peer-focus:w-1/2" />
      <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-white/70 transition-all duration-200 peer-focus:w-1/2" />
    </div>
  );
}

function FloatingTextArea({ label, value, onChange, required }: FloatingTextAreaProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative pt-7">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        required={required}
        className="peer min-h-[120px] w-full resize-y border-0 border-b border-[#3B3B3B] bg-transparent px-0 py-2 text-[16px] leading-relaxed text-white outline-none transition-colors focus:border-white/58"
      />
      <span
        className={`pointer-events-none absolute left-0 transition-all duration-200 ${
          hasValue
            ? "top-0 text-[11px] tracking-[0.14em] text-white/44"
            : "top-[32px] text-[15px] text-white/44"
        } peer-focus:top-0 peer-focus:text-[11px] peer-focus:tracking-[0.14em] peer-focus:text-white/65`}
      >
        {label}
      </span>
      <span className="pointer-events-none absolute bottom-0 right-1/2 h-[2px] w-0 bg-white/70 transition-all duration-200 peer-focus:w-1/2" />
      <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-white/70 transition-all duration-200 peer-focus:w-1/2" />
    </div>
  );
}

export default function JobsApplyDrawer({
  isOpen,
  onClose,
  lang,
  vacancyId,
  vacancyTitle,
  vacancyRole,
}: JobsApplyDrawerProps) {
  useBodyScrollLock(isOpen);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [filesLimitWarning, setFilesLimitWarning] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "ok" | "error";
    text?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const title = pickLocalized(ui.title, lang);
  const isSuccess = submitMessage?.type === "ok";

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAbout("");
    setResumeFiles([]);
    setFilesLimitWarning(false);
    setConsentChecked(false);
    setTurnstileToken("");
    setTurnstileResetKey((prev) => prev + 1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setSubmitMessage(null);
    setIsSubmitHovered(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (!vacancyId || !name.trim() || !phone.trim() || !about.trim() || !consentChecked) {
      setSubmitMessage({
        type: "error",
        text: pickLocalized(ui.genericError, lang),
      });
      return;
    }

    if (!turnstileToken) {
      setSubmitMessage({
        type: "error",
        text: pickLocalized(ui.robotCheck, lang),
      });
      return;
    }

    const formData = new FormData();
    formData.set("vacancyId", vacancyId);
    formData.set("vacancyTitle", vacancyTitle);
    formData.set("vacancyRole", vacancyRole);
    formData.set("name", name.trim());
    formData.set("phone", phone.trim());
    formData.set("email", email.trim());
    formData.set("about", about.trim());
    formData.set("consent", consentChecked ? "true" : "false");
    formData.set("lang", lang);
    formData.set("turnstileToken", turnstileToken);

    resumeFiles.forEach((file) => {
      formData.append("resume", file);
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response
          .json()
          .catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `HTTP ${response.status}`);
      }

      setSubmitMessage({ type: "ok" });
      resetForm();
    } catch (error) {
      const fallbackText = pickLocalized(ui.genericError, lang);
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : fallbackText,
      });
    } finally {
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[58] bg-black/60 ${
          isOpen ? "opacity-100 backdrop-blur-[4px] visible" : "opacity-0 backdrop-blur-none invisible"
        }`}
        style={{ transition: "all 0.7s ease" }}
      />

      <div
        className={`fixed top-0 left-0 h-full z-[61] bg-panel text-[#d1d1d1] transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full flex flex-col overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxWidth: "min(100vw, 700px)", width: "min(100vw, 700px)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-apply-drawer-title"
        inert={!isOpen}
      >
        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x flex-shrink-0 border-b border-white/5 relative z-20">
          <button
            onClick={handleClose}
            className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all"
          >
            <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
            </svg>
            <span className="text-ui font-light pt-0.5 text-white/90">{title}</span>
          </button>
        </div>

        <div
          className={`flex-1 page-x py-8 md:py-10 relative z-10 ${
            isSuccess ? "flex items-center justify-center" : "overflow-y-auto overscroll-contain"
          }`}
        >
          <div className={`max-w-[560px] ${isSuccess ? "w-full text-center" : ""}`}>
            {isSuccess ? (
              <div>
                <p
                  id="jobs-apply-drawer-title"
                  className="text-[24px] md:text-[32px] font-light font-serif uppercase tracking-[0.02em] text-white/92"
                >
                  {pickLocalized(ui.successTitle, lang)}
                </p>
                <p className="mt-3 text-[14px] md:text-[16px] leading-relaxed text-white/62">
                  {pickLocalized(ui.successDescription, lang)}
                </p>
              </div>
            ) : (
              <>
                <p
                  id="jobs-apply-drawer-title"
                  className="text-[22px] md:text-[26px] font-light font-serif uppercase tracking-[0.02em] text-white/92"
                >
                  {title}
                </p>
                {vacancyTitle ? (
                  <p className="mt-4 text-[14px] md:text-[16px] leading-relaxed text-white/55">
                    {vacancyTitle}
                    {vacancyRole ? ` / ${vacancyRole}` : ""}
                  </p>
                ) : null}

                <form ref={formRef} onSubmit={handleSubmit} className="mt-8 md:mt-10 space-y-6">
                  <FloatingInput
                    label={pickLocalized(ui.name, lang)}
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    required
                  />

                  <FloatingInput
                    label={pickLocalized(ui.phone, lang)}
                    value={phone}
                    onChange={setPhone}
                    autoComplete="tel"
                    required
                  />

                  <FloatingInput
                    label={pickLocalized(ui.email, lang)}
                    value={email}
                    onChange={setEmail}
                    type="email"
                    autoComplete="email"
                  />

                  <FloatingTextArea
                    label={pickLocalized(ui.about, lang)}
                    value={about}
                    onChange={setAbout}
                    required
                  />

                  <div className="pt-2">
                    {resumeFiles.length > 0 ? (
                      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                        {resumeFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center gap-1.5">
                            <span className="text-[13px] text-white/58">
                              {formatFileName(file.name)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setResumeFiles((prev) => prev.filter((_, i) => i !== index));
                                setFilesLimitWarning(false);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="inline-flex items-center justify-center text-[16px] leading-none text-white/62 transition-colors hover:text-white"
                              aria-label="Удалить файл"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          const incoming = Array.from(event.target.files || []);
                          if (incoming.length === 0) return;

                          setResumeFiles((prev) => {
                            const freeSlots = Math.max(0, MAX_ATTACHMENTS - prev.length);
                            const next = [...prev, ...incoming.slice(0, freeSlots)];
                            setFilesLimitWarning(prev.length + incoming.length > MAX_ATTACHMENTS);
                            return next;
                          });
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      />
                      <span className="tracking-[0.05em] text-[14px] uppercase text-white/76">
                        {pickLocalized(ui.attach, lang)}
                      </span>
                      <SliderButton
                        variant="symbol"
                        symbol="+"
                        className="h-7 w-7"
                        ariaLabel={pickLocalized(ui.attach, lang)}
                        onClick={() => fileInputRef.current?.click()}
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-white/46">
                      {pickLocalized(ui.fileLabel, lang)}
                    </p>
                    {filesLimitWarning ? (
                      <p className="mt-2 text-[13px] text-[#e47f7f]">
                        {pickLocalized(ui.filesLimit, lang)}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-2">
                    <p className="mb-3 text-[13px] md:text-[14px] leading-relaxed text-white/58">
                      {pickLocalized(ui.robotCheck, lang)}
                    </p>
                    <TurnstileWidget
                      onVerify={(token) => {
                        setTurnstileToken(token);
                        setSubmitMessage((current) =>
                          current?.type === "error" &&
                          current.text === pickLocalized(ui.robotCheck, lang)
                            ? null
                            : current
                        );
                      }}
                      onExpire={() => setTurnstileToken("")}
                      onError={() => setTurnstileToken("")}
                      resetKey={turnstileResetKey}
                    />
                  </div>

                  <div className="pt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(event) => setConsentChecked(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent"
                        required
                      />
                      <span className="text-[13px] md:text-[14px] leading-relaxed text-white/74">
                        <ConsentText lang={lang} />
                      </span>
                    </label>
                  </div>

                  {submitMessage?.type === "error" ? (
                    <p className="pt-4 text-[14px] text-[#e47f7f]">{submitMessage.text}</p>
                  ) : null}

                  <div className="pt-8">
                    <div
                      className={`inline-flex flex-col items-start ${isSubmitting ? "opacity-55" : ""}`}
                      onMouseEnter={() => setIsSubmitHovered(true)}
                      onMouseLeave={() => setIsSubmitHovered(false)}
                    >
                      <div className="inline-flex items-center gap-5 md:gap-6">
                        <button
                          type="button"
                          onClick={() => formRef.current?.requestSubmit()}
                          disabled={isSubmitting}
                          className={`text-body-lg pb-0.5 leading-none transition-colors disabled:cursor-not-allowed ${
                            isSubmitHovered && !isSubmitting ? "text-white" : "text-white/85"
                          }`}
                        >
                          {isSubmitting ? pickLocalized(ui.sending, lang) : pickLocalized(ui.send, lang)}
                        </button>
                        <SliderButton
                          direction="right"
                          forceHover={isSubmitHovered && !isSubmitting}
                          className="scale-[0.48] md:scale-[0.6] origin-left -ml-2 md:-ml-1 shrink-0"
                          disabled={isSubmitting}
                          ariaLabel={isSubmitting ? pickLocalized(ui.sending, lang) : pickLocalized(ui.send, lang)}
                          onClick={() => formRef.current?.requestSubmit()}
                        />
                      </div>

                      <span className="relative mt-0.5 h-px w-[210px] bg-white/20 overflow-hidden">
                        <span
                          className={`absolute inset-0 bg-white/60 transition-transform duration-500 ease-out ${
                            isSubmitHovered && !isSubmitting ? "translate-x-0" : "-translate-x-full"
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
