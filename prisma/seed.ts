/**
 * Puts the starting catalogue into the database.
 *
 * Safe to run more than once: each piece is matched on its slug and updated
 * rather than duplicated. It never touches orders.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env");

const prisma = new PrismaClient({
  adapter: url.startsWith("file:")
    ? new PrismaBetterSqlite3({ url })
    : new PrismaMariaDb(url),
});

const products = [
  {
    slug: "suti-kurta",
    name: "Suti kurta",
    urdu: null,
    collection: "rozana",
    price: 2200,
    stock: 24,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Undyed", hex: "#E4DCCF" },
      { name: "Sage", hex: "#8B9E8B" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    photos: [
      "/cloth/suti-kurta-1.svg",
      "/cloth/suti-kurta-2.svg",
      "/cloth/suti-kurta-3.svg",
    ],
    description:
      "A straight cotton kurta with side slits and a plain round neck. It is the one you will reach for without thinking, which is the whole point.",
    details: [
      "100% cotton, pre-washed so it will not shrink on you",
      "Side pockets, side slits to the hip",
      "Length 42 inches — sits below the knee on most heights",
      "Machine wash cold, hang dry in shade",
    ],
  },
  {
    slug: "sada-lawn-kurta",
    name: "Sada lawn kurta",
    urdu: null,
    collection: "rozana",
    price: 1900,
    stock: 31,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Chalk", hex: "#EDE7DD" },
      { name: "Tea", hex: "#B9A489" },
    ],
    photos: ["/cloth/sada-lawn-kurta-1.svg", "/cloth/sada-lawn-kurta-2.svg"],
    description:
      "Lightweight lawn for the months when everything else feels like too much. Unlined, so wear a slip under the paler shades.",
    details: [
      "Fine lawn, unlined",
      "Full sleeve with a two-button cuff",
      "Length 40 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "dhoop-kurta",
    name: "Dhoop kurta",
    urdu: "دھوپ",
    collection: "rozana",
    price: 2400,
    stock: 18,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Wheat", hex: "#D8C7A6" },
      { name: "Clay", hex: "#A98D77" },
      { name: "Sage", hex: "#8B9E8B" },
    ],
    photos: [
      "/cloth/dhoop-kurta-1.svg",
      "/cloth/dhoop-kurta-2.svg",
      "/cloth/dhoop-kurta-3.svg",
    ],
    description:
      "Cut a little looser through the shoulder for hot afternoons. The weave is open enough to move air and close enough to stay opaque.",
    details: [
      "Cotton slub, medium weight",
      "Dropped shoulder, half sleeve",
      "Length 44 inches",
      "Hand wash recommended for the first wash",
    ],
  },
  {
    slug: "chai-kurta",
    name: "Chai kurta",
    urdu: null,
    collection: "rozana",
    price: 2600,
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Chai", hex: "#9C7F63" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    photos: ["/cloth/chai-kurta-1.svg", "/cloth/chai-kurta-2.svg"],
    description:
      "A heavier slub cotton for the in-between weeks when it is not cold but the mornings are. Deep pockets, plain placket.",
    details: [
      "Cotton slub, heavier weight",
      "Two deep front pockets",
      "Length 43 inches",
      "Machine wash cold, do not tumble dry",
    ],
  },
  {
    slug: "neend-lounge-set",
    name: "Neend lounge set",
    urdu: "نیند",
    collection: "ghar",
    price: 3200,
    stock: 16,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Fog", hex: "#CFCCC4" },
      { name: "Sage", hex: "#8B9E8B" },
    ],
    photos: [
      "/cloth/neend-lounge-set-1.svg",
      "/cloth/neend-lounge-set-2.svg",
      "/cloth/neend-lounge-set-3.svg",
    ],
    description:
      "Khaddar shirt and drawstring trousers. Soft on the first wear, softer by the tenth. Sold as a set.",
    details: [
      "Khaddar cotton, two pieces",
      "Drawstring waist with an inner elastic",
      "Trouser inseam 38 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "subah-home-set",
    name: "Subah home set",
    urdu: null,
    collection: "ghar",
    price: 2900,
    stock: 21,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Chalk", hex: "#EDE7DD" },
      { name: "Wheat", hex: "#D8C7A6" },
    ],
    photos: ["/cloth/subah-home-set-1.svg", "/cloth/subah-home-set-2.svg"],
    description:
      "A washed cotton kameez with matching shalwar, cut roomy through the hip. Decent enough for the courier at the gate.",
    details: [
      "Washed cotton, two pieces",
      "Side pockets in the kameez",
      "Kameez length 40 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "aaram-pajama-set",
    name: "Aaram pajama set",
    urdu: "آرام",
    collection: "ghar",
    price: 2800,
    stock: 9,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Fog", hex: "#CFCCC4" },
      { name: "Clay", hex: "#A98D77" },
    ],
    photos: ["/cloth/aaram-pajama-set-1.svg", "/cloth/aaram-pajama-set-2.svg"],
    description:
      "Soft jersey, no buttons, nothing that digs in. Made for the hour between getting home and dinner.",
    details: [
      "Cotton jersey, two pieces",
      "Flat drawstring, no elastic bite",
      "Trouser inseam 37 inches",
      "Machine wash cold, dries fast",
    ],
  },
  {
    slug: "azad-oversized-kurta",
    name: "Azad oversized kurta",
    urdu: "آزاد",
    collection: "azad",
    price: 3400,
    stock: 14,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", hex: "#3A3A3A" },
      { name: "Undyed", hex: "#E4DCCF" },
      { name: "Sage", hex: "#8B9E8B" },
    ],
    photos: [
      "/cloth/azad-oversized-kurta-1.svg",
      "/cloth/azad-oversized-kurta-2.svg",
      "/cloth/azad-oversized-kurta-3.svg",
    ],
    description:
      "The widest cut we make. Dropped shoulders, long body, sleeves you can push up and leave there.",
    details: [
      "Heavy cotton, oversized fit — size down if you want it closer",
      "Dropped shoulder, full sleeve",
      "Length 48 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "hawa-wide-pants",
    name: "Hawa wide pants",
    urdu: null,
    collection: "azad",
    price: 2300,
    stock: 26,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", hex: "#3A3A3A" },
      { name: "Tea", hex: "#B9A489" },
    ],
    photos: ["/cloth/hawa-wide-pants-1.svg", "/cloth/hawa-wide-pants-2.svg"],
    description:
      "Wide through the leg, flat at the front, elastic only at the back. They read as trousers and feel like nothing.",
    details: [
      "Cotton twill",
      "Half elastic waist, two side pockets",
      "Inseam 39 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "baadal-oversized-shirt",
    name: "Baadal oversized shirt",
    urdu: null,
    collection: "azad",
    price: 3100,
    stock: 11,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Chalk", hex: "#EDE7DD" },
      { name: "Fog", hex: "#CFCCC4" },
    ],
    photos: [
      "/cloth/baadal-oversized-shirt-1.svg",
      "/cloth/baadal-oversized-shirt-2.svg",
    ],
    description:
      "A long shirt that works open over a kurta or closed on its own. The one piece in this collection that goes with everything else in it.",
    details: [
      "Cotton poplin, oversized fit",
      "Curved hem, chest pocket",
      "Length 36 inches",
      "Machine wash cold",
    ],
  },
  {
    slug: "rozana-week-bundle",
    name: "Rozana week bundle",
    urdu: null,
    collection: "bundles",
    price: 6200,
    stock: 8,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Mixed neutrals", hex: "#D8C7A6" }],
    photos: [
      "/cloth/rozana-week-bundle-1.svg",
      "/cloth/rozana-week-bundle-2.svg",
    ],
    description:
      "Three Rozana kurtas — undyed, sage and clay — for less than buying them apart. Pick one size for all three.",
    details: [
      "Three kurtas: Suti, Dhoop and Sada",
      "Saves PKR 300 against buying separately",
      "One size across the bundle",
      "Ships free",
    ],
  },
  {
    slug: "ghar-rest-bundle",
    name: "Ghar rest bundle",
    urdu: null,
    collection: "bundles",
    price: 5900,
    stock: 6,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Fog and sage", hex: "#B9C0B4" }],
    photos: ["/cloth/ghar-rest-bundle-1.svg", "/cloth/ghar-rest-bundle-2.svg"],
    description:
      "Two home sets so one can be in the wash while you wear the other. That is the entire idea.",
    details: [
      "Two sets: Neend and Subah",
      "Saves PKR 200 against buying separately",
      "One size across the bundle",
      "Ships free",
    ],
  },
  {
    slug: "azad-statement-bundle",
    name: "Azad statement bundle",
    urdu: null,
    collection: "bundles",
    price: 7200,
    stock: 5,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Charcoal and chalk", hex: "#8C8478" }],
    photos: [
      "/cloth/azad-statement-bundle-1.svg",
      "/cloth/azad-statement-bundle-2.svg",
    ],
    description:
      "The oversized kurta, the wide pants and the long shirt. Worn together they are an outfit; apart they each carry a week.",
    details: [
      "Three pieces: Azad kurta, Hawa pants, Baadal shirt",
      "Saves PKR 600 against buying separately",
      "One size across the bundle",
      "Ships free",
    ],
  },
];

const row = (p: (typeof products)[number], position: number) => ({
  slug: p.slug,
  name: p.name,
  urdu: p.urdu,
  collection: p.collection,
  price: p.price,
  stock: p.stock,
  description: p.description,
  sizes: JSON.stringify(p.sizes),
  colors: JSON.stringify(p.colors),
  photos: JSON.stringify(p.photos),
  details: JSON.stringify(p.details),
  active: true,
  position,
});

async function main() {
  for (const [index, product] of products.entries()) {
    const data = row(product, index + 1);
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: data,
      update: data,
    });
  }
  const count = await prisma.product.count();
  console.log(`Catalogue ready: ${count} pieces in the database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
