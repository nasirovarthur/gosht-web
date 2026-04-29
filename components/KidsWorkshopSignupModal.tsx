"use client";

import { useEffect, useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import type { LangCode } from "@/lib/eventsData";
import type { ReactNode } from "react";

const masterclassOptions = [
  "Postcard Creation",
  "Box and Pencil Case Painting",
  "Branded Aprons",
  "Cotton Wool Creations",
  "Exclusive Mugs",
  "Ring Holders",
  "Stylish T-Shirts",
  "Cozy Pillows",
  "Magical Candles",
  "Lucky Stone Amulets",
  "Canvas Art",
  "Giant Coloring",
  "Lantern Design",
  "Gosht Kids Puzzle",
];

const showOptions = [
  "Paw Patrol",
  "Unleash the Superhero",
  "Magical Mickey Mouse",
  "Glamorous Barbie Fashion",
  "Enchanting Unicorn Adventure",
  "Dive into Minecraft",
];

type KidsWorkshopSignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  eventTitle: string;
};

const ui = {
  title: {
    uz: "Formani to'ldiring, biz Kids Workshop bo'yicha siz bilan bog'lanamiz",
    ru: "Заполните форму, и мы свяжемся с вами по Kids Workshop",
    en: "Fill in the form and we will contact you about our Kids Workshop",
  },
  firstName: { uz: "Ism", ru: "Имя", en: "First Name" },
  phone: { uz: "Telefon", ru: "Телефон", en: "Phone Number" },
  email: { uz: "Email", ru: "Email", en: "Email" },
  date: { uz: "Qulay sana", ru: "Желаемая дата", en: "Preferred Date" },
  kidsCount: {
    uz: "Workshopda qatnashadigan bolalar soni",
    ru: "Количество детей на мастер-классе",
    en: "Number of Kids participating in the workshop",
  },
  masterclass: { uz: "Masterclass tanlang", ru: "Выберите мастер-класс", en: "Choose the Masterclass" },
  show: { uz: "Bolalar shousini tanlang", ru: "Выберите шоу для детей", en: "Choose Show for Kids" },
  clear: { uz: "Formani tozalash", ru: "Очистить форму", en: "Clear the form" },
  send: { uz: "Yuborish", ru: "Отправить", en: "Send" },
  success: {
    uz: "Ariza tayyor. Menejer bolalar dasturi bo'yicha siz bilan bog'lanadi.",
    ru: "Заявка готова. Менеджер свяжется с вами по детской программе.",
    en: "Request is ready. A manager will contact you about the kids program.",
  },
  close: { uz: "Yopish", ru: "Закрыть", en: "Close" },
};

function pick<T extends Record<LangCode, string>>(value: T, lang: LangCode): string {
  return value[lang] || value.ru || value.en;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">{label}</span>
      {children}
    </label>
  );
}

export default function KidsWorkshopSignupModal({
  isOpen,
  onClose,
  lang,
  eventTitle,
}: KidsWorkshopSignupModalProps) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [kidsCount, setKidsCount] = useState("1");
  const [masterclass, setMasterclass] = useState("");
  const [show, setShow] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "h-12 w-full rounded-[18px] border border-white/12 bg-white/[0.06] px-4 text-[15px] text-primary outline-none transition-colors placeholder:text-muted focus:border-white/35 focus:bg-white/[0.09]";

  const resetForm = () => {
    setFirstName("");
    setPhone("");
    setEmail("");
    setPreferredDate("");
    setKidsCount("1");
    setMasterclass("");
    setShow("");
    setIsSubmitted(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label={pick(ui.close, lang)}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative max-h-[92vh] w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/12 bg-[#0f1412] text-primary shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#AE0E16]/25 blur-[80px]" />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-[90px]" />

        <div className="relative flex max-h-[92vh] flex-col overflow-y-auto px-5 py-6 md:px-10 md:py-9">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-muted transition-colors hover:bg-white/10 hover:text-primary"
            aria-label={pick(ui.close, lang)}
          >
            <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          <div className="max-w-[760px]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Kids Workshop</p>
            <h2 className="mt-4 text-[clamp(34px,4vw,66px)] font-light font-serif uppercase leading-[0.92] tracking-[-0.035em] text-primary">
              {pick(ui.title, lang)}
            </h2>
            <p className="mt-5 max-w-[620px] text-[14px] leading-relaxed text-secondary md:text-[16px]">
              {eventTitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={pick(ui.firstName, lang)}>
              <input
                className={inputClass}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder={pick(ui.firstName, lang)}
                required
              />
            </Field>

            <Field label={pick(ui.phone, lang)}>
              <input
                className={inputClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1"
                type="tel"
                required
              />
            </Field>

            <Field label={pick(ui.email, lang)}>
              <input
                className={inputClass}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@gmail.com"
                type="email"
              />
            </Field>

            <Field label={pick(ui.date, lang)}>
              <input
                className={inputClass}
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                type="date"
                required
              />
            </Field>

            <Field label={pick(ui.kidsCount, lang)}>
              <input
                className={inputClass}
                value={kidsCount}
                onChange={(event) => setKidsCount(event.target.value)}
                min="1"
                type="number"
                required
              />
            </Field>

            <Field label={pick(ui.masterclass, lang)}>
              <select
                className={`${inputClass} appearance-none`}
                value={masterclass}
                onChange={(event) => setMasterclass(event.target.value)}
              >
                <option value="">{pick(ui.masterclass, lang)}</option>
                {masterclassOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label={pick(ui.show, lang)}>
                <select
                  className={`${inputClass} appearance-none`}
                  value={show}
                  onChange={(event) => setShow(event.target.value)}
                >
                  <option value="">{pick(ui.show, lang)}</option>
                  {showOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {isSubmitted ? (
              <p className="rounded-[20px] border border-[#AE0E16]/35 bg-[#AE0E16]/12 px-5 py-4 text-[14px] leading-relaxed text-primary md:col-span-2">
                {pick(ui.success, lang)}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 px-6 text-ui text-secondary transition-colors hover:bg-white/10 hover:text-primary"
              >
                {pick(ui.clear, lang)}
              </button>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#AE0E16] px-8 text-ui text-white transition-transform active:scale-95"
              >
                {pick(ui.send, lang)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
