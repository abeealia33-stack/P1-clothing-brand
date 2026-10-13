import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/auth";
import { saveHomeBanners } from "@/lib/settings";
import { emptyHomeBanners } from "@/lib/banners";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveBannersAction } from "./actions";

const redirected = vi.hoisted(() => new Error("Redirected"));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/settings", () => ({ saveHomeBanners: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw redirected; }) }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
  vi.mocked(saveHomeBanners).mockResolvedValue(undefined);
});

function form(newInHeading: string) {
  const data = new FormData();
  data.set("banners", JSON.stringify({ ...emptyHomeBanners(), groupImage: "/group.jpg", newInHeading }));
  return data;
}

describe("renaming the latest-products section", () => {
  it("saves the renamed heading without losing other settings and refreshes both views", async () => {
    await expect(saveBannersAction({}, form("  New arrivals  "))).rejects.toBe(redirected);
    expect(saveHomeBanners).toHaveBeenCalledWith({
      ...emptyHomeBanners(), groupImage: "/group.jpg", newInHeading: "New arrivals",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/banners");
    expect(redirect).toHaveBeenCalledWith("/admin/banners?saved=1");
  });

  it("restores Just in when the saved name is blank", async () => {
    await expect(saveBannersAction({}, form("   "))).rejects.toBe(redirected);
    expect(saveHomeBanners).toHaveBeenCalledWith(expect.objectContaining({ newInHeading: "Just in" }));
  });

  it("does not write settings without admin authorization", async () => {
    const denied = new Error("Not signed in");
    vi.mocked(requireAdmin).mockRejectedValue(denied);
    await expect(saveBannersAction({}, form("New arrivals"))).rejects.toBe(denied);
    expect(saveHomeBanners).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
