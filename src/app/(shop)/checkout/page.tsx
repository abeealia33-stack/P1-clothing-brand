"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { useCart } from "@/components/useCart";
import { priceLabel, rupees } from "@/lib/format";
import { paymentMethods, type PaymentMethod } from "@/lib/types";
import { shippingFor } from "@/lib/shipping";
import { placeOrderAction } from "./actions";

type Errors = Partial<
  Record<"name" | "phone" | "address" | "city" | "payment" | "cart", string>
>;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);

  if (!ready) {
    return <div className="mx-auto max-w-2xl px-5 py-12" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-4xl">There is nothing to check out</h1>
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          Add a piece to your cart and come back here.
        </p>
        <Link href="/shop" className="btn btn-ink mt-6">
          Go to the shop
        </Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  /* Phone is the only way we can reach a customer about a COD order, so it is
     checked properly rather than left to the browser's loose tel validation. */
  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Tell us who to ask for at the door.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 12) {
      next.phone = "Enter a Pakistani mobile number, like 0300 1234567.";
    }
    if (address.trim().length < 10) {
      next.address = "House or flat number, street, and area — the courier needs all three.";
    }
    if (city.trim().length < 2) next.city = "Which city are we delivering to?";
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>("[data-error='true']")?.focus();
      return;
    }

    setPlacing(true);
    // The server re-prices everything and validates again — see actions.ts.
    const result = await placeOrderAction({
      name,
      phone,
      address,
      city,
      notes,
      payment,
      lines: lines.map((l) => ({
        slug: l.slug,
        size: l.size,
        color: l.color,
        qty: l.qty,
      })),
    });

    if (!result.ok) {
      setPlacing(false);
      setErrors(result.errors);
      document.querySelector<HTMLElement>("[data-error='true']")?.focus();
      return;
    }

    clear();
    router.push(`/checkout/confirmed?order=${encodeURIComponent(result.orderId)}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-5xl md:text-6xl">Checkout</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        One page, no account needed. We call before dispatch to confirm.
      </p>

      <form onSubmit={submit} noValidate className="mt-9">
        <fieldset className="border-0 p-0">
          <legend className="text-2xl">Where it is going</legend>

          <div className="mt-5 space-y-5">
            <FormField
              id="name"
              label="Your name"
              value={name}
              onChange={setName}
              error={errors.name}
              autoComplete="name"
            />
            <FormField
              id="phone"
              label="Mobile number"
              hint="We send order updates on WhatsApp to this number."
              value={phone}
              onChange={setPhone}
              error={errors.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
            />
            <FormField
              id="address"
              label="Delivery address"
              value={address}
              onChange={setAddress}
              error={errors.address}
              autoComplete="street-address"
              multiline
              placeholder="House 12, Street 4, Gulberg III"
            />
            <FormField
              id="city"
              label="City"
              value={city}
              onChange={setCity}
              error={errors.city}
              autoComplete="address-level2"
            />
            <FormField
              id="notes"
              label="Anything the courier should know"
              hint="Optional — a landmark, a gate code, a better time to call."
              value={notes}
              onChange={setNotes}
              multiline
            />
          </div>
        </fieldset>

        <fieldset className="rule mt-9 border-0 p-0 pt-7">
          <legend className="text-2xl">How you will pay</legend>
          <div className="mt-5 space-y-2">
            {paymentMethods.map((method) => {
              const on = payment === method.value;
              return (
                <label
                  key={method.value}
                  className="flex cursor-pointer gap-3 border p-4 transition-colors"
                  style={{
                    borderColor: on ? "var(--color-ink)" : "var(--color-line)",
                    background: on ? "var(--color-khaddar)" : "transparent",
                    opacity: method.available ? 1 : 0.5,
                    cursor: method.available ? "pointer" : "not-allowed",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={on}
                    disabled={!method.available}
                    onChange={() => setPayment(method.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-sage-deep)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{method.label}</span>
                    <span
                      className="block text-sm"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      {method.note}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <dl className="rule tnum mt-9 space-y-2 pt-7 text-sm">
          <div className="flex justify-between">
            <dt>
              {lines.reduce((n, l) => n + l.qty, 0)}{" "}
              {lines.reduce((n, l) => n + l.qty, 0) === 1 ? "piece" : "pieces"}
            </dt>
            <dd>{priceLabel(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Free" : `PKR ${rupees(shipping)}`}</dd>
          </div>
          <div className="rule flex justify-between pt-3 text-base">
            <dt>{payment === "cod" ? "To pay on delivery" : "Total"}</dt>
            <dd>{priceLabel(total)}</dd>
          </div>
        </dl>

        {errors.cart && (
          <p
            role="alert"
            className="measure mt-6 border p-4 text-sm"
            style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
          >
            {errors.cart}
          </p>
        )}

        <button type="submit" disabled={placing} className="btn btn-ink mt-7 w-full">
          {placing ? "Placing your order" : "Place order"}
        </button>
        <p className="mt-3 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
          You can cancel any time before dispatch by messaging us on WhatsApp.
        </p>
      </form>
    </div>
  );
}
