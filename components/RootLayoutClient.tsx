'use client';

import ScreenScaler from '@/components/ScreenScaler';
import { LanguageProvider } from '@/context/LanguageContext';
import ClientHeader from '@/components/ClientHeader';

type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

interface RootLayoutClientProps {
  children: React.ReactNode;
  navItems: Array<{ _key: string; label: LocalizedString; link: string }>;
}

export default function RootLayoutClient({
  children,
  navItems,
}: RootLayoutClientProps) {
  return (
    <>
      <ScreenScaler />
      <LanguageProvider initialLang="en">
        <ClientHeader navItems={navItems} />
        {children}
      </LanguageProvider>
    </>
  );
}
