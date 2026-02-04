'use client';

import ClientHeader from '@/components/ClientHeader';
import { LanguageProvider } from '@/context/LanguageContext';

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
      <LanguageProvider initialLang="en">
        <ClientHeader navItems={navItems} />
        {children}
      </LanguageProvider>
    </>
  );
}
