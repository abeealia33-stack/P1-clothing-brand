import "server-only";

import { prisma } from "./prisma";
import { transferMethods, type TransferMethod } from "./types";

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
  banners: PromoBanner[];
  /** Absent keys mean that method has no account set up yet. */
  payments: PaymentAccounts;
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

function parseAccounts(raw: string): PaymentAccounts {
  try {
    return normaliseAccounts(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) return { heroImages: [], banners: [], payments: {} };

  return {
    heroImages: parseArray<string>(row.heroImages).filter((v) => typeof v === "string"),
    banners: parseArray<PromoBanner>(row.banners).filter(
      (b) => b && typeof b.image === "string" && typeof b.heading === "string"
    ),
    payments: parseAccounts(row.payments),
  };
}

export async function saveSettings(input: SiteSettings): Promise<void> {
  const data = {
    heroImages: JSON.stringify(input.heroImages),
    banners: JSON.stringify(input.banners),
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
