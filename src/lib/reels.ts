import "server-only";

import { prisma } from "./prisma";

/**
 * Every read and write of the reels rail goes through here, mirroring
 * catalogue.ts — one place that shapes the database row into what the rest
 * of the app uses.
 */

export type Reel = {
  id: string;
  video: string;
  poster: string | null;
  caption: string | null;
  productId: string;
  productSlug: string;
  productName: string;
  active: boolean;
  position: number;
};

type Row = {
  id: string;
  video: string;
  poster: string | null;
  caption: string | null;
  productId: string;
  active: boolean;
  position: number;
  product: { slug: string; name: string };
};

const toReel = (row: Row): Reel => ({
  id: row.id,
  video: row.video,
  poster: row.poster,
  caption: row.caption,
  productId: row.productId,
  productSlug: row.product.slug,
  productName: row.product.name,
  active: row.active,
  position: row.position,
});

const order = [{ position: "asc" as const }, { createdAt: "desc" as const }];

export async function listReels(options?: {
  includeInactive?: boolean;
}): Promise<Reel[]> {
  const rows = await prisma.reel.findMany({
    where: options?.includeInactive ? {} : { active: true, product: { active: true } },
    orderBy: order,
    include: { product: { select: { slug: true, name: true } } },
  });
  return rows.map(toReel);
}

export async function getReelById(id: string): Promise<Reel | null> {
  const row = await prisma.reel.findUnique({
    where: { id },
    include: { product: { select: { slug: true, name: true } } },
  });
  return row ? toReel(row) : null;
}

export type ReelInput = {
  video: string;
  poster: string | null;
  caption: string | null;
  productId: string;
  active: boolean;
};

export async function createReel(input: ReelInput): Promise<Reel> {
  const last = await prisma.reel.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const row = await prisma.reel.create({
    data: { ...input, position: (last?.position ?? 0) + 1 },
    include: { product: { select: { slug: true, name: true } } },
  });
  return toReel(row);
}

export async function updateReel(id: string, input: ReelInput): Promise<Reel> {
  const row = await prisma.reel.update({
    where: { id },
    data: input,
    include: { product: { select: { slug: true, name: true } } },
  });
  return toReel(row);
}

export async function deleteReel(id: string): Promise<void> {
  await prisma.reel.delete({ where: { id } });
}

export async function reorderReel(id: string, direction: "up" | "down") {
  const all = await prisma.reel.findMany({
    orderBy: order,
    select: { id: true, position: true },
  });
  const index = all.findIndex((r) => r.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= all.length) return;

  const a = all[index];
  const b = all[swapWith];
  await prisma.$transaction([
    prisma.reel.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.reel.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);
}
