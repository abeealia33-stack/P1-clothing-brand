import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * These run against a throwaway copy of the development database, same
 * setup as orders-db.test.ts.
 */

const workDir = mkdtempSync(path.join(tmpdir(), "bilques-test-"));
const dbFile = path.join(workDir, "test.db");

type CustomRequestsModule = typeof import("./custom-requests-db");
type PrismaModule = typeof import("./prisma");

let customRequests: CustomRequestsModule;
let prisma: PrismaModule["prisma"];
let product: { id: string; name: string };

beforeAll(async () => {
  copyFileSync(path.resolve(import.meta.dirname, "../../dev.db"), dbFile);
  process.env.DATABASE_URL = `file:${dbFile}`;

  prisma = (await import("./prisma")).prisma;
  customRequests = await import("./custom-requests-db");
  product = await prisma.product.findFirstOrThrow({ select: { id: true, name: true } });
});

afterAll(async () => {
  await prisma?.$disconnect();
  rmSync(workDir, { recursive: true, force: true });
});

function draft() {
  return {
    styleProductId: product.id,
    styleName: product.name,
    stylePhoto: "/cloth/test.svg",
    measurements: {
      heightCm: 175,
      weightKg: 70,
      chestIn: 40,
      waistIn: 34,
      shoulderIn: 18,
      sleeveIn: 25,
    },
    name: "Test Customer",
    phone: "03001112233",
  };
}

describe("createCustomRequest", () => {
  it("starts a request in the new status with no measurement lost", async () => {
    const request = await customRequests.createCustomRequest(draft());
    expect(request.status).toBe("new");
    expect(request.measurements.chestIn).toBe(40);
    expect(request.styleName).toBe(product.name);
  });
});

describe("listCustomRequests", () => {
  it("filters by status", async () => {
    const request = await customRequests.createCustomRequest(draft());
    await customRequests.setCustomRequestStatus(request.id, "contacted");

    const contacted = await customRequests.listCustomRequests("contacted");
    expect(contacted.some((r) => r.id === request.id)).toBe(true);

    const closed = await customRequests.listCustomRequests("closed");
    expect(closed.some((r) => r.id === request.id)).toBe(false);
  });
});

describe("setCustomRequestStatus", () => {
  it("moves a request from new to contacted to closed", async () => {
    const request = await customRequests.createCustomRequest(draft());

    await customRequests.setCustomRequestStatus(request.id, "contacted");
    expect((await customRequests.getCustomRequest(request.id))?.status).toBe(
      "contacted"
    );

    await customRequests.setCustomRequestStatus(request.id, "closed");
    expect((await customRequests.getCustomRequest(request.id))?.status).toBe(
      "closed"
    );
  });
});
