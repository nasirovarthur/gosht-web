import { LanguageProvider } from "@/context/LanguageContext";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import { getNavigation } from "@/lib/getNavigation";
import { getFooterSettings } from "@/lib/getFooterSettings";
import { getFeedbackSettings } from "@/lib/getFeedbackSettings";
import type { LangCode } from "@/types/i18n";

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = (["uz", "ru", "en"].includes(lang) ? lang : "uz") as LangCode;

  // Fetch nav data at this level so Header is inside LanguageProvider
  const [navItems, footerSettings, feedbackSettings] = await Promise.all([
    getNavigation(),
    getFooterSettings(),
    getFeedbackSettings(),
  ]);

  return (
    <LanguageProvider initialLang={langCode}>
      <ClientHeader navItems={navItems} feedbackSettings={feedbackSettings} />
      {children}
      <Footer settings={footerSettings} navItems={navItems} />
    </LanguageProvider>
  );
}
