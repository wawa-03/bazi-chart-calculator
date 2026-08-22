import { describe, expect, it } from "vitest";
import { buildThemeReportHtml } from "./themeReport";
import type { BaziResult } from "./bazi";
import type { FortuneContrast } from "./fortuneContrast";
import type { LifeTheme } from "./lifeThemes";

const result = {
  originalTime: "1990-01-27 00:00",
  correctedTime: "1990-01-26 23:45",
  longitude: 116.407396123456,
  latitude: 39.904201987654,
  pillars: [{ label: "年柱", ganzhi: "己巳", stemShiShen: "偏财", hiddenGan: ["丙", "戊"] }],
} as BaziResult;

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
      locale: "zh-CN",
      openMonths: [9],
      themes,
      contrast,
      notes: [{ themeKey: "career", content: "回顾：<script>不执行</script>" }],
    });

    expect(html).toContain("庚寅");
    expect(html).toContain("丙午");
    expect(html).toContain("农历九月");
    expect(html).toContain("回顾：&lt;script&gt;不执行&lt;/script&gt;");
    expect(html).toContain("不包含现居详细地址");
    expect(html).not.toContain("某街道 123 号");
  });
});
