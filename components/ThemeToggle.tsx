"use client";

import { useTheme } from "@/context/ThemeContext";

type ThemeToggleProps = {
  compact?: boolean;
};

const labels = {
  light: "LIGHT",
  dark: "DARK",
};

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--interactive-bg)] p-1 ${
        compact ? "gap-1" : "gap-1.5"
      }`}
      aria-label="Theme switcher"
    >
      {(["light", "dark"] as const).map((mode) => {
        const isActive = theme === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              compact ? "min-w-[64px]" : "min-w-[76px]"
            } ${
              isActive
                ? "bg-[color:var(--interactive-strong)] text-[color:var(--text-inverse)]"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            }`}
            aria-pressed={isActive}
          >
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
}
