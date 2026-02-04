import "./globals.css";
import localFont from "next/font/local";
import RootLayoutClient from "@/components/RootLayoutClient";
import ScreenScaler from "@/components/ScreenScaler";
import { client } from "@/lib/sanity"; // Добавили клиент Sanity для загрузки меню

// 1. Подключаем Roboto Serif (твои настройки)
const robotoSerif = localFont({
  src: [
    {
      path: './fonts/RobotoSerif_120pt-Thin.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-ExtraLight.woff',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-SemiBold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/RobotoSerif_120pt-Black.woff',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-roboto-serif',
  display: 'swap',
});

// 2. Твои метаданные
export const metadata = {
  title: "GOSHT Group",
  description: "Premium Steakhouse & Catering",
};

// 3. Функция получения меню (критично для работы Header)
async function getNavData() {
  try {
    const query = `
      *[_type == "navigation"][0] {
        items[] {
          _key,
          label,
          link
        }
      }
    `;
    const data = await client.fetch(query);
    return data?.items || [];
  } catch (error) {
    console.error("Error fetching nav data:", error);
    return [];
  }
}

// 4. Основной Layout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Получаем данные для меню на сервере
  const navItems = await getNavData();

  return (
    <html>
      <body className={`${robotoSerif.variable} bg-black text-white antialiased`}>
        <ScreenScaler />
        <RootLayoutClient navItems={navItems}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}