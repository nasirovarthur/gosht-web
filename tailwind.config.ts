import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Мы указываем все возможные папки, чтобы Tailwind точно нашел файлы
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-roboto-serif)', 'serif'],
      },
      // 1. Сначала регистрируем анимации
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'progress': 'progress 6s linear forwards',
        'infinite-scroll': 'infinite-scroll 60s linear infinite',
      },
      // 2. Потом описываем кадры (keyframes)
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;