import { describe, expect, it } from "vitest";
import { buildThemeReportHtml } from "./themeReport";
import type { BaziInput, BaziResult } from "./bazi";
import type { FortuneContrast } from "./fortuneContrast";
import type { LifeTheme } from "./lifeThemes";

const result = {
  originalTime: "1990-01-27 00:00",
  correctedTime: "1990-01-26 23:45",
  longitude: 116.407396123456,
  latitude: 39.904201987654,
  daYun: [{ ganzhi: "庚寅", startAge: "21", endAge: "30", startYear: "2011" }],
  pillars: [
    { key: "year", label: "年柱", ganzhi: "己巳", stem: "己", branch: "巳", wuxing: "土火", naYin: "大林木", stemShiShen: "偏财", hiddenGan: ["丙", "庚", "戊"], branchShiShen: ["食神", "七杀", "偏财"], diShi: "病" },
    { key: "month", label: "月柱", ganzhi: "辛酉", stem: "辛", branch: "酉", wuxing: "金金", naYin: "石榴木", stemShiShen: "正官", hiddenGan: ["辛"], branchShiShen: ["正官"], diShi: "胎" },
    { key: "day", label: "日柱", ganzhi: "甲寅", stem: "甲", branch: "寅", wuxing: "木木", naYin: "大溪水", stemShiShen: "日主", hiddenGan: ["甲", "丙", "戊"], branchShiShen: ["比肩", "食神", "偏财"], diShi: "临官" },
    { key: "hour", label: "时柱", ganzhi: "壬子", stem: "壬", branch: "子", wuxing: "水水", naYin: "桑柘木", stemShiShen: "偏印", hiddenGan: ["癸"], branchShiShen: ["正印"], diShi: "沐浴" },
  ],
} as BaziResult;

const input: BaziInput = { datetime: "1990-01-27T00:00", longitude: 116.4074, latitude: 39.9042, gender: "male" };

const contrast = {
  targetYear: 2026,
  activeDaYun: { ganzhi: "庚寅", startAge: "21", endAge: "30", startYear: "2011" },
  flowYear: "丙午",
  title: "大运与流年对照",
  evidence: "阅读索引：当前大运 庚寅；所选流年 丙午。",
  focus: "并列回看优先级。",
  boundary: "不预测事件。",
} as FortuneContrast;

const themes = [{ key: "career", title: "事业与路径", label: "WORK & PATH", focus: "技能与节奏。", question: "什么值得练习？", action: "完成一个小成果。", evidence: "月柱索引。", boundary: "不预测职业结果。" }] as LifeTheme[];

describe("buildThemeReportHtml", () => {
  it("includes saved theme context and notes while intentionally excluding a detailed residence", () => {
    const html = buildThemeReportHtml({
      archiveId: 7,
      profile: { name: "王二小", birthPlace: "北京市", year: 2026 },
      result,
      input,
      locale: "zh-CN",
      openMonths: [9],
      themes,
      contrast,
      notes: [{ themeKey: "career", content: "回顾：<script>不执行</script>" }],
    });

    expect(html).toContain("庚寅");
    expect(html).toContain("丙午");
    expect(html).toContain("农历九月");
    expect(html).toContain("流月命局阅读");
    expect(html).toContain("命局落点");
    expect(html).toContain("回顾：&lt;script&gt;不执行&lt;/script&gt;");
    expect(html).toContain("不包含现居详细地址");
    expect(html).not.toContain("某街道 123 号");
  });
});
