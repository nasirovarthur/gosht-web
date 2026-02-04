import { LanguageProvider } from "@/context/LanguageContext";

// 4. Layout с поддержкой [lang]
export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const langCode = lang as "uz" | "ru" | "en";

  return (
    <LanguageProvider initialLang={langCode}>
      {children}
    </LanguageProvider>
  );
}
