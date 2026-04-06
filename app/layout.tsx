import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
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
    <html suppressHydrationWarning>
      <body className={`${robotoSerif.variable} bg-black text-white antialiased`}>
        {children}
        <SeoJsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
