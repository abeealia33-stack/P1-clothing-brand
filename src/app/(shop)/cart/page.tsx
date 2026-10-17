import { getCollectionNames } from "@/lib/settings";
import CartView from "./CartView";
import { noIndex } from "@/lib/seo";

export const metadata = { title: "Cart", robots: noIndex };

/**
 * The basket lives in the shopper's browser, so the cart itself is a client
 * view. This half runs on the server for one thing: what the collections are
 * called now, for the empty cart's suggestion of where to start.
 */
export default async function CartPage() {
  return <CartView names={await getCollectionNames()} />;
}
