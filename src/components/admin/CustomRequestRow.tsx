import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import { ago } from "@/lib/format";
import type { CustomDesignRequest } from "@/lib/types";
import StatusPill, { customRequestLooks } from "./StatusPill";

export default function CustomRequestRow({ request }: { request: CustomDesignRequest }) {
  return (
    <li className="rule">
      <Link
        href={`/admin/custom-requests/${request.id}`}
        className="flex items-center gap-4 py-4 transition-colors hover:bg-khaddar/50"
      >
        <div className="aspect-[3/4] w-12 shrink-0 overflow-hidden">
          <ClothImage src={request.stylePhoto} alt="" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{request.name}</span>
            <StatusPill look={customRequestLooks[request.status]} />
          </div>
          <p
            className="tnum mt-0.5 flex flex-wrap gap-x-4 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <span>{request.phone}</span>
            <span>Based on {request.styleName}</span>
            <span>{ago(request.createdAt)}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}
