import type { Product } from "./types";

/** Prices are whole rupees everywhere — no paisa in this catalogue. */
export const rupees = (amount: number) => amount.toLocaleString("en-PK");

export const priceLabel = (amount: number) => `PKR ${rupees(amount)}`;

/**
 * What a photograph of a piece is described as.
 *
 * A piece is saved with at least one colour, but a column that will not parse
 * comes back as no colours at all (see parseList in catalogue.ts) — and the
 * point of that fallback is that one bad row blanks a field rather than
 * taking down every page the piece appears on. So the colour is dropped from
 * the sentence rather than read out of an empty list.
 */
export const photoAlt = (product: Pick<Product, "name" | "colors">) =>
  product.colors[0] ? `${product.name} in ${product.colors[0].name}` : product.name;

/** How long ago, in the words someone would actually use. */
export function ago(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

/** The day and time an order or a request came in, as the admin shows it. */
export const dateTimeLabel = (iso: string) =>
  new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
