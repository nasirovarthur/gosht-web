import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Добавляем настройки шрифта
      fontFamily: {
        // Делаем Roboto Serif основным шрифтом для всего сайта (sans)
        sans: ['var(--font-roboto-serif)', 'serif'], 
        // И дублируем для класса font-serif
        serif: ['var(--font-roboto-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;