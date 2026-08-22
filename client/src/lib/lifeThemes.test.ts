import { describe, expect, it } from "vitest";
import { deriveLifeThemes } from "./lifeThemes";
import type { BaziResult } from "./bazi";

const result: BaziResult = {
  originalTime: "1990-01-27 00:00", correctedTime: "1990-01-26 23:45", correctionMinutes: -14, longitude: 116.4074, latitude: 39.9042,
  lunarText: "", currentJieQi: "", previousJie: "", nextJie: "白露", taiYuan: "", mingGong: "", shenGong: "", direction: "顺排", startYunText: "", startYunDate: "", daYun: [], dayBoundaryNote: "",
  pillars: [
    { key: "year", label: "年柱", ganzhi: "甲子", stem: "甲", branch: "子", wuxing: "木水", naYin: "", stemShiShen: "正财", hiddenGan: [], branchShiShen: ["偏财"], diShi: "" },
    { key: "month", label: "月柱", ganzhi: "乙丑", stem: "乙", branch: "丑", wuxing: "木土", naYin: "", stemShiShen: "正官", hiddenGan: [], branchShiShen: ["食神"], diShi: "" },
    { key: "day", label: "日柱", ganzhi: "丙寅", stem: "丙", branch: "寅", wuxing: "火木", naYin: "", stemShiShen: "比肩", hiddenGan: [], branchShiShen: ["劫财"], diShi: "" },
    { key: "hour", label: "时柱", ganzhi: "丁卯", stem: "丁", branch: "卯", wuxing: "火木", naYin: "", stemShiShen: "伤官", hiddenGan: [], branchShiShen: [], diShi: "" },
  ],
};

describe("deriveLifeThemes", () => {
  it("returns four non-deterministic themes grounded in visible pillar markers", () => {
    const themes = deriveLifeThemes(result, "zh-CN");
    expect(themes).toHaveLength(4);
    expect(themes.find((theme) => theme.key === "relationship")?.evidence).toContain("比肩");
    expect(themes.find((theme) => theme.key === "finance")?.evidence).toContain("正财");
    expect(themes.find((theme) => theme.key === "finance")?.boundary).toContain("不构成投资");
  });

  it("returns localised labels while keeping the same source markers", () => {
    const themes = deriveLifeThemes(result, "en");
    expect(themes.find((theme) => theme.key === "career")?.title).toBe("Work & path");
    expect(themes.find((theme) => theme.key === "career")?.evidence).toContain("正官");
  });
});
