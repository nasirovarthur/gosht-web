"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ConsentText from "@/components/ConsentText";
import SliderButton from "@/components/SliderButton";
import TurnstileWidget from "@/components/TurnstileWidget";
import { pickLocalized } from "@/types/i18n";
import type { LangCode, LocalizedOptional } from "@/types/i18n";
import type { FeedbackSettingsData } from "@/types/feedback";

type FeedbackRestaurantOption = {
  id: string;
  name: LocalizedOptional;
};

type FeedbackDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  settings: FeedbackSettingsData;
};

function formatFileName(name: string, maxLength = 16): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}

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

const staticUi = {
  title: { uz: "QAYTA ALOQA", ru: "ОБРАТНАЯ СВЯЗЬ", en: "FEEDBACK" },
  subtitle: {
    uz: "Savolingiz yoki taklifingizni yuboring, tez orada javob beramiz.",
    ru: "Оставьте вопрос или пожелание, мы свяжемся с вами в ближайшее время.",
    en: "Leave your question or request and we will get back to you shortly.",
  },
  restaurant: { uz: "РЕСТОРАН", ru: "РЕСТОРАН", en: "RESTAURANT" },
  name: { uz: "ИМЯ", ru: "ИМЯ", en: "NAME" },
  phone: { uz: "НОМЕР ТЕЛЕФОНА", ru: "НОМЕР ТЕЛЕФОНА", en: "PHONE NUMBER" },
  email: { uz: "ПОЧТА", ru: "ПОЧТА", en: "EMAIL" },
  message: { uz: "ВОПРОС ИЛИ ПОЖЕЛАНИЕ", ru: "ВОПРОС ИЛИ ПОЖЕЛАНИЕ", en: "QUESTION OR REQUEST" },
  photo: { uz: "ПРИКРЕПИТЬ ФОТО", ru: "ПРИКРЕПИТЬ ФОТО", en: "ATTACH PHOTO" },
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
  send: { uz: "Отправить", ru: "Отправить", en: "Send" },
  sending: { uz: "Отправляем...", ru: "Отправляем...", en: "Sending..." },
  choose: { uz: "Выберите", ru: "Выберите", en: "Select" },
  noRestaurants: {
    uz: "Список ресторанов недоступен",
    ru: "Список ресторанов недоступен",
    en: "Restaurant list is unavailable",
  },
} as const;

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

