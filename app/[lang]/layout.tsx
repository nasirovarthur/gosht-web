import localFont from "next/font/local";
import ScreenScaler from "@/components/ScreenScaler";
import ClientHeader from "@/components/ClientHeader";
import { client } from "@/lib/sanity";
import { LanguageProvider } from "@/context/LanguageContext";
import "../globals.css";

// 1. Подключаем Roboto Serif (твои настройки)
const robotoSerif = localFont({
  src: [
    {
      path: '../fonts/RobotoSerif_120pt-Thin.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-ExtraLight.woff',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-SemiBold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/RobotoSerif_120pt-Black.woff',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-roboto-serif',
  display: 'swap',
});

// 2. Метаданные
export const metadata = {
  title: "GOSHT Group",
  description: "Premium Steakhouse & Catering",
};

// 3. Функция получения меню
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

// 4. Layout с поддержкой [lang]
export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const navItems = await getNavData();
  const lang = params.lang as "uz" | "ru" | "en";

  return (
    <html lang={lang === "uz" ? "uz" : lang === "ru" ? "ru" : "en"}>
      <body className={`${robotoSerif.variable} bg-black text-white antialiased`}>
        <ScreenScaler />
        
        <LanguageProvider initialLang={lang}>
          <ClientHeader navItems={navItems} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
