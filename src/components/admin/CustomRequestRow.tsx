import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import type { CustomDesignRequest } from "@/lib/types";
import CustomRequestStatusPill from "./CustomRequestStatusPill";

/** How long ago, in the words someone would actually use. */
function ago(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

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
            <CustomRequestStatusPill status={request.status} />
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
