// components/ClientHeader.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import type { FeedbackSettingsData } from "@/types/feedback";
import type { NavItem } from "@/types/i18n";

type ClientHeaderProps = {
  navItems: NavItem[];
  feedbackSettings: FeedbackSettingsData;
};

export default function ClientHeader({ navItems, feedbackSettings }: ClientHeaderProps) {
  const pathname = usePathname();

  // Hide Header inside Sanity Studio
  if (pathname.includes('/studio')) {
    return null;
  }

  return <Header navItems={navItems} feedbackSettings={feedbackSettings} />;
}
