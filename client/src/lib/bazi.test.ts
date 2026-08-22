import { describe, expect, it } from "vitest";
import { calculateBazi, formatCoordinate } from "./bazi";

describe("coordinate precision", () => {
  it("keeps high-precision longitude and latitude through a chart calculation", () => {
    const longitude = 116.407396123456;
    const latitude = 39.904201987654;
    const result = calculateBazi({ datetime: "1990-01-27T00:00", longitude, latitude, gender: "male" });

    expect(result.longitude).toBe(longitude);
    expect(result.latitude).toBe(latitude);
    expect(formatCoordinate(result.longitude)).toBe(String(longitude));
  });

  it("accepts valid coordinates outside the former China-only range", () => {
    const result = calculateBazi({ datetime: "1990-01-27T00:00", longitude: -74.0060154321, latitude: 40.7128123456, gender: "female" });

    expect(result.longitude).toBe(-74.0060154321);
    expect(result.latitude).toBe(40.7128123456);
  });
});
