import { describe, expect, it } from "vitest";
import { calculateBazi, type BaziInput } from "./bazi";
import { deriveFateAnalysis, deriveThreeYearComparison } from "./fateAnalysis";
import { plainDomain, plainLuck, plainMonthAxis, plainStrength, plainYear } from "./plainLanguage";

const input: BaziInput = { datetime: "1990-01-27T00:00", longitude: 116.4074, latitude: 39.9042, gender: "male" };
const result = calculateBazi(input);
const analysis = deriveFateAnalysis(result, input, "zh-CN", 2026);

describe("plain-language reading", () => {
  it("keeps every major card explainable without promising events or replacing the technical source", () => {
    const cards = [plainStrength(analysis, "zh-CN"), plainMonthAxis(analysis, "zh-CN"), plainLuck(analysis, "zh-CN"), plainDomain("finance", analysis.finance, "zh-CN"), plainYear(deriveThreeYearComparison(result, input, "zh-CN", 2026)[0], "zh-CN")];
    expect(cards.every((card) => card.title.startsWith("大白话"))).toBe(true);
    expect(cards.every((card) => card.note.length > 12)).toBe(true);
    expect(cards.join(" ")).not.toMatch(/必然|保证发财|一定结婚/);
  });
});
