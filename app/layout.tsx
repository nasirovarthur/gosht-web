import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SeoJsonLd from "@/components/SeoJsonLd";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/seo/site";

// Roboto Serif font
const robotoSerif = localFont({
  src: [
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
  ],
  variable: '--font-roboto-serif',
  display: 'optional',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Gōsht Group",
  title: {
    default: "Gōsht Group",
    template: "%s",
  },
  description:
    "Gōsht Group is a restaurant holding in Tashkent with premium restaurants, fast-food projects, barbershop, catering, and branded hospitality concepts.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: "Gōsht Group",
    type: "website",
    url: getSiteUrl(),
    title: "Gōsht Group",
    description:
      "Restaurant holding in Tashkent with premium restaurants, fast-food projects, barbershop, catering, and branded hospitality concepts.",
    images: [
      {
        url: "/og/gosht-group-og.jpg",
        alt: "Gōsht Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gōsht Group",
    description:
      "Restaurant holding in Tashkent with premium restaurants, fast-food projects, barbershop, catering, and branded hospitality concepts.",
    images: ["/og/gosht-group-og.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" data-theme="dark" suppressHydrationWarning>
      <body className={`${robotoSerif.variable} bg-base text-primary antialiased transition-colors duration-300`}>
        {children}
        <SeoJsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
