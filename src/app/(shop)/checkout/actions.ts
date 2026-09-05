"use server";

import { cookies } from "next/headers";
import { createOrder, OutOfStockError } from "@/lib/orders-db";
import { getProductBySlug } from "@/lib/catalogue";
import { paymentMethods, type PaymentMethod } from "@/lib/types";
import { shippingFor } from "@/lib/shipping";
import { orderableQty } from "@/lib/stock";

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; errors: Record<string, string> };

type IncomingLine = {
  slug: string;
  size: string;
  color: string;
  qty: number;
};

/**
 * Places the order.
 *
 * This is the only place an order is created, and it trusts nothing the
 * browser sent beyond which piece, size and colour were wanted: prices, the
 * shipping charge and the total are all recomputed here from the database.
 * A server action is reachable by direct POST, so the client-side form checks
 * are a convenience and these are the real ones.
 */
export async function placeOrderAction(input: {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment: string;
  lines: IncomingLine[];
}): Promise<CheckoutResult> {
  const errors: Record<string, string> = {};

  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const address = input.address?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const notes = input.notes?.trim() ?? "";

  if (name.length < 2) errors.name = "Tell us who to ask for at the door.";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) {
    errors.phone = "Enter a Pakistani mobile number, like 0300 1234567.";
  }
  if (address.length < 10) {
    errors.address =
      "House or flat number, street, and area — the courier needs all three.";
  }
  if (city.length < 2) errors.city = "Which city are we delivering to?";

  const method = paymentMethods.find((m) => m.value === input.payment);
  if (!method || !method.available) {
    errors.payment = "Choose a payment method we can accept right now.";
  }

  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    errors.cart = "Your cart is empty.";
    return { ok: false, errors };
  }

  // Re-price every line against the catalogue. A stale tab, an edited price in
  // the browser, or a piece retired since it was added all land here.
  const priced = [];
  for (const line of input.lines) {
    const product = await getProductBySlug(line.slug);
    if (!product) {
      errors.cart = `${line.slug} is no longer available. Remove it and try again.`;
      break;
    }
    const qty = orderableQty(line.qty, product.stock);
    if (qty === 0) {
      errors.cart = `${product.name} has just sold out.`;
      break;
    }
    if (!product.sizes.includes(line.size)) {
      errors.cart = `${product.name} is not made in size ${line.size}.`;
      break;
    }
    if (!product.colors.some((c) => c.name === line.color)) {
      errors.cart = `${product.name} does not come in ${line.color}.`;
      break;
    }
    priced.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: line.size,
      color: line.color,
      photo: product.photos[0] ?? "",
      qty,
    });
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const subtotal = priced.reduce((n, l) => n + l.price * l.qty, 0);
  const shipping = shippingFor(subtotal);

  let order;
  try {
    order = await createOrder({
      name,
      phone,
      address,
      city,
      notes: notes || undefined,
      payment: method!.value as PaymentMethod,
      lines: priced,
      subtotal,
      shipping,
      total: subtotal + shipping,
    });
  } catch (error) {
    // Someone else took the last piece between the repricing above and the
    // write. Nothing has been saved; say which piece and let them adjust.
    if (error instanceof OutOfStockError) {
      return {
        ok: false,
        errors: { cart: `${error.productName} sold out while you were checking out.` },
      };
    }
    throw error;
  }

  // Lets the confirmation page show this order in full without making order
  // numbers guessable — anyone else looking it up gets the tracking view.
  const store = await cookies();
  store.set("bilques_order", order.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { ok: true, orderId: order.id };
}
