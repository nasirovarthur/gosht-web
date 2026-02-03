import type { Metadata } from "next";
import { Roboto_Serif } from "next/font/google"; // 1. Импортируем шрифт
import "./globals.css";

// 2. Настраиваем его (загружаем латиницу и кириллицу)
const robotoSerif = Roboto_Serif({
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto-serif", // Создаем переменную для Tailwind
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gosht Group",
  description: "Premium Hospitality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Добавляем шрифт в body. Теперь он доступен во всем приложении */}
      <body className={robotoSerif.className}>
        {children}
      </body>
    </html>
  );
}