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

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Everyday kurtas, home sets and oversized pieces in cotton and khaddar. Cash on delivery across Pakistan, free shipping over PKR 3,000.",
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
