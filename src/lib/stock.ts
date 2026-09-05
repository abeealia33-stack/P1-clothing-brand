/**
 * How many of a piece an order line may actually take.
 *
 * Separate from the database work in orders-db so the rule can be read and
 * tested on its own: a cart may ask for anything, and what it gets is a whole
 * number, at least one, no more than ten, and never more than is on the shelf.
 * Ten is the per-line ceiling the checkout has always applied; stock is the
 * new limit, and whichever is smaller wins.
 */
export const MAX_PER_LINE = 10;

export function orderableQty(requested: unknown, stock: number): number {
  const asked = Math.trunc(Number(requested) || 0);
  const wanted = Math.min(Math.max(asked, 1), MAX_PER_LINE);
  return Math.min(wanted, Math.max(stock, 0));
}
