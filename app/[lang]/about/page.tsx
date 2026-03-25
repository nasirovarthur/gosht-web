import Image from 'next/image'
import { getAboutPageData } from '@/lib/getAboutPage'
import { getProjectsPageData } from '@/lib/getProjects'
import { getRestaurantBranchesData } from '@/lib/getRestaurantBranches'
import { pickLocalized, type LangCode } from '@/types/i18n'

const sectionPaddingClass = 'pb-24 md:pb-32 min-[1920px]:pb-36'
const sectionDividerClass = 'border-t border-white/20 pt-20 md:pt-24 min-[1920px]:pt-28'
const brandText = 'GŌSHT GROUP'

function resolveLang(lang: string): LangCode {
  return (['uz', 'ru', 'en'].includes(lang) ? lang : 'uz') as LangCode
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default async function AboutRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const langCode = resolveLang(lang)

  const [aboutData, projectsData, restaurantData] = await Promise.all([
    getAboutPageData(),
    getProjectsPageData(),
    getRestaurantBranchesData(),
  ])

  const t = {
    heroTitleLines: splitLines(pickLocalized(aboutData.heroSection.title, langCode)),
    heroBodyFirst: pickLocalized(aboutData.heroSection.bodyFirst, langCode),
    heroBodySecond: pickLocalized(aboutData.heroSection.bodySecond, langCode),
    heroAccentLines: splitLines(pickLocalized(aboutData.heroSection.accentTitle, langCode)),
    heroCaption: pickLocalized(aboutData.heroSection.primaryCaption, langCode),
    founderLeadOne: pickLocalized(aboutData.founderSection.leadFirst, langCode),
    founderLeadTwo: pickLocalized(aboutData.founderSection.leadSecond, langCode),
    founderAside: pickLocalized(aboutData.founderSection.aside, langCode),
    founderName: pickLocalized(aboutData.founderSection.name, langCode),
    founderRole: pickLocalized(aboutData.founderSection.role, langCode),
    founderCaption: pickLocalized(aboutData.founderSection.caption, langCode),
    brandsTitleLines: splitLines(pickLocalized(aboutData.brandsSection.title, langCode)),
    brandsText: pickLocalized(aboutData.brandsSection.body, langCode),
    systemTitle: splitLines(pickLocalized(aboutData.systemSection.title, langCode)),
    systemText: pickLocalized(aboutData.systemSection.body, langCode),
    systemCaption: pickLocalized(aboutData.systemSection.caption, langCode),
  }

  const logoProjectsMap = new Map<
    string,
    {
      id: string
      name: { uz?: string; ru?: string; en?: string }
      logo: string
    }
  >()

  if (aboutData.brandsSection.includeCompanyProjects) {
    projectsData.projects.forEach((project) => {
      if (!project.logo) return
      logoProjectsMap.set(project.logo, {
        id: `company-${project.id}`,
        name: project.name,
        logo: project.logo,
      })
    })
  }

  if (aboutData.brandsSection.includeRestaurantProjects) {
    restaurantData.projects.forEach((project) => {
      if (!project.logo) return
      logoProjectsMap.set(project.logo, {
        id: `restaurant-${project.id}`,
        name: project.name,
        logo: project.logo,
      })
    })
  }

  const logoProjects = Array.from(logoProjectsMap.values())
  const heroFirstLine = t.heroTitleLines[0] || ''
  const heroRemainingLines = t.heroTitleLines.slice(1)
  const firstLineWithMarker = heroFirstLine.replace(brandText, `__${brandText}__`)
  const [titleStart, titleEnd = ''] = firstLineWithMarker.split(`__${brandText}__`)

  return (
    <main className="bg-base pt-[200px] text-white md:pt-[244px]">
      <section className={`page-x min-[1920px]:min-h-[956px] ${sectionPaddingClass}`}>
        <div className="w-full">
          <header className="w-full">
            <div className="text-[32px] leading-[1.01] tracking-[-0.03em] font-light font-serif uppercase text-white/96 md:text-[40px] xl:text-[46px] min-[1920px]:text-[50px]">
              <p className="text-center md:text-right">
                {titleStart}
                {heroFirstLine.includes(brandText) ? (
                  <span className="text-[#AE0E16]">{brandText}</span>
                ) : null}
                {titleEnd}
              </p>
              {heroRemainingLines.map((line) => (
                <p key={line} className="text-center md:text-right">
                  {line}
                </p>
              ))}
            </div>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-8 md:mt-[120px] lg:grid-cols-[minmax(520px,0.9fr)_minmax(0,1.15fr)_300px] xl:grid-cols-[minmax(560px,0.92fr)_minmax(0,1.18fr)_320px] min-[1920px]:grid-cols-[680px_minmax(0,1fr)_420px] lg:gap-10 xl:gap-12 min-[1920px]:gap-16">
            <figure className="order-1">
              <div className="relative aspect-[680/760] overflow-hidden border border-white/10 bg-card">
                <Image
                  src={aboutData.heroSection.primaryImage}
                  alt={t.heroCaption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 680px"
                />
              </div>
              <figcaption className="mt-3 text-[16px] leading-snug text-white/78 md:text-[18px] min-[1920px]:text-[20px]">
                {t.heroCaption}
              </figcaption>
            </figure>

            <div className="order-3 lg:order-2 lg:min-h-[660px] xl:min-h-[740px] min-[1920px]:min-h-[806px]">
              <div className="max-w-[980px]">
                <p className="mt-1 text-[22px] leading-[1.18] font-light text-white/84 md:mt-0">
                  {t.heroBodyFirst}
                </p>
                <p className="mt-4 text-[22px] leading-[1.18] font-light text-white/84 md:mt-5">
                  {t.heroBodySecond}
                </p>

                <div className="mt-10 max-w-[980px] text-[36px] leading-[0.95] tracking-[-0.03em] font-light font-serif uppercase text-white/94 md:mt-16 md:text-[40px] xl:mt-28 xl:text-[46px] min-[1920px]:mt-36 min-[1920px]:text-[50px]">
                  {t.heroAccentLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-3 lg:pt-[4px] min-[1920px]:pt-[6px]">
              <div className="mx-auto max-w-[320px] lg:max-w-none">
                <div className="relative aspect-square overflow-hidden border border-white/10 bg-card">
                  <Image
                    src={aboutData.heroSection.secondaryImage}
                    alt={t.heroBodyFirst}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 70vw, 420px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`page-x ${sectionPaddingClass}`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] min-[1920px]:grid-cols-[520px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1 lg:pt-[360px] xl:pt-[400px] min-[1920px]:pt-[490px]">
            <p className="max-w-[320px] text-[20px] leading-[1.18] text-white/88">
              {t.founderAside}
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[460px_500px] lg:justify-end xl:grid-cols-[500px_560px] min-[1920px]:grid-cols-[640px_760px]">
              <div>
                <div className="ml-auto max-w-[640px] text-center lg:text-right">
                  <p className="text-[22px] leading-[1.16] text-white/90">
                    {t.founderLeadOne}
                  </p>
                  <p className="mt-5 text-[22px] leading-[1.16] text-white/90">
                    {t.founderLeadTwo}
                  </p>
                </div>

                <div className="mt-16 ml-auto text-center md:mt-20 lg:text-right min-[1920px]:mt-[286px]">
                  <h2 className="text-[38px] leading-[0.98] tracking-[-0.03em] font-light font-serif uppercase text-white md:text-[48px] xl:text-[52px] min-[1920px]:text-[64px]">
                    {t.founderName}
                  </h2>
                  <p className="mt-5 text-[18px] tracking-[0.22em] uppercase text-white/48 md:text-[19px] min-[1920px]:text-[20px]">
                    {t.founderRole}
                  </p>
                </div>
              </div>

              <figure className="flex flex-col items-end">
                <div className="relative aspect-[720/560] w-full overflow-hidden border border-white/10 bg-card">
                  <Image
                    src={aboutData.founderSection.image}
                    alt={t.founderCaption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 720px"
                  />
                </div>
                <figcaption className="mt-3 w-max text-right text-[16px] leading-snug text-white/80 md:text-[18px] min-[1920px]:text-[20px]">
                  {t.founderCaption}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <div className={`mt-20 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12 min-[1920px]:mt-24 min-[1920px]:gap-16 ${sectionDividerClass}`}>
          <div>
            <h3 className="max-w-[980px] text-[34px] leading-[0.96] tracking-[-0.03em] font-light font-serif uppercase text-white md:text-[46px] min-[1920px]:text-[58px]">
              {t.brandsTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h3>
            <p className="mt-7 max-w-[680px] text-[20px] leading-[1.24] text-white/88">
              {t.brandsText}
            </p>
          </div>

          <div className="relative overflow-hidden">
            {logoProjects.length ? (
              <div className="flex w-max items-center whitespace-nowrap animate-logo-marquee">
                {[0, 1].map((groupIndex) => (
                  <div
                    key={`logo-group-${groupIndex}`}
                    className="flex shrink-0 items-center gap-12 md:gap-16 min-[1920px]:gap-24"
                    aria-hidden={groupIndex === 1}
                  >
                    {logoProjects.map((project) => (
                      <div
                        key={`${groupIndex}-${project.id}`}
                        className="flex h-[82px] w-[164px] items-center justify-center opacity-45 saturate-0 transition-opacity duration-300 hover:opacity-75 md:h-[92px] md:w-[184px] min-[1920px]:h-[108px] min-[1920px]:w-[220px]"
                      >
                        <Image
                          src={project.logo}
                          alt={pickLocalized(project.name, langCode)}
                          width={190}
                          height={96}
                          className="max-h-full w-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,#0D0D0D_0%,rgba(13,13,13,0)_100%)] md:w-24 min-[1920px]:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(270deg,#0D0D0D_0%,rgba(13,13,13,0)_100%)] md:w-24 min-[1920px]:w-32" />
          </div>
        </div>
      </section>

      <section className={`page-x ${sectionPaddingClass}`}>
        <div className={`grid grid-cols-1 gap-12 lg:grid-cols-[minmax(520px,0.96fr)_minmax(0,1fr)] xl:grid-cols-[600px_minmax(0,1fr)] min-[1920px]:grid-cols-[760px_minmax(0,1fr)] lg:gap-12 xl:gap-14 min-[1920px]:gap-20 ${sectionDividerClass}`}>
          <figure className="flex items-start gap-4 min-[1920px]:gap-5">
            <div className="relative aspect-[760/540] w-full overflow-hidden border border-white/10 bg-card">
              <Image
                src={aboutData.systemSection.image}
                alt={t.systemCaption}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
            </div>
            <figcaption className="hidden self-start pt-1 text-[18px] leading-none text-white/80 lg:block [writing-mode:vertical-rl] [text-orientation:mixed] min-[1920px]:text-[20px]">
              {t.systemCaption}
            </figcaption>
          </figure>

          <div className="flex min-h-full flex-col justify-between lg:pl-6 xl:pl-8 min-[1920px]:pl-16">
            <div className="ml-auto max-w-[620px] text-center lg:text-right min-[1920px]:max-w-[760px]">
              <h3 className="text-[34px] leading-[0.96] tracking-[-0.03em] font-light font-serif uppercase text-white md:text-[42px] xl:text-[46px] min-[1920px]:text-[58px]">
                {t.systemTitle.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
            </div>

            <div className="mt-14 ml-auto max-w-[500px] text-center lg:mt-16 lg:text-right min-[1920px]:mt-24 min-[1920px]:max-w-[560px]">
              <p className="text-[20px] leading-[1.18] text-white/88">
                {t.systemText}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
