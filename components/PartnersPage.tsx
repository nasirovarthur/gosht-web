'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'
import type { PartnersPageData } from '@/lib/getPartnersPage'
import type { LangCode } from '@/types/i18n'
import { pickLocalized } from '@/types/i18n'
import SliderButton from './SliderButton'
import 'swiper/css'

type PartnersPageProps = {
  lang: LangCode
  data: PartnersPageData
}

export default function PartnersPage({ lang, data }: PartnersPageProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperInstance | null>(null)
  const [canGoPrev, setCanGoPrev] = useState(false)
  const [canGoNext, setCanGoNext] = useState(true)

  const syncControls = (swiper: SwiperInstance) => {
    setCanGoPrev(!swiper.isBeginning)
    setCanGoNext(!swiper.isEnd)
  }

  return (
    <main className="relative min-h-screen bg-base pt-[200px] pb-24 text-white md:pt-[244px] md:pb-28">
      <div className="page-x relative z-10">
        <div className="mx-auto max-w-[1880px]">
          <header className="max-w-[1120px]">
            <h1 className="mt-6 whitespace-nowrap text-[clamp(22px,4.2vw,118px)] leading-[0.88] tracking-[-0.03em] text-white font-light font-serif">
              {pickLocalized(data.title, lang)}
            </h1>
          </header>

          <div className="mt-14 md:mt-16">
            <Swiper
              spaceBetween={12}
              slidesPerView={1.12}
              speed={640}
              breakpoints={{
                640: { slidesPerView: 2.05, spaceBetween: 16 },
                960: { slidesPerView: 3.1, spaceBetween: 22 },
                1280: { slidesPerView: 4.15, spaceBetween: 28 },
                1600: { slidesPerView: 5, spaceBetween: 32 },
              }}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper)
                syncControls(swiper)
              }}
              onSlideChange={syncControls}
              onResize={syncControls}
            >
              {data.partners.map((partner) => (
                <SwiperSlide key={partner.id} className="h-auto">
                  <article className="flex h-full min-h-[330px] flex-col justify-between border-r border-white/10 px-3 py-4 md:min-h-[360px] md:px-5 md:py-6 xl:min-h-[390px]">
                    <div className="flex min-h-[170px] flex-1 items-center justify-center md:min-h-[200px] xl:min-h-[220px]">
                      <div className="relative h-[118px] w-full max-w-[300px] md:h-[142px] md:max-w-[330px] xl:h-[162px] xl:max-w-[360px]">
                        <Image
                          src={partner.logo}
                          alt={partner.companyName}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 300px, (max-width: 1280px) 330px, 360px"
                        />
                      </div>
                    </div>

                    <div className="mt-14 flex flex-col items-start">
                      <h2 className="text-[22px] font-light uppercase tracking-[0.02em] text-white md:text-[24px]">
                        {partner.companyName}
                      </h2>
                      <Link
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-fit break-all text-[15px] text-white/56 transition-colors duration-300 hover:text-white"
                      >
                        {partner.website}
                      </Link>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-8 flex items-center justify-end gap-3 md:mt-10">
              <SliderButton
                direction="left"
                onClick={() => swiperInstance?.slidePrev()}
                disabled={!canGoPrev}
                className="scale-[0.62] md:scale-[0.72]"
              />
              <SliderButton
                direction="right"
                onClick={() => swiperInstance?.slideNext()}
                disabled={!canGoNext}
                className="scale-[0.62] md:scale-[0.72]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
