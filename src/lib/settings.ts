import "server-only";

import { cache } from "react";
import { normaliseHomeBanners, emptyHomeBanners, type HomeBanners } from "./banners";
import { prisma } from "./prisma";
import {
  collections,
  navCollections,
  resolveCollections,
  transferMethods,
  type CollectionEdit,
  type CollectionEdits,
  type ResolvedCollection,
  type TransferMethod,
} from "./types";

/**
 * Site-wide settings, kept as one singleton row so the owner can change them
 * from the admin instead of editing code. Every read and write goes through
 * here, mirroring catalogue.ts and reels.ts.
 */

const SETTINGS_ID = "site";

/**
 * One account a customer can send money to. `bank` and `iban` only mean
 * anything for a bank transfer; a wallet has a number and nothing else.
 */
export type PaymentAccount = {
  /** The name the transfer must be made out to. */
  title: string;
  /** Account or wallet number, as the customer should type it. */
  number: string;
  bank?: string;
  iban?: string;
};

export type PaymentAccounts = Partial<Record<TransferMethod, PaymentAccount>>;

export type SiteSettings = {
  heroImages: string[];
  /** The strip of three cards and the pair of photos. See banners.ts. */
  banners: HomeBanners;
  /** Absent keys mean that method has no account set up yet. */
  payments: PaymentAccounts;
  /** Absent keys mean that collection reads as it does in the code. */
  collections: CollectionEdits;
};

function parseArray<T>(raw: string): T[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * An account is only usable if someone can actually be paid with it, so a row
 * missing the title or the number is treated as not set up rather than shown
 * half-filled to a customer holding their phone at a bank app.
 */
function normaliseAccounts(value: unknown): PaymentAccounts {
  if (!value || typeof value !== "object") return {};

  const source = value as Record<string, Partial<PaymentAccount> | undefined>;
  const accounts: PaymentAccounts = {};

  for (const method of transferMethods) {
    const row = source[method];
    if (!row) continue;
    const title = String(row.title ?? "").trim();
    const number = String(row.number ?? "").trim();
    if (!title || !number) continue;

    accounts[method] = {
      title,
      number,
      bank: String(row.bank ?? "").trim() || undefined,
      iban: String(row.iban ?? "").trim() || undefined,
    };
  }
  return accounts;
}

/**
 * Only the four known slugs are kept, and only the wording — anything else in
 * the column is ignored. Blank text is dropped rather than stored, so a
 * cleared field goes back to reading as it does in the code instead of
 * leaving a heading empty on the storefront.
 */
function normaliseCollections(value: unknown): CollectionEdits {
  if (!value || typeof value !== "object") return {};

  const source = value as Record<string, Partial<CollectionEdit> | undefined>;
  const edits: CollectionEdits = {};

  for (const { slug } of collections) {
    const row = source[slug];
    if (!row) continue;

    const edit: CollectionEdit = {};
    for (const field of ["name", "urdu", "line", "intro"] as const) {
      const text = String(row[field] ?? "").trim();
      if (text) edit[field] = text;
    }
    // Stored only when hidden: showing is the default, so an absent flag and a
    // true one mean the same thing.
    if (row.inNav === false) edit.inNav = false;

    if (Object.keys(edit).length > 0) edits[slug] = edit;
  }
  return edits;
}

/** A column that will not parse is treated as one nobody has filled in yet. */
function parseJson<T>(raw: string, normalise: (value: unknown) => T, fallback: T): T {
  try {
    return normalise(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

/**
 * Read once per request.
 *
 * The shop layout needs the collections for its menus and the page inside it
 * usually needs them too, so without this every storefront page would ask the
 * database for the same single row twice — which on a shared host with a
 * connection limit is worth avoiding for a value that cannot change mid-render.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) {
    return { heroImages: [], banners: emptyHomeBanners(), payments: {}, collections: {} };
  }

  return {
    heroImages: parseArray<string>(row.heroImages).filter((v) => typeof v === "string"),
    banners: parseJson(row.banners, normaliseHomeBanners, emptyHomeBanners()),
    payments: parseJson(row.payments, normaliseAccounts, {}),
    collections: parseJson(row.collections, normaliseCollections, {}),
  };
});

/**
 * The collections as the storefront should show them, already resolved.
 *
 * Callers wanted the pair of these every time — read the settings, then apply
 * the owner's edits — and going through here means a page cannot accidentally
 * list a collection the owner has hidden by reaching for the wrong one.
 */
export const getNavCollections = async (
  include?: string
): Promise<ResolvedCollection[]> =>
  navCollections((await getSettings()).collections, include);

/** All four, hidden ones included. For the admin, and for naming a piece. */
export const getAllCollections = async (): Promise<ResolvedCollection[]> =>
  resolveCollections((await getSettings()).collections);

/**
 * Each admin screen writes only its own column, so saving the collections
 * cannot blank the hero images and vice versa.
 */
export async function saveCollections(edits: CollectionEdits): Promise<void> {
  const collectionsJson = JSON.stringify(normaliseCollections(edits));
  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, collections: collectionsJson },
    update: { collections: collectionsJson },
  });
}

/** The home page banners, which have their own admin screen. */
export async function saveHomeBanners(banners: HomeBanners): Promise<void> {
  const bannersJson = JSON.stringify(normaliseHomeBanners(banners));
  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, banners: bannersJson },
    update: { banners: bannersJson },
  });
}

/** The hero and the payment accounts — the Site settings screen. */
export async function saveSettings(
  input: Pick<SiteSettings, "heroImages" | "payments">
): Promise<void> {
  const data = {
    heroImages: JSON.stringify(input.heroImages),
    // Normalised on the way in as well as out: the admin form is not the only
    // thing that could ever call this.
    payments: JSON.stringify(normaliseAccounts(input.payments)),
  };
  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
