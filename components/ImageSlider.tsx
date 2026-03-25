'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ReactNode } from 'react';
import SliderButton from './SliderButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-creative';

interface ImageSliderProps {
  images: string[];
  orientation?: 'vertical' | 'horizontal';
  overlay?: ReactNode;
  effect?: 'slide' | 'creative' | 'projects';
}

export default function ImageSlider({
  images,
  orientation = 'vertical',
  overlay,
  effect = 'slide',
}: ImageSliderProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperInstance | null>(null);
  const [canGoPrevious, setCanGoPrevious] = useState(false);
  const [canGoNext, setCanGoNext] = useState(images.length > 1);
  const isVertical = orientation === 'vertical';
  const isSingle = images.length <= 1;

  const syncButtons = (instance: SwiperInstance) => {
    if (isSingle) {
      setCanGoPrevious(false);
      setCanGoNext(false);
      return;
    }

    setCanGoPrevious(!instance.isBeginning);
    setCanGoNext(!instance.isEnd);
  };

  const goToPrevious = () => swiperInstance?.slidePrev();
  const goToNext = () => swiperInstance?.slideNext();

  const controls = (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-7 md:gap-9`}>
      <SliderButton
        onClick={goToPrevious}
        direction={isVertical ? 'up' : 'left'}
        disabled={!canGoPrevious}
        className="scale-75 md:scale-90"
      />
      <SliderButton
        onClick={goToNext}
        direction={isVertical ? 'down' : 'right'}
        disabled={!canGoNext}
        className="scale-75 md:scale-90"
      />
    </div>
  );

  const slider = (
    <div
      className={`relative overflow-hidden shadow-2xl shrink-0 ${
        isVertical
          ? 'w-full max-w-none h-[clamp(430px,66vh,860px)]'
          : 'w-full aspect-[16/10] md:aspect-[16/9]'
      }`}
    >
      <Swiper
        modules={effect === 'creative' || effect === 'projects' ? [EffectCreative] : []}
        direction={isVertical ? 'vertical' : 'horizontal'}
        slidesPerView={1}
        speed={effect === 'projects' ? 900 : 640}
        effect={effect === 'projects' ? 'creative' : effect}
        creativeEffect={
          effect === 'projects'
            ? {
                limitProgress: 2,
                prev: {
                  translate: isVertical ? [0, '-10%', -1] : ['-10%', 0, -1],
                  opacity: 1,
                  scale: 0.985,
                },
                next: {
                  translate: isVertical ? [0, '100%', 0] : ['100%', 0, 0],
                  opacity: 1,
                  scale: 1,
                },
              }
            : effect === 'creative'
            ? {
                prev: {
                  translate: isVertical ? [0, '-100%', 0] : ['-100%', 0, 0],
                  opacity: 1,
                  scale: 1,
                },
                next: {
                  translate: isVertical ? [0, '100%', 0] : ['100%', 0, 0],
                  opacity: 1,
                  scale: 1,
                },
              }
            : undefined
        }
        onSwiper={(instance) => {
          setSwiperInstance(instance);
          syncButtons(instance);
        }}
        onSlideChange={syncButtons}
        onResize={syncButtons}
        className="h-full w-full"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx} className="!h-full !w-full">
            <div className="relative h-full w-full">
            <Image
              src={img}
              alt={`Slide ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes={
                isVertical
                  ? '(max-width: 1024px) 100vw, (max-width: 1536px) 58vw, 860px'
                  : '(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 700px'
              }
            />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {overlay}
    </div>
  );

  if (isVertical) {
    return (
      <div className="relative inline-flex w-full max-w-none">
        {slider}
        {!isSingle && (
          <div className="absolute left-0 bottom-0 -translate-x-[calc(100%+8px)] md:-translate-x-[calc(100%+14px)] z-20">
            {controls}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {slider}
      {!isSingle && <div className="self-start">{controls}</div>}
    </div>
  );
}
