export const site = {
  name: "Bilques",
  /* Where the site actually lives. Needed for absolute URLs in link previews
     and the sitemap — a relative OG image is ignored by WhatsApp and every
     other unfurler. Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilques.pk",
  tagline: "Aaram se tayaar",
  taglineUrdu: "آرام سے تیار",
  /* wa.me takes the number in international form, digits only — no plus, no
     leading zero. 0312 4433199 is the same line, dialled locally. */
  whatsapp: "923124433199",
  whatsappDisplay: "0312 4433199",
  instagram: "bilques.pk",
  email: "salam@bilques.pk",
  freeShippingOver: 3000,
  shipping: {
    majorCities: "2–4 days",
    elsewhere: "4–7 days",
  },
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const instagramLink = `https://instagram.com/${site.instagram}`;

export const linkedinLink = "https://www.linkedin.com/company/bilques/";

export const facebookLink = "https://www.facebook.com/profile.php?id=61588620676136";
