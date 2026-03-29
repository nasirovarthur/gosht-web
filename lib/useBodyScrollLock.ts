"use client";

import { useEffect } from "react";

let activeLocks = 0;
let lockedScrollY = 0;

function lockBodyScroll() {
  if (typeof window === "undefined") return;

  activeLocks += 1;
  if (activeLocks > 1) return;

  const { body, documentElement } = document;
  lockedScrollY = window.scrollY;

  documentElement.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.touchAction = "none";
}

function unlockBodyScroll() {
  if (typeof window === "undefined" || activeLocks === 0) return;

  activeLocks -= 1;
  if (activeLocks > 0) return;

  const { body, documentElement } = document;
  const nextScrollY = Math.abs(parseInt(body.style.top || "0", 10)) || lockedScrollY;

  documentElement.style.overflow = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.touchAction = "";

  window.scrollTo(0, nextScrollY);
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [active]);
}

