import "server-only";

import { prisma } from "./prisma";

/**
 * Site-wide settings, kept as one singleton row so the owner can change them
 * from the admin instead of editing code. Every read and write goes through
 * here, mirroring catalogue.ts and reels.ts.
 */

const SETTINGS_ID = "site";

export type PromoBanner = {
  image: string;
  heading: string;
  subtext: string;
  buttonLabel: string;
  href: string;
};

export type SiteSettings = {
  heroImages: string[];
  banners: PromoBanner[];
};

function parseArray<T>(raw: string): T[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) return { heroImages: [], banners: [] };

  return {
    heroImages: parseArray<string>(row.heroImages).filter((v) => typeof v === "string"),
    banners: parseArray<PromoBanner>(row.banners).filter(
      (b) => b && typeof b.image === "string" && typeof b.heading === "string"
    ),
  };
}

export async function saveSettings(input: SiteSettings): Promise<void> {
  const data = {
    heroImages: JSON.stringify(input.heroImages),
    banners: JSON.stringify(input.banners),
  };
  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
