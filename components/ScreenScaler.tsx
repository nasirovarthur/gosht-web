"use client";

import { useEffect } from "react";

export default function ScreenScaler() {
  useEffect(() => {
    const handleResize = () => {
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

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return null;
}