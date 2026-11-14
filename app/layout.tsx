import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SeoJsonLd from "@/components/SeoJsonLd";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo/schema";
import { getSiteUrl } from "@/lib/seo/site";

const GTM_CONTAINER_ID = "GTM-K4ZXKJGN";

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
      <head>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          `}
        </Script>
      </head>
      <body className={`${robotoSerif.variable} bg-black text-white antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
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
