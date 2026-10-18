import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Loaded for the brand accents only — the tagline and the collection names.
   The spec keeps the site in English; Urdu here is a flourish, not a
   translation layer. */
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-nastaliq",
  display: "swap",
});

const description =
  "Everyday kurtas, home sets and oversized pieces in cotton and khaddar. Cash on delivery across Pakistan, free shipping from PKR 3,000.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description,
  // Public ownership tags must remain present after webmaster verification.
  verification: {
    google: "-56rf4ZiUYsum4C2YjkQrTc30Kz3Aq3LVi-RHYK8a4g",
    other: {
      "msvalidate.01": "E1640182BF201FD1C6CD7E4BABC97D7E",
    },
  },
  /* The brand sells through WhatsApp and Instagram, where every shared link is
     unfurled. Without these a product link arrives as a bare URL. */
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${nastaliq.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
