import { rupees } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * The threshold is the single most persuasive number in the cart, so it gets
 * a plain sentence and a hairline that fills — not a badge or a progress
 * widget with its own visual language.
 */
export default function FreeShipMeter({ subtotal }: { subtotal: number }) {
  const target = site.freeShippingOver;
  const reached = subtotal >= target;
  const remaining = target - subtotal;
  const pct = Math.min(100, Math.round((subtotal / target) * 100));

  return (
    <div>
      <p className="tnum text-sm">
        {reached
          ? "Your order ships free."
          : `PKR ${rupees(remaining)} more and your order ships free.`}
      </p>
      <div
        className="mt-2 h-px w-full"
        style={{ background: "var(--color-line)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(subtotal, target)}
        aria-label="Progress toward free shipping"
      >
        <div
          className="h-px transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: reached ? "var(--color-sage-deep)" : "var(--color-sage)",
          }}
        />
      </div>
    </div>
  );
}
