"use client";

import { useEffect } from "react";

export default function ScreenScaler() {
  useEffect(() => {
    const applyScale = () => {
      const width = window.innerWidth;
      const textContent = document.getElementById('hero-text-content');
      
      if (!textContent) return;
      
      if (width > 1920) {
        const scale = width / 1920;
        textContent.style.transform = `scale(${scale})`;
        textContent.style.transformOrigin = 'bottom left';
      } else {
        textContent.style.transform = 'scale(1)';
      }
    };

    // Применяем масштаб сразу
    applyScale();

    // MutationObserver для отслеживания изменений в DOM (смена языка)
    const observer = new MutationObserver(() => {
      applyScale();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: false,
    });

    // Слушаем resize события
    window.addEventListener("resize", applyScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyScale);
    };
  }, []);

  return null;
}