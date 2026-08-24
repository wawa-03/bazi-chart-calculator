import { describe, expect, it } from "vitest";
import { getAnnualWindow } from "./annualWindow";

describe("getAnnualWindow", () => {
  it("uses the Beijing timezone and opens lunar September through December after Bailu", () => {
    const window = getAnnualWindow(2026, new Date("2026-08-22T04:00:00.000Z"));
    expect(window).toMatchObject({ timezone: "Asia/Shanghai", currentYear: 2026, nextJie: "白露", startMonth: 9, openMonths: [9, 10, 11, 12] });
  });

  it("opens next year only after June in Beijing time and keeps past years closed", () => {
    const beforeJuly = new Date("2026-06-22T04:00:00.000Z");
    const afterJune = new Date("2026-08-22T04:00:00.000Z");
    expect(getAnnualWindow(2027, beforeJuly)).toMatchObject({ nextYearAvailable: false, openMonths: [] });
    expect(getAnnualWindow(2027, afterJune)).toMatchObject({ nextYearAvailable: true, openMonths: Array.from({ length: 12 }, (_, index) => index + 1) });
    expect(getAnnualWindow(2025, afterJune).openMonths).toEqual([]);
  });
});
