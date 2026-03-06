'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import SliderButton from './SliderButton';

interface ImageSliderProps {
  images: string[];
  orientation?: 'vertical' | 'horizontal';
  overlay?: ReactNode;
}

export default function ImageSlider({
  images,
  orientation = 'vertical',
  overlay,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';
  const isSingle = images.length <= 1;

  const safeIndex = images.length ? Math.min(Math.max(currentIndex, 0), images.length - 1) : 0;
  const canGoPrevious = !isSingle && safeIndex > 0;
  const canGoNext = !isSingle && safeIndex < images.length - 1;

  const goToPrevious = () => {
    if (!canGoPrevious) return;
    setCurrentIndex(safeIndex - 1);
  };

  const goToNext = () => {
    if (!canGoNext) return;
    setCurrentIndex(safeIndex + 1);
  };

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
      ref={sliderRef}
      className={`relative overflow-hidden shadow-2xl shrink-0 ${
        isVertical
          ? 'w-[80vw] max-w-[880px] aspect-[880/794]'
          : 'w-[80vw] max-w-[880px] aspect-[880/794]'
      }`}
      style={isVertical ? { maxHeight: 'calc(100vh - 272px)' } : undefined}
    >
      <div
        className={`flex ${isVertical ? 'flex-col' : 'flex-row'} h-full w-full transition-transform duration-500`}
        style={{
          transform: isVertical
            ? `translateY(-${safeIndex * 100}%)`
            : `translateX(-${safeIndex * 100}%)`,
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative flex-shrink-0 w-full h-full">
            <Image
              src={img}
              alt={`Slide ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === safeIndex}
              sizes={isVertical ? '(max-width: 1024px) 80vw, 880px' : '(max-width: 1024px) 80vw, 880px'}
            />
          </div>
        ))}
      </div>
      {overlay}
    </div>
  );

  if (isVertical) {
    return (
      <div className="relative inline-flex w-fit max-w-full">
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
    <div className="flex w-full flex-col items-center gap-4">
      {slider}
      {!isSingle && <div className="self-start">{controls}</div>}
    </div>
  );
}
