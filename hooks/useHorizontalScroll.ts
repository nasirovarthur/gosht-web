'use client';

import { useEffect, useRef } from 'react';

/**
 * Converts dominant vertical wheel movement into native horizontal scroll.
 */
export function useHorizontalScroll(enabled: boolean) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !enabled) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      if (maxScrollLeft <= 0) {
        return;
      }

      if (event.deltaY === 0) return;
      event.preventDefault();

      let baseDelta = event.deltaY;
      if (event.deltaMode === 1) {
        baseDelta *= 16;
      } else if (event.deltaMode === 2) {
        baseDelta *= container.clientWidth;
      }

      const nextScrollLeft = container.scrollLeft + baseDelta * 1.2;
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [enabled]);

  return scrollContainerRef;
}
