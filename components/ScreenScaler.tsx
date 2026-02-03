"use client";

import { useEffect } from "react";

// Важно: export default function
export default function ScreenScaler() {
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Если экран шире 1920px
      if (width > 1920) {
        const scale = width / 1920;
        // @ts-ignore
        document.body.style.zoom = scale;
      } else {
        // @ts-ignore
        document.body.style.zoom = 1;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return null;
}