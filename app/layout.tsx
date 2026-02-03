import "./globals.css";
import localFont from "next/font/local";
import ScreenScaler from "@/components/ScreenScaler";

// Подключаем Roboto Serif (все веса)
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
  variable: '--font-roboto-serif', // Имя переменной
  display: 'swap',
});

export const metadata = {
  title: "GOSHT Group",
  description: "Premium Steakhouse & Catering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      {/* Добавляем переменную в body */}
      <body className={`${robotoSerif.variable} bg-black text-white antialiased`}>
          <ScreenScaler />
        {children}
      </body>
    </html>
  );
}