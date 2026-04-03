"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "figure"
  | "header"
  | "footer"
  | "main"
  | "aside"
  | "span";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  children: ReactNode;
  variant?: "up" | "down" | "left" | "right" | "zoom";
  trigger?: "view" | "mount";
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  rootRef?: RefObject<Element | null>;
};

export default function Reveal({
  as = "div",
  children,
  className,
  style,
  variant = "up",
  trigger = "view",
  delay = 0,
  duration = 900,
  distance = 42,
  blur = 10,
  threshold = 0.16,
  rootMargin = "0px 0px -12% 0px",
  once = true,
  rootRef,
  ...rest
}: RevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    if (trigger === "mount") {
      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const node = elementRef.current;
    if (!node || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
            return;
          }

          if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
        root: rootRef?.current ?? null,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, prefersReducedMotion, rootMargin, rootRef, threshold, trigger]);

  const composedClassName = ["reveal", className].filter(Boolean).join(" ");
  const composedStyle = {
    ...style,
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration}ms`,
    "--reveal-distance": `${distance}px`,
    "--reveal-blur": `${blur}px`,
  } as CSSProperties;
  const visible = prefersReducedMotion || isVisible;
  const attachRef = (node: HTMLElement | null) => {
    elementRef.current = node;
  };
  const sharedProps = {
    ...rest,
    className: composedClassName,
    style: composedStyle,
    "data-variant": variant,
    "data-visible": visible ? "true" : "false",
  };

  switch (as) {
    case "section":
      return <section {...sharedProps} ref={attachRef}>{children}</section>;
    case "article":
      return <article {...sharedProps} ref={attachRef}>{children}</article>;
    case "figure":
      return <figure {...sharedProps} ref={attachRef}>{children}</figure>;
    case "header":
      return <header {...sharedProps} ref={attachRef}>{children}</header>;
    case "footer":
      return <footer {...sharedProps} ref={attachRef}>{children}</footer>;
    case "main":
      return <main {...sharedProps} ref={attachRef}>{children}</main>;
    case "aside":
      return <aside {...sharedProps} ref={attachRef}>{children}</aside>;
    case "span":
      return <span {...sharedProps} ref={attachRef}>{children}</span>;
    case "div":
    default:
      return <div {...sharedProps} ref={attachRef}>{children}</div>;
  }
}
