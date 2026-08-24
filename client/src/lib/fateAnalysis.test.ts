import { describe, expect, it } from "vitest";
import { deriveFateAnalysis, deriveMonthReading, deriveThreeYearComparison } from "./fateAnalysis";
import { calculateBazi, type BaziInput, type BaziResult } from "./bazi";

const input: BaziInput = {
  datetime: "1990-01-27T12:00",
  longitude: 116.4074,
  latitude: 39.9042,
  gender: "male",
};

const result: BaziResult = {
  originalTime: "1990-01-27 12:00",
  correctedTime: "1990-01-27 11:45",
  correctionMinutes: -15,
  longitude: 116.4074,
  latitude: 39.9042,
  lunarText: "示例",
  currentJieQi: "大寒",
  previousJie: "小寒",
  nextJie: "立春",
  taiYuan: "壬子",
  mingGong: "甲寅",
  shenGong: "乙卯",
  direction: "逆排",
  startYunText: "7年",
  startYunDate: "1997-01-27",
  dayBoundaryNote: "示例",
  daYun: [
    { ganzhi: "己未", startAge: "34", endAge: "43", startYear: "2024" },
    { ganzhi: "戊午", startAge: "44", endAge: "53", startYear: "2034" },
  ],
  pillars: [
    { key: "year", label: "年柱", ganzhi: "庚申", stem: "庚", branch: "申", wuxing: "金金", naYin: "石榴木", stemShiShen: "七杀", hiddenGan: ["庚", "壬", "戊"], branchShiShen: ["七杀", "偏印", "偏财"], diShi: "绝" },
    { key: "month", label: "月柱", ganzhi: "辛酉", stem: "辛", branch: "酉", wuxing: "金金", naYin: "石榴木", stemShiShen: "正官", hiddenGan: ["辛"], branchShiShen: ["正官"], diShi: "胎" },
    { key: "day", label: "日柱", ganzhi: "甲寅", stem: "甲", branch: "寅", wuxing: "木木", naYin: "大溪水", stemShiShen: "日主", hiddenGan: ["甲", "丙", "戊"], branchShiShen: ["比肩", "食神", "偏财"], diShi: "临官" },
    { key: "hour", label: "时柱", ganzhi: "壬子", stem: "壬", branch: "子", wuxing: "水水", naYin: "桑柘木", stemShiShen: "偏印", hiddenGan: ["癸"], branchShiShen: ["正印"], diShi: "沐浴" },
  ],
};

describe("deriveFateAnalysis", () => {
  it("先以月令和日主判断强弱，再产生喜用、合冲和大运依据", () => {
    const analysis = deriveFateAnalysis(result, input, "zh-CN", 2026);

    expect(analysis.dayMaster).toBe("甲");
    expect(analysis.monthCommand).toMatchObject({ branch: "酉", stem: "辛", tenGod: "正官" });
    expect(analysis.strength.label).toBe("偏弱");
    expect(analysis.useGod.favored).toEqual(expect.arrayContaining(["水", "木"]));
    expect(analysis.structure.interactions.join(" ")).toContain("年支申与日支寅冲");
    expect(analysis.currentLuck).toMatchObject({ ganzhi: "己未", tenGod: "正财" });
    expect(analysis.currentLuck.flowYear).toBe("丙午");
    expect(analysis.currentLuck.flowYearText).toContain("丙午流年");
    expect(analysis.finance.evidence).toContain("正财、偏财");
    expect(analysis.finance.boundary).toContain("不构成投资");
    expect(analysis.finance.boundary).toContain("医疗、法律");
    expect(analysis.career.fortune).toContain("丙午流年");
  });

  it("以年干起月干，结合命局与大运生成流月而非固定月度文案", () => {
    const entry = deriveMonthReading(result, input, 2026, 0, "zh-CN");

    expect(entry.title).toContain("庚寅月");
    expect(entry.title).toContain("七杀");
    expect(entry.focus).toContain("流月干庚");
    expect(entry.prompt).toContain("命局落点");
    expect(entry.evidence).toContain("己未大运");
  });

  it("不同命局在同一流月会落到不同的十神与依据", () => {
    const anotherInput: BaziInput = { datetime: "1988-06-15T10:30", longitude: 121.4737, latitude: 31.2304, gender: "female" };
    const anotherResult = calculateBazi(anotherInput);
    const first = deriveMonthReading(result, input, 2026, 8, "zh-CN");
    const second = deriveMonthReading(anotherResult, anotherInput, 2026, 8, "zh-CN");

    expect(second.evidence).toContain("流月");
    expect(second.prompt).toContain("命局落点");
    expect(second.note).not.toBe(first.note);
    expect(second.focus).not.toContain("先定下来");
  });

  it("以命局、喜用与大运并看当前流年和未来两年", () => {
    const comparison = deriveThreeYearComparison(result, input, "zh-CN", 2026);

    expect(comparison).toHaveLength(3);
    expect(comparison.map((item) => item.year)).toEqual([2026, 2027, 2028]);
    expect(comparison[0]).toMatchObject({ ganzhi: "丙午", tenGod: "食神", daYun: "己未" });
    expect(comparison[0]?.focus).toContain("丙午流年");
    expect(comparison[0]?.evidence).toContain("月令酉");
    expect(comparison[0]?.evidence).toContain("己未大运");
    expect(comparison.every((item) => ["supports", "needs-weighing", "contextual"].includes(item.alignment))).toBe(true);
  });
});
