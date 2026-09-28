import { site } from "./site";

/** Flat courier charge below the free-shipping threshold. */
export const SHIPPING_FLAT = 250;

export const shippingFor = (subtotal: number) =>
  subtotal >= site.freeShippingOver ? 0 : SHIPPING_FLAT;

/** Whether an address gets the faster of the two courier windows. */
export function isFastCity(city: string): boolean {
  const asked = city.trim().toLowerCase();
  return site.shipping.fastCities.some((fast) => asked.includes(fast));
}

/**
 * When a parcel to this city should arrive, as two dates.
 *
 * Whole days from when the order was placed, which is how the courier quotes
 * it and how the shipping page already words it. Deliberately not clever
 * about weekends: the promise on the page is "days", and quietly meaning
 * something else would make the page and the parcel disagree.
 */
export function deliveryWindow(city: string, placed: Date): { from: Date; to: Date } {
  const [soon, late] = isFastCity(city) ? site.shipping.fastDays : site.shipping.restDays;
  const day = (n: number) => {
    const date = new Date(placed);
    date.setDate(date.getDate() + n);
    return date;
  };
  return { from: day(soon), to: day(late) };
}

/** "2 to 6 October", or "28 September to 2 October" across a month's end. */
export function deliveryWindowLabel(city: string, placed: Date): string {
  const { from, to } = deliveryWindow(city, placed);
  const month = (d: Date) => d.toLocaleDateString("en-PK", { month: "long" });
  const sameMonth = from.getMonth() === to.getMonth();
  return sameMonth
    ? `${from.getDate()} to ${to.getDate()} ${month(to)}`
    : `${from.getDate()} ${month(from)} to ${to.getDate()} ${month(to)}`;
}
