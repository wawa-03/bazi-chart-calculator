import { describe, expect, it } from "vitest";
import { deriveFortuneContrast } from "./fortuneContrast";
import type { BaziResult } from "./bazi";

const result = {
  daYun: [
    { ganzhi: "戊子", startAge: "1", endAge: "10", startYear: "1991" },
    { ganzhi: "己丑", startAge: "11", endAge: "20", startYear: "2001" },
    { ganzhi: "庚寅", startAge: "21", endAge: "30", startYear: "2011" },
  ],
} as BaziResult;

describe("deriveFortuneContrast", () => {
  it("pairs the selected year with the matching ten-year Da Yun and a post–Li Chun flow-year label", () => {
    const contrast = deriveFortuneContrast(result, 2006, "zh-CN");

    expect(contrast.activeDaYun?.ganzhi).toBe("己丑");
    expect(contrast.flowYear).toBe("丙戌");
    expect(contrast.evidence).toContain("立春后");
    expect(contrast.boundary).toContain("不预测事件");
  });

  it("keeps the same contrast model localized without presenting a prediction", () => {
    const contrast = deriveFortuneContrast(result, 2006, "en");

    expect(contrast.title).toBe("Da Yun and flow-year context");
    expect(contrast.boundary).toContain("not a prediction");
  });
});
