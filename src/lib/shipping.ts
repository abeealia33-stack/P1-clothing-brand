import { site } from "./site";

/** Flat courier charge below the free-shipping threshold. */
export const SHIPPING_FLAT = 250;

export const shippingFor = (subtotal: number) =>
  subtotal >= site.freeShippingOver ? 0 : SHIPPING_FLAT;
