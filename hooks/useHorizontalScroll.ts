'use client';

import { useEffect, useRef } from 'react';

function isScrollableVertically(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight + 1;
  return canScroll;
}

function hasInteractiveVerticalScrollTarget(target: EventTarget | null, container: HTMLElement) {
  let current = target instanceof HTMLElement ? target : null;

  while (current && current !== document.body) {
    if (current === container) return false;
    if (isScrollableVertically(current)) return true;
    current = current.parentElement;
  }

  return false;
}

/**
 * Converts dominant vertical wheel movement into native horizontal scroll.
 * On horizontally locked pages, wheel events can originate over fixed UI like the header,
 * so the handler is attached globally and reroutes vertical wheel to the page container.
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
      if (maxScrollLeft <= 0 || event.deltaY === 0) {
        return;
      }

      if (hasInteractiveVerticalScrollTarget(event.target, container)) {
        return;
      }

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

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [enabled]);

  return scrollContainerRef;
}
