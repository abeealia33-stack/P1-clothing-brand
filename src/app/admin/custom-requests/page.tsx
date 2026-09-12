import type { Metadata } from "next";
import CustomRequestRow from "@/components/admin/CustomRequestRow";
import FilterChip from "@/components/admin/FilterChip";
import { requireAdmin } from "@/lib/auth";
import { listCustomRequests } from "@/lib/custom-requests-db";
import {
  customRequestStatusFlow,
  isCustomRequestStatus,
  type CustomRequestStatus,
} from "@/lib/types";

export const metadata: Metadata = { title: "Custom requests" };

/* New requests are what the owner is deciding what to do about, so this page
   is never served from a cache, same as the orders list. */
export const dynamic = "force-dynamic";

export default async function AdminCustomRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const filter: CustomRequestStatus | undefined =
    status && isCustomRequestStatus(status) ? status : undefined;

  const requests = await listCustomRequests(filter);

  return (
    <div className="py-6">
      <h1 className="text-2xl" style={{ color: "var(--color-admin-ink)" }}>
        Custom requests
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
        Measurements customers have sent in for a piece made to fit them.
        Nothing is charged yet — reach out to agree a price.
      </p>

      <nav aria-label="Filter requests" className="rail -mx-4 mt-8 gap-2 px-4 sm:mx-0 sm:px-0">
        <FilterChip href="/admin/custom-requests" active={!filter}>
          All
        </FilterChip>
        {customRequestStatusFlow.map((s) => (
          <FilterChip
            key={s.value}
            href={`/admin/custom-requests?status=${s.value}`}
            active={filter === s.value}
          >
            {s.label}
          </FilterChip>
        ))}
      </nav>

      {requests.length === 0 ? (
        <div
          className="mt-8 rounded-lg p-8 text-center"
          style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
        >
          <h2 className="text-2xl">
            {filter ? "Nothing in this pile" : "No custom requests yet"}
          </h2>
          <p className="measure mx-auto mt-2 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
            {filter
              ? "Try another filter, or look at all requests."
              : "When someone submits their measurements from the Custom design page, it appears here straight away."}
          </p>
        </div>
      ) : (
        <ul className="mt-6">
          {requests.map((request) => (
            <CustomRequestRow key={request.id} request={request} />
          ))}
        </ul>
      )}
    </div>
  );
}

