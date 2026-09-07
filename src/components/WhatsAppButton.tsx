"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site";

/**
 * The floating way into WhatsApp.
 *
 * Most of this audience already shops over WhatsApp, so the channel gets a
 * permanent handle on every page rather than living only on /contact. The
 * message is seeded from where the shopper is standing, so the owner opens a
 * chat that already says what it is about.
 */

/* The glyph, not a lookalike: recognition is the entire point of putting a
   brand mark on the page, and a thin-stroke redraw in the site's own hand
   would read as a generic speech bubble. */
const WHATSAPP_GLYPH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";

export function WhatsAppGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={WHATSAPP_GLYPH} />
    </svg>
  );
}

/* Opening line by section. A shopper on /track wants one thing, and typing it
   out again on their phone is the friction that loses the message. */
function openingLine(pathname: string): string {
  if (pathname.startsWith("/track")) {
    return "Salam! I'd like an update on my order.";
  }
  if (pathname.startsWith("/cart")) {
    return "Salam! I have a question about something in my cart.";
  }
  if (pathname.startsWith("/shipping")) {
    return "Salam! I have a question about sizing and delivery.";
  }
  return "Salam! I have a question about Bilques.";
}

export default function WhatsAppButton() {
  const pathname = usePathname();

  /* Nothing floats over checkout. A shopper mid-payment does not need a second
     way to buy, and the confirmation page has its own celebration. */
  if (pathname.startsWith("/checkout")) return null;

  /* On phones the product page already parks a buy bar above the tab bar, and
     two fixed elements in the same corner is one too many. Desktop has the
     room, and the product page carries its own inline WhatsApp line either
     way. */
  const crowdedOnPhones = pathname.startsWith("/product/");

  return (
    <a
      href={whatsappLink(openingLine(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Bilques on WhatsApp"
      className={`group fixed right-4 bottom-tabbar z-50 mb-4 h-14 items-center gap-3 rounded-full bg-sage px-4 text-white shadow-lg transition-colors hover:bg-sage-deep md:right-6 md:bottom-6 md:mb-0 ${
        crowdedOnPhones ? "hidden md:flex" : "flex"
      }`}
    >
      <WhatsAppGlyph size={26} />
      {/* Collapsed to a circle until you reach for it: the label explains the
          icon on hover and focus without a permanent banner in the corner. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width] duration-300 ease-out group-hover:max-w-40 group-focus-visible:max-w-40 motion-reduce:transition-none">
        Message us
      </span>
    </a>
  );
}
