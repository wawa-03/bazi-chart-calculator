import { describe, expect, it } from "vitest";
import { resolveRequestLocale } from "./locale";

describe("resolveRequestLocale", () => {
  it("uses an explicit user preference before any inferred region", () => {
    expect(resolveRequestLocale({ "cf-ipcountry": "TW" }, "en")).toEqual({ locale: "en", source: "user-preference" });
  });

  it("maps only edge-provided country headers and never accepts raw IP headers", () => {
    expect(resolveRequestLocale({ "cf-ipcountry": "TW", "x-forwarded-for": "203.0.113.9" })).toEqual({ locale: "zh-TW", source: "edge-country" });
    expect(resolveRequestLocale({ "x-forwarded-for": "203.0.113.9", "accept-language": "en-US,en;q=0.9" })).toEqual({ locale: "en", source: "accept-language" });
  });

  it("falls back safely when no edge country or accepted language is present", () => {
    expect(resolveRequestLocale({})).toEqual({ locale: "zh-CN", source: "default" });
  });
});
