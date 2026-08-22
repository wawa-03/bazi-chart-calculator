import { describe, expect, it } from "vitest";
import { getAnnualWindow } from "./annualWindow";

describe("getAnnualWindow", () => {
  it("uses the Beijing timezone and opens lunar September through December after Bailu", () => {
    const window = getAnnualWindow(2026, new Date("2026-08-22T04:00:00.000Z"));
    expect(window).toMatchObject({ timezone: "Asia/Shanghai", currentYear: 2026, nextJie: "白露", startMonth: 9, openMonths: [9, 10, 11, 12] });
  });

  it("opens all months for a future target year and none for a past year", () => {
    const now = new Date("2026-08-22T04:00:00.000Z");
    expect(getAnnualWindow(2027, now).openMonths).toHaveLength(12);
    expect(getAnnualWindow(2025, now).openMonths).toEqual([]);
  });
});
