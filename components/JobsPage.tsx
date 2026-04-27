"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import { pickLocalized, type LangCode } from "@/types/i18n";
import type { JobRole, JobsPageData } from "@/lib/jobsData";

const JobsApplyDrawer = dynamic(() => import("@/components/JobsApplyDrawer"), {
  ssr: false,
});

type JobsPageProps = {
  data: JobsPageData;
  lang: LangCode;
};

function formatRoleLabel(data: JobsPageData, lang: LangCode, role: JobRole) {
  const profession = data.professions.find((item) => item.id === role);
  if (profession) return pickLocalized(profession.label, lang);

  const option = data.roleOptions.find((item) => item.value === role);
  return option ? pickLocalized(option.label, lang) : role;
}

export default function JobsPage({ data, lang }: JobsPageProps) {
  const [selectedRole, setSelectedRole] = useState<JobRole>(
    data.professions[0]?.id || data.roleOptions[0]?.value || ""
  );
  const selectedProfession = useMemo(
    () => data.professions.find((profession) => profession.id === selectedRole) || null,
    [data.professions, selectedRole]
  );
  const filteredVacancies = useMemo(
    () => selectedProfession?.vacancies || [],
    [selectedProfession]
  );
  const [openVacancyId, setOpenVacancyId] = useState<string | null>(null);
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);
  const [selectedVacancyMeta, setSelectedVacancyMeta] = useState<{
    id: string;
    title: string;
    roleLabel: string;
  } | null>(null);

  const ui = {
    inRestaurants:
      lang === "ru" ? "В РЕСТОРАНАХ" : lang === "en" ? "IN RESTAURANTS" : "RESTORANLARDA",
    sidePromptTitle:
      lang === "ru"
        ? "Не нашли подходящую вакансию?"
        : lang === "en"
          ? "Did not find a suitable role?"
          : "Mos vakansiya topilmadimi?",
    sidePromptText:
      lang === "ru"
        ? "Отправьте резюме"
        : lang === "en"
          ? "Send your CV"
          : "Rezyumeni yuboring",
  };

  return (
    <>
    <section className="relative min-h-screen bg-base pt-[200px] pb-24 text-primary md:pt-[244px] md:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-16%] top-[8%] h-[420px] w-[420px] rounded-full bg-[#AE0E16]/8 blur-[140px]" />
        <div className="absolute right-[-10%] top-[18%] h-[380px] w-[380px] rounded-full bg-[color:rgba(255,255,255,0.03)] blur-[140px] dark:bg-white/[0.03]" />
      </div>

      <div className="page-x relative z-10">
        <div className="mx-auto w-full max-w-[1600px]">
          <Reveal as="header" className="w-full" distance={34} blur={8}>
            <h1 className="mt-6 whitespace-nowrap text-[clamp(22px,4.2vw,118px)] leading-[0.88] tracking-[-0.03em] text-primary font-light font-serif">
              {pickLocalized(data.title, lang)}
            </h1>
            <p className="mt-8 max-w-[880px] text-[15px] md:text-[19px] leading-relaxed text-secondary">
              {pickLocalized(data.intro, lang)}
            </p>
          </Reveal>

          <div className="mt-16 border-t border-subtle pt-8 md:pt-10 flex flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
            <aside className="order-1 lg:sticky lg:top-[132px] lg:self-start lg:pr-10 lg:border-r lg:border-subtle">
              <Reveal as="div" delay={80} distance={30} blur={6}>
                <p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-muted">
                  {pickLocalized(data.roleLabel, lang)}
                </p>

                <div className="md:hidden mb-8">
                  <select
                    value={selectedRole}
                    onChange={(event) => {
                      const role = event.target.value as JobRole;
                      setSelectedRole(role);
                      setOpenVacancyId(null);
                    }}
                    className="h-[44px] w-full rounded-full border border-subtle bg-transparent px-4 text-[14px] text-primary outline-none transition-colors focus:border-strong"
                  >
                    {data.professions.map((profession) => (
                      <option key={profession.id} value={profession.id} className="bg-card text-primary">
                        {pickLocalized(profession.label, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden md:flex md:flex-col">
                  {data.professions.map((profession, index) => {
                    const isActive = selectedRole === profession.id;
                    return (
                      <button
                        key={profession.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(profession.id);
                          setOpenVacancyId(null);
                        }}
                        className={`group relative flex w-full items-start justify-between gap-5 border-b border-subtle py-4 pl-5 text-left transition-all duration-300 ${
                          isActive ? "text-primary" : "text-muted hover:text-secondary"
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-4 bottom-4 w-px transition-all duration-300 ${
                            isActive ? "bg-[#AE0E16]" : "bg-transparent group-hover:bg-[color:var(--border-strong)]"
                          }`}
                        />
                        <span className="flex-1">
                          <span className={`block text-[11px] tracking-[0.22em] ${isActive ? "text-muted" : "text-muted"}`}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="mt-3 block text-[24px] leading-[1.02] tracking-[-0.02em] font-light font-serif">
                            {pickLocalized(profession.label, lang)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10 md:mt-12 border-t border-subtle pt-7">
                  <p className="text-[30px] md:text-[34px] leading-[0.95] tracking-[-0.02em] font-light font-serif text-primary">
                    {ui.sidePromptTitle}
                  </p>
                  <p className="mt-5 text-body text-secondary">
                    {ui.sidePromptText}
                  </p>
                  <a
                    href="mailto:jobs@goshtgroup.uz"
                    className="mt-2 inline-block border-b border-strong pb-1 text-body text-secondary transition-colors hover:border-[color:var(--text-secondary)] hover:text-primary"
                  >
                    jobs@goshtgroup.uz
                  </a>
                </div>
              </Reveal>
            </aside>

            <div className="order-2 min-w-0 pt-8 lg:pt-0">
              <Reveal as="div" delay={90} distance={26} blur={6}>
                <div className="mb-6 border-b border-[#AE0E16] pb-4">
                  <h2 className="text-[clamp(34px,3.4vw,58px)] leading-[0.94] tracking-[-0.03em] font-light font-serif uppercase text-primary">
                    {ui.inRestaurants}
                  </h2>
                </div>

                {filteredVacancies.length === 0 ? (
                  <div className="border border-subtle bg-card p-6 md:p-8 text-secondary">
                    {pickLocalized(data.emptyState, lang)}
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {filteredVacancies.map((vacancy) => {
                      const isOpen = openVacancyId === vacancy.id;

                      return (
                        <article
                          key={vacancy.id}
                          className="border border-subtle bg-[color:var(--interactive-bg)]"
                        >
                          <button
                            type="button"
                            className="w-full text-left px-5 py-5 md:px-7 md:py-6"
                            aria-expanded={isOpen}
                            aria-controls={`vacancy-panel-${vacancy.id}`}
                            onClick={() => setOpenVacancyId((prev) => (prev === vacancy.id ? null : vacancy.id))}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-[24px] leading-[1.02] tracking-[-0.02em] font-light font-serif text-primary">
                                  {pickLocalized(vacancy.restaurantName, lang)}
                                </h3>
                                <p className="mt-3 text-[15px] leading-relaxed text-secondary">
                                  {pickLocalized(vacancy.restaurantSummary, lang)}
                                </p>
                              </div>
                              <div className="flex items-center gap-5">
                                <span
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-strong text-secondary"
                                  aria-hidden="true"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </button>

                          <div
                            id={`vacancy-panel-${vacancy.id}`}
                            className={`grid transition-all duration-500 ease-out ${
                              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-5 pb-6 md:px-7 md:pb-7">
                                <div className="grid grid-cols-1 gap-1 border-t border-subtle pt-6 text-[15px] leading-relaxed text-secondary">
                                  <p>{pickLocalized(vacancy.salary, lang)}</p>
                                  <p>{pickLocalized(vacancy.experience, lang)}</p>
                                  <p>{pickLocalized(vacancy.schedule, lang)}</p>
                                </div>

                                <div className="mt-9 space-y-8">
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:gap-5">
                                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
                                      {pickLocalized(data.responsibilitiesLabel, lang)}
                                    </p>
                                    <ul className="space-y-2 text-body text-secondary">
                                      {vacancy.responsibilities.map((item) => (
                                        <li key={`${vacancy.id}-resp-${pickLocalized(item, lang)}`} className="leading-relaxed">
                                          • {pickLocalized(item, lang)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:gap-5">
                                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
                                      {pickLocalized(data.requirementsLabel, lang)}
                                    </p>
                                    <ul className="space-y-2 text-body text-secondary">
                                      {vacancy.requirements.map((item) => (
                                        <li key={`${vacancy.id}-req-${pickLocalized(item, lang)}`} className="leading-relaxed">
                                          • {pickLocalized(item, lang)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:gap-5">
                                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
                                      {pickLocalized(data.conditionsLabel, lang)}
                                    </p>
                                    <ul className="space-y-2 text-body text-secondary">
                                      {vacancy.conditions.map((item) => (
                                        <li key={`${vacancy.id}-cond-${pickLocalized(item, lang)}`} className="leading-relaxed">
                                          • {pickLocalized(item, lang)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-4 border-t border-subtle pt-6 md:flex-row md:items-end md:justify-between">
                                  <div>
                                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
                                      {pickLocalized(data.contactsLabel, lang)}
                                    </p>
                                    <div className="mt-2 space-y-1 text-body text-secondary">
                                      <p>{vacancy.contactPhone}</p>
                                      <p>{vacancy.contactEmail}</p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedVacancyMeta({
                                        id: vacancy.id,
                                        title: pickLocalized(vacancy.restaurantName, lang),
                                        roleLabel: formatRoleLabel(data, lang, vacancy.role),
                                      });
                                      setIsApplyDrawerOpen(true);
                                    }}
                                    className="inline-flex h-[44px] items-center justify-center rounded-full border border-strong px-6 text-ui text-primary transition-all duration-300 hover:border-[color:var(--text-secondary)] hover:bg-[color:var(--interactive-hover)] hover:text-primary md:h-[54px] md:px-8"
                                  >
                                    {pickLocalized(data.applyLabel, lang)}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
    {isApplyDrawerOpen && selectedVacancyMeta ? (
      <JobsApplyDrawer
        isOpen={isApplyDrawerOpen}
        onClose={() => setIsApplyDrawerOpen(false)}
        lang={lang}
        vacancyId={selectedVacancyMeta.id}
        vacancyTitle={selectedVacancyMeta.title}
        vacancyRole={selectedVacancyMeta.roleLabel}
      />
    ) : null}
    </>
  );
}
