import "server-only";

import { prisma } from "./prisma";
import type { CollectionSlug, PriceTier, Product, ProductColor, SortOption } from "./types";
import { isCollectionSlug } from "./types";

/**
 * Every read and write of the catalogue goes through here, so the JSON-in-text
 * columns are parsed in exactly one place and the rest of the app only ever
 * sees a proper `Product`.
 */

/** Every product query includes this, so `categoryIds` is always populated. */
const withCategories = { categories: { select: { id: true as const } } };

type Row = {
  id: string;
  slug: string;
  name: string;
  urdu: string | null;
  collection: string;
  price: number;
  stock: number;
  description: string;
  sizes: string;
  colors: string;
  photos: string;
  details: string;
  active: boolean;
  position: number;
  categories: { id: string }[];
};

/** A malformed column should blank one field, never break the whole shop. */
function parseList<T>(raw: string, fallback: T[]): T[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function toProduct(row: Row): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    urdu: row.urdu,
    collection: isCollectionSlug(row.collection)
      ? row.collection
      : ("rozana" as CollectionSlug),
    price: row.price,
    stock: row.stock,
    description: row.description,
    sizes: parseList<string>(row.sizes, []),
    colors: parseList<ProductColor>(row.colors, []),
    photos: parseList<string>(row.photos, []),
    details: parseList<string>(row.details, []),
    active: row.active,
    position: row.position,
    categoryIds: row.categories.map((c) => c.id),
  };
}

/** Newest-looking first within the owner's chosen order. */
const order = [{ position: "asc" as const }, { createdAt: "desc" as const }];

function priceWhere(tier?: PriceTier) {
  switch (tier) {
    case "under-2500":
      return { lt: 2500 };
    case "2500-5000":
      return { gte: 2500, lte: 5000 };
    case "over-5000":
      return { gt: 5000 };
    default:
      return undefined;
  }
}

function sortOrder(sort?: SortOption) {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" as const }];
    case "price-desc":
      return [{ price: "desc" as const }];
    default:
      return order;
  }
}

export async function listProducts(options?: {
  collection?: string;
  /** A category slug, distinct from `collection`. */
  category?: string;
  priceTier?: PriceTier;
  sort?: SortOption;
  /** Admin listings include retired pieces; the storefront never does. */
  includeInactive?: boolean;
}): Promise<Product[]> {
  const price = priceWhere(options?.priceTier);
  const rows = await prisma.product.findMany({
    where: {
      ...(options?.includeInactive ? {} : { active: true }),
      ...(options?.collection ? { collection: options.collection } : {}),
      ...(options?.category ? { categories: { some: { slug: options.category } } } : {}),
      ...(price ? { price } : {}),
    },
    orderBy: sortOrder(options?.sort),
    include: withCategories,
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { slug, active: true },
    include: withCategories,
  });
  return row ? toProduct(row) : null;
}

/** Admin lookup: finds retired pieces too. */
export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id }, include: withCategories });
  return row ? toProduct(row) : null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { collection: { contains: q } },
        { colors: { contains: q } },
      ],
    },
    orderBy: order,
    include: withCategories,
  });
  return rows.map(toProduct);
}

export async function newestProducts(limit: number): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: withCategories,
  });
  return rows.map(toProduct);
}

export async function relatedProducts(
  collection: string,
  excludeSlug: string,
  limit: number
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, collection, slug: { not: excludeSlug } },
    orderBy: order,
    take: limit,
    include: withCategories,
  });
  return rows.map(toProduct);
}

/* ---------------------------------------------------------------- writes -- */

export type ProductInput = {
  slug: string;
  name: string;
  urdu: string | null;
  collection: string;
  price: number;
  stock: number;
  description: string;
  sizes: string[];
  colors: ProductColor[];
  photos: string[];
  details: string[];
  active: boolean;
  categoryIds: string[];
};

const toRow = (input: ProductInput) => ({
  slug: input.slug,
  name: input.name,
  urdu: input.urdu,
  collection: input.collection,
  price: input.price,
  stock: input.stock,
  description: input.description,
  sizes: JSON.stringify(input.sizes),
  colors: JSON.stringify(input.colors),
  photos: JSON.stringify(input.photos),
  details: JSON.stringify(input.details),
  active: input.active,
});

export async function createProduct(input: ProductInput): Promise<Product> {
  const last = await prisma.product.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const row = await prisma.product.create({
    data: {
      ...toRow(input),
      position: (last?.position ?? 0) + 1,
      categories: { connect: input.categoryIds.map((id) => ({ id })) },
    },
    include: withCategories,
  });
  return toProduct(row);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  const row = await prisma.product.update({
    where: { id },
    data: {
      ...toRow(input),
      categories: { set: input.categoryIds.map((catId) => ({ id: catId })) },
    },
    include: withCategories,
  });
  return toProduct(row);
}

/**
 * Past orders keep their own copy of what was bought, so removing a piece here
 * cannot rewrite anyone's order history — the order item's product link simply
 * goes null.
 */
export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

export async function isSlugTaken(slug: string, exceptId?: string) {
  const row = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  return row !== null && row.id !== exceptId;
}

/**
 * Live pieces per collection, so the owner can see what hiding one would
 * actually take off the shop.
 */
export async function countProductsByCollection(): Promise<Record<string, number>> {
  const rows = await prisma.product.groupBy({
    by: ["collection"],
    where: { active: true },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.collection, r._count._all]));
}

/** Just the number the shop quotes, without the admin's other two counts. */
export const countLiveProducts = () => prisma.product.count({ where: { active: true } });

/**
 * The name and one photograph — all a picker needs, and all it should send.
 * The id is for pickers that store their choice, which have to survive the
 * piece being renamed; the slug is for ones that only link to it.
 */
export type ProductChoice = { id: string; slug: string; name: string; photo: string };

/**
 * For choosing a piece rather than reading about one. A full `Product` carries
 * the description, the details and every colour, parsed out of JSON columns
 * and then shipped to the phone; a picker shows a photograph and a name.
 */
export async function listProductChoices(): Promise<ProductChoice[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: order,
    select: { id: true, slug: true, name: true, photos: true },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    photo: parseList<string>(row.photos, [])[0] ?? "",
  }));
}

/**
 * The current address of each live piece in `ids`, keyed by id.
 *
 * Home page banners store the piece they point at by id, because a piece's
 * address is made from its name and changes when it is renamed. Hidden and
 * deleted pieces are simply absent, so a banner can tell it has nowhere to go.
 */
export async function liveProductSlugs(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, slug: true },
  });
  return new Map(rows.map((row) => [row.id, row.slug]));
}

/** Live pieces by id, for sections the owner fills by hand. Hidden ones are left out. */
export async function liveProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    include: withCategories,
  });
  return new Map(rows.map((row) => [row.id, toProduct(row)]));
}

export async function countProducts() {
  const [total, live, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: 0 } }),
  ]);
  return { total, live, outOfStock };
}
