export const site = {
  name: "Bilques",
  tagline: "Aaram se tayaar",
  taglineUrdu: "آرام سے تیار",
  whatsapp: "923001234567",
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
