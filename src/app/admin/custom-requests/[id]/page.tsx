import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClothImage from "@/components/ClothImage";
import CustomRequestStatusPill from "@/components/admin/CustomRequestStatusPill";
import CustomRequestStatusButtons from "@/components/admin/CustomRequestStatusButtons";
import { requireAdmin } from "@/lib/auth";
import { getCustomRequest } from "@/lib/custom-requests-db";
import { measurementRanges } from "@/lib/types";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Custom request ${id}` };
}

export default async function AdminCustomRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const request = await getCustomRequest(id);
  if (!request) notFound();

  const message = `Salam ${request.name.split(" ")[0]}! This is Bilques about the custom piece you asked about.`;

  return (
    <div className="py-8">
      <Link
        href="/admin/custom-requests"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to custom requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl">{request.name}</h1>
        <CustomRequestStatusPill status={request.status} />
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Sent in{" "}
        {new Date(request.createdAt).toLocaleString("en-PK", {
          day: "numeric",
          month: "long",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      <CustomRequestStatusButtons requestId={request.id} status={request.status} />

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl">Reach them at</h2>
          <div className="mt-3 space-y-1">
            <p className="tnum">{request.phone}</p>
            {request.city && (
              <p style={{ color: "var(--color-ink-soft)" }}>{request.city}</p>
            )}
          </div>

          {request.notes && (
            <div
              className="mt-4 border-l-2 py-2 pl-3 text-sm"
              style={{ borderColor: "var(--color-sage)" }}
            >
              <span style={{ color: "var(--color-ink-soft)" }}>They added: </span>
              {request.notes}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${request.phone.replace(/\s/g, "")}`} className="btn btn-quiet">
              Call {request.name.split(" ")[0]}
            </a>
            <a href={whatsappLink(message)} className="btn btn-sage">
              WhatsApp
            </a>
          </div>

          <h2 className="mt-8 text-2xl">Starting from</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden">
              <ClothImage src={request.stylePhoto} alt="" />
            </div>
            {request.styleProductId ? (
              <Link
                href={`/admin/products/${request.styleProductId}`}
                className="underline underline-offset-4"
              >
                {request.styleName}
              </Link>
            ) : (
              <span style={{ color: "var(--color-ink-soft)" }}>
                {request.styleName} (no longer in the catalogue)
              </span>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl">Measurements</h2>
          <dl className="tnum mt-3 space-y-1.5 text-sm">
            {Object.entries(measurementRanges).map(([key, meta]) => (
              <div key={key} className="rule flex justify-between py-1.5">
                <dt style={{ color: "var(--color-ink-soft)" }}>{meta.label}</dt>
                <dd>
                  {request.measurements[key as keyof typeof request.measurements]}{" "}
                  {meta.unit}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