export default function FeedbackDrawer({ isOpen, onClose, lang, settings }: FeedbackDrawerProps) {
  const [restaurantOptions, setRestaurantOptions] = useState<FeedbackRestaurantOption[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isRestaurantSelectOpen, setIsRestaurantSelectOpen] = useState(false);
  const [name, setName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [filesLimitWarning, setFilesLimitWarning] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "ok" | "error"; text?: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsRestaurantSelectOpen(false);
      setSubmitMessage(null);
      setIsSubmitHovered(false);
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      return;
    }
    if (restaurantOptions.length > 0) return;

    let cancelled = false;
    setIsLoadingRestaurants(true);

    void fetch("/api/feedback/restaurants", { method: "GET" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<{ restaurants?: FeedbackRestaurantOption[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setRestaurantOptions(Array.isArray(payload.restaurants) ? payload.restaurants : []);
      })
      .catch(() => {
        if (cancelled) return;
        setRestaurantOptions([]);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingRestaurants(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, restaurantOptions.length]);

  useEffect(() => {
    if (!isRestaurantSelectOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!target || !(target instanceof Node)) return;
      if (!selectRef.current?.contains(target)) {
        setIsRestaurantSelectOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRestaurantSelectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isRestaurantSelectOpen]);

  const selectedRestaurant = useMemo(
    () => restaurantOptions.find((item) => item.id === restaurantId),
    [restaurantId, restaurantOptions]
  );

  const canSelectRestaurant = restaurantOptions.length > 0;
  const restaurantName = selectedRestaurant ? pickLocalized(selectedRestaurant.name, lang) : "";
  const showSelectFloatingLabel =
    Boolean(restaurantId) || isRestaurantSelectOpen || !canSelectRestaurant;
  const isSuccess = submitMessage?.type === "ok";
  const drawerTitle =
    pickLocalized(settings.title, lang) || pickLocalized(staticUi.title, lang);
  const drawerSubtitle =
    pickLocalized(settings.subtitle, lang) || pickLocalized(staticUi.subtitle, lang);
  const restaurantButtonLabel = isLoadingRestaurants
    ? "..."
    : restaurantName ||
      (canSelectRestaurant
        ? isRestaurantSelectOpen
          ? pickLocalized(staticUi.choose, lang)
          : ""
        : pickLocalized(staticUi.noRestaurants, lang));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (!restaurantId || !name.trim() || !phone.trim() || !message.trim() || !consentChecked) {
      setSubmitMessage({ type: "error", text: pickLocalized(settings.error, lang) });
      return;
    }

    if (!turnstileToken) {
      setSubmitMessage({
        type: "error",
        text: pickLocalized(staticUi.robotCheck, lang),
      });
      return;
    }

    const formData = new FormData();
    formData.set("restaurantId", restaurantId);
    formData.set("restaurantName", restaurantName);
    formData.set("name", name.trim());
    formData.set("phone", phone.trim());
    formData.set("email", email.trim());
    formData.set("message", message.trim());
    formData.set("consent", consentChecked ? "true" : "false");
    formData.set("lang", lang);
    formData.set("turnstileToken", turnstileToken);

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
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
      setRestaurantId("");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setPhotos([]);
      setFilesLimitWarning(false);
      setConsentChecked(false);
      setIsRestaurantSelectOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const defaultError = pickLocalized(settings.error, lang);
      const message = error instanceof Error ? error.message : defaultError;
      setSubmitMessage({ type: "error", text: message || defaultError });
    } finally {
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      setIsSubmitting(false);
    }
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    setPhotos((previous) => {
      const freeSlots = Math.max(0, 2 - previous.length);
      const next = [...previous, ...incoming.slice(0, freeSlots)];
      setFilesLimitWarning(previous.length + incoming.length > 2);
      return next;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setPhotos((previous) => previous.filter((_, index) => index !== indexToRemove));
    setFilesLimitWarning(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full z-[61] bg-panel text-[#d1d1d1] transform transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] w-full flex flex-col overflow-hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ maxWidth: "min(100vw, 700px)", width: "min(100vw, 700px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-drawer-title"
      inert={!isOpen}
    >
      <div className="flex items-center justify-between w-full h-[80px] md:h-[100px] page-x flex-shrink-0 border-b border-white/5 relative z-20">
        <button
          onClick={onClose}
          className="group flex items-center gap-3 md:gap-4 pl-4 pr-4 md:pl-6 md:pr-8 h-[40px] md:h-[60px] border border-white/10 rounded-full hover:bg-white/5 transition-all"
        >
          <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
          </svg>
          <span className="text-ui font-light pt-0.5 text-white/90">
            {drawerTitle}
          </span>
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
                id="feedback-drawer-title"
                className="text-[24px] md:text-[32px] font-light font-serif uppercase tracking-[0.02em] text-white/92"
              >
                {pickLocalized(settings.successTitle, lang)}
              </p>
              <p className="mt-3 text-[14px] md:text-[16px] leading-relaxed text-white/62">
                {pickLocalized(settings.successDescription, lang)}
              </p>
            </div>
          ) : (
            <>
              <p
                id="feedback-drawer-title"
                className="text-[22px] md:text-[26px] font-light font-serif uppercase tracking-[0.02em] text-white/92"
              >
                {drawerTitle}
              </p>
              <p className="mt-4 text-[14px] md:text-[16px] leading-relaxed text-white/55">
                {drawerSubtitle}
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-8 md:mt-10 space-y-6">
            <div ref={selectRef} className="relative pt-7">
              <button
                type="button"
                onClick={() => {
                  if (canSelectRestaurant) {
                    setIsRestaurantSelectOpen((prev) => !prev);
                  }
                }}
                disabled={!canSelectRestaurant}
                className="peer flex h-11 w-full items-center justify-between border-0 border-b border-[#3B3B3B] bg-transparent px-0 text-left text-[16px] text-white outline-none transition-colors focus:border-white/58 disabled:cursor-not-allowed disabled:text-white/46"
                aria-haspopup="listbox"
                aria-expanded={isRestaurantSelectOpen}
              >
                <span className={`${restaurantName ? "text-white" : "text-white/58"}`}>
                  {restaurantButtonLabel}
                </span>
                <svg
                  className={`h-4 w-4 text-white/58 transition-transform duration-200 ${isRestaurantSelectOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <span
                className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                  showSelectFloatingLabel
                    ? "top-0 text-[11px] tracking-[0.14em] text-white/44"
                    : "top-[32px] text-[15px] text-white/44"
                }`}
              >
                {pickLocalized(staticUi.restaurant, lang)}
              </span>

              <span className={`pointer-events-none absolute bottom-0 right-1/2 h-[2px] bg-white/70 transition-all duration-200 ${isRestaurantSelectOpen ? "w-1/2" : "w-0"}`} />
              <span className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] bg-white/70 transition-all duration-200 ${isRestaurantSelectOpen ? "w-1/2" : "w-0"}`} />

              {isRestaurantSelectOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 max-h-56 overflow-y-auto border border-white/12 bg-[#0f0f0f] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                  {restaurantOptions.map((option) => {
                    const optionName = pickLocalized(option.name, lang);
                    const isActive = option.id === restaurantId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setRestaurantId(option.id);
                          setIsRestaurantSelectOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] transition-colors ${
                          isActive ? "bg-white/10 text-white" : "text-white/72 hover:bg-white/6 hover:text-white"
                        }`}
                      >
                        <span>{optionName}</span>
                        {isActive ? (
                          <span className="text-white/72">•</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <FloatingInput
              label={pickLocalized(staticUi.name, lang)}
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />

            <FloatingInput
              label={pickLocalized(staticUi.phone, lang)}
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
              required
            />

            <FloatingInput
              label={pickLocalized(staticUi.email, lang)}
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />

            <FloatingTextArea
              label={pickLocalized(staticUi.message, lang)}
              value={message}
              onChange={setMessage}
              required
            />

            <div className="pt-2">
              {photos.length > 0 ? (
                <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {photos.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center gap-1.5">
                      <span className="text-[13px] text-white/58">{formatFileName(file.name)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
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
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => addFiles(event.target.files)}
                />
                <span className="tracking-[0.05em] text-[14px] uppercase text-white/76">
                  {pickLocalized(staticUi.photo, lang)}
                </span>
                <SliderButton
                  variant="symbol"
                  symbol="+"
                  className="h-7 w-7"
                  ariaLabel={pickLocalized(staticUi.photo, lang)}
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
              {filesLimitWarning ? (
                <p className="mt-2 text-[13px] text-[#e47f7f]">
                  {pickLocalized(staticUi.filesLimit, lang)}
                </p>
              ) : null}
            </div>

            <div className="pt-2">
              <p className="mb-3 text-[13px] md:text-[14px] leading-relaxed text-white/58">
                {pickLocalized(staticUi.robotCheck, lang)}
              </p>
              <TurnstileWidget
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setSubmitMessage((current) =>
                    current?.type === "error" &&
                    current.text === pickLocalized(staticUi.robotCheck, lang)
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
              <p className="pt-4 text-[14px] text-[#e47f7f]">
                {submitMessage.text}
              </p>
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
                    {isSubmitting ? pickLocalized(staticUi.sending, lang) : pickLocalized(staticUi.send, lang)}
                  </button>
                  <SliderButton
                    direction="right"
                    forceHover={isSubmitHovered && !isSubmitting}
                    className="scale-[0.48] md:scale-[0.6] origin-left -ml-2 md:-ml-1 shrink-0"
                    disabled={isSubmitting}
                    ariaLabel={isSubmitting ? pickLocalized(staticUi.sending, lang) : pickLocalized(staticUi.send, lang)}
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
  );
}
