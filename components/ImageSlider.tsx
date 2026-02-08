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

  const getNormalizedIndex = (index: number) => {
    if (images.length === 0) return 0;
    const mod = index % images.length;
    return mod < 0 ? mod + images.length : mod;
  };

  const safeIndex = images.length ? getNormalizedIndex(currentIndex) : 0;

  const goToPrevious = () => {
    if (isSingle) return;
    setCurrentIndex((prevIndex) => {
      const normalized = getNormalizedIndex(prevIndex);
      return normalized === 0 ? images.length - 1 : normalized - 1;
    });
  };

  const goToNext = () => {
    if (isSingle) return;
    setCurrentIndex((prevIndex) => {
      const normalized = getNormalizedIndex(prevIndex);
      return normalized === images.length - 1 ? 0 : normalized + 1;
    });
  };

  const controls = (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-4`}>
      <SliderButton
        onClick={goToPrevious}
        direction={isVertical ? 'up' : 'left'}
        disabled={isSingle}
        className="scale-75 md:scale-90"
      />
      <SliderButton
        onClick={goToNext}
        direction={isVertical ? 'down' : 'right'}
        disabled={isSingle}
        className="scale-75 md:scale-90"
      />
    </div>
  );

  const slider = (
    <div
      ref={sliderRef}
      className={`relative overflow-hidden rounded-2xl shadow-2xl shrink-0 ${
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
      <div className="flex w-full items-end justify-center gap-6">
        {!isSingle && <div className="pb-3">{controls}</div>}
        {slider}
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
