// components/ClientHeader.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

type NavItem = {
  _key: string;
  label: LocalizedString;
  link: string;
};

type ClientHeaderProps = {
  navItems: NavItem[];
  headerText?: {
    menu: LocalizedString;
    close: LocalizedString;
  };
};

export default function ClientHeader({ navItems, headerText }: ClientHeaderProps) {
  const pathname = usePathname();
  
  // Не показываем Header внутри Sanity Studio
  // Проверяем наличие /studio в пути (может быть /uz/studio, /ru/studio и т.д.)
  if (pathname.includes('/studio')) {
    return null;
  }

  return <Header navItems={navItems} headerText={headerText} />;
}
