import "server-only";

import { prisma } from "./prisma";
import { isCustomRequestStatus } from "./types";
import type { CustomDesignRequest, CustomMeasurements, CustomRequestStatus } from "./types";

type Row = {
  id: string;
  createdAt: Date;
  status: string;
  styleProductId: string | null;
  styleName: string;
  stylePhoto: string;
  heightCm: number;
  weightKg: number;
  chestIn: number;
  waistIn: number;
  shoulderIn: number;
  sleeveIn: number;
  notes: string | null;
  name: string;
  phone: string;
  city: string | null;
  styleProduct: { slug: string } | null;
};

const withStyleProduct = { styleProduct: { select: { slug: true as const } } };

function toRequest(row: Row): CustomDesignRequest {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    // Anything unrecognised is treated as new, so a request never silently
    // disappears from the inbox.
    status: isCustomRequestStatus(row.status) ? row.status : "new",
    styleProductId: row.styleProductId,
    styleSlug: row.styleProduct?.slug ?? null,
    styleName: row.styleName,
    stylePhoto: row.stylePhoto,
    measurements: {
      heightCm: row.heightCm,
      weightKg: row.weightKg,
      chestIn: row.chestIn,
      waistIn: row.waistIn,
      shoulderIn: row.shoulderIn,
      sleeveIn: row.sleeveIn,
    },
    notes: row.notes,
    name: row.name,
    phone: row.phone,
    city: row.city,
  };
}

export type CustomRequestDraft = {
  styleProductId: string | null;
  styleName: string;
  stylePhoto: string;
  measurements: CustomMeasurements;
  notes?: string;
  name: string;
  phone: string;
  city?: string;
};

export async function createCustomRequest(
  draft: CustomRequestDraft
): Promise<CustomDesignRequest> {
  const row = await prisma.customDesignRequest.create({
    data: {
      styleProductId: draft.styleProductId,
      styleName: draft.styleName,
      stylePhoto: draft.stylePhoto,
      heightCm: draft.measurements.heightCm,
      weightKg: draft.measurements.weightKg,
      chestIn: draft.measurements.chestIn,
      waistIn: draft.measurements.waistIn,
      shoulderIn: draft.measurements.shoulderIn,
      sleeveIn: draft.measurements.sleeveIn,
      notes: draft.notes ?? null,
      name: draft.name,
      phone: draft.phone,
      city: draft.city ?? null,
    },
    include: withStyleProduct,
  });
  return toRequest(row);
}

export async function listCustomRequests(
  status?: CustomRequestStatus
): Promise<CustomDesignRequest[]> {
  const rows = await prisma.customDesignRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: withStyleProduct,
    take: 200,
  });
  return rows.map(toRequest);
}

export async function getCustomRequest(id: string): Promise<CustomDesignRequest | null> {
  const row = await prisma.customDesignRequest.findUnique({
    where: { id },
    include: withStyleProduct,
  });
  return row ? toRequest(row) : null;
}

export async function setCustomRequestStatus(id: string, status: CustomRequestStatus) {
  await prisma.customDesignRequest.update({ where: { id }, data: { status } });
}

export async function countNewCustomRequests(): Promise<number> {
  return prisma.customDesignRequest.count({ where: { status: "new" } });
}
