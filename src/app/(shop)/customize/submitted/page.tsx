import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCustomRequest } from "@/lib/custom-requests-db";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Request sent" };

export default async function CustomRequestSubmittedPage() {
  const store = await cookies();
  const own = store.get("bilques_custom_request")?.value;
  const request = own ? await getCustomRequest(own) : null;

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-4xl">We cannot show that request here</h1>
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          This page only opens on the device that sent it in. Message us on
          WhatsApp if you need to check on it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/customize" className="btn btn-ink">
            Start a custom request
          </Link>
          <a href={whatsappLink("Salam! I sent in a custom design request.")} className="btn btn-quiet">
            Message on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
        شکریہ
      </p>
      <h1 className="settle mt-1 text-5xl md:text-6xl">Request sent</h1>
      <p className="measure mt-4">
        Thank you, {request.name.split(" ")[0]}. We will call{" "}
        <span className="tnum">{request.phone}</span> to talk through your
        measurements and agree a price. Nothing has been charged yet.
      </p>

      <div className="mt-8 p-5" style={{ background: "var(--color-khaddar)" }}>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Based on
        </p>
        <p className="mt-1 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          {request.styleName}
        </p>
      </div>

      <div className="mt-9 flex flex-wrap gap-3">
        <a
          href={whatsappLink(
            `Salam! I just sent in a custom design request based on ${request.styleName}.`
          )}
          className="btn btn-ink"
        >
          Message us on WhatsApp
        </a>
        <Link href="/shop" className="btn btn-quiet">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
