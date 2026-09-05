import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimit } from "./rate-limit";

describe("createRateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows callers up to the limit", () => {
    const limit = createRateLimit(3, 60_000);
    expect(limit.take("a")).toBe(true);
    expect(limit.take("a")).toBe(true);
    expect(limit.take("a")).toBe(true);
  });

  it("refuses the one past the limit", () => {
    const limit = createRateLimit(2, 60_000);
    limit.take("a");
    limit.take("a");
    expect(limit.take("a")).toBe(false);
  });

  it("counts each caller separately", () => {
    const limit = createRateLimit(1, 60_000);
    expect(limit.take("a")).toBe(true);
    expect(limit.take("b")).toBe(true);
    expect(limit.take("a")).toBe(false);
  });

  it("lets a caller back in once the window has passed", () => {
    const limit = createRateLimit(1, 60_000);
    limit.take("a");
    expect(limit.take("a")).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(limit.take("a")).toBe(true);
  });

  it("reports how long a blocked caller must wait", () => {
    const limit = createRateLimit(1, 60_000);
    limit.take("a");
    vi.advanceTimersByTime(20_000);
    expect(limit.retryAfter("a")).toBe(40);
  });

  it("reports no wait for a caller it has never seen", () => {
    expect(createRateLimit(1, 60_000).retryAfter("nobody")).toBe(0);
  });
});
