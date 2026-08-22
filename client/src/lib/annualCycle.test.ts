import { describe, expect, it } from "vitest";
import { getFutureLunarAccess } from "./annualCycle";

describe("getFutureLunarAccess", () => {
  it("opens only lunar September through December after the next jie is Bailu", () => {
    const access = getFutureLunarAccess(new Date(2026, 7, 22, 12, 0, 0), 2026);
    expect(access.nextJie).toBe("白露");
    expect(access.openMonths).toEqual([9, 10, 11, 12]);
  });

  it("allows the complete lunar-year preview for the following year", () => {
    const access = getFutureLunarAccess(new Date(2026, 7, 22, 12, 0, 0), 2027);
    expect(access.openMonths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
