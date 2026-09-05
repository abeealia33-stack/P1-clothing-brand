import "server-only";

import { prisma } from "./prisma";
import type { Category } from "./types";

/**
 * Every read and write of owner-created categories goes through here,
 * mirroring reels.ts. Distinct from the fixed Collections in types.ts —
 * these are whatever the owner makes, in whatever order they choose.
 */

const order = [{ position: "asc" as const }, { name: "asc" as const }];

export async function listCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: order });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { id } });
}

export async function isCategorySlugTaken(slug: string, exceptId?: string) {
  const row = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  return row !== null && row.id !== exceptId;
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  const last = await prisma.category.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return prisma.category.create({
    data: { name, slug, position: (last?.position ?? 0) + 1 },
  });
}

export async function renameCategory(id: string, name: string, slug: string): Promise<Category> {
  return prisma.category.update({ where: { id }, data: { name, slug } });
}

/** Products keep their other categories; only the link to this one is dropped. */
export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

export async function reorderCategory(id: string, direction: "up" | "down") {
  const all = await prisma.category.findMany({ orderBy: order, select: { id: true, position: true } });
  const index = all.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= all.length) return;

  const a = all[index];
  const b = all[swapWith];
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.category.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);
}
