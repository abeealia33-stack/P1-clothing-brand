/** Prices are whole rupees everywhere — no paisa in this catalogue. */
export const rupees = (amount: number) => amount.toLocaleString("en-PK");

export const priceLabel = (amount: number) => `PKR ${rupees(amount)}`;

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

/** Spelled out, because "4 ways to get dressed" reads like a spec sheet. */
export const spellCount = (n: number): string =>
  ["No", "One", "Two", "Three", "Four"][n] ?? String(n);
