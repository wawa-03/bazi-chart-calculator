import { Solar } from "lunar-javascript";
import type { BaziResult } from "@/lib/bazi";
import type { ManualLocale } from "@/lib/manualLanguage";

export type FortuneContrast = {
  targetYear: number;
  activeDaYun: BaziResult["daYun"][number] | null;
  flowYear: string;
  title: string;
  evidence: string;
  focus: string;
  boundary: string;
};

function flowYearGanZhi(targetYear: number) {
  // July 1 is used only as a stable point after Li Chun for the selected year.
  return String(Solar.fromYmdHms(targetYear, 7, 1, 12, 0, 0).getLunar().getYearInGanZhiExact());
}

function activeDaYun(result: BaziResult, targetYear: number) {
  const cycles = result.daYun;
  if (!cycles.length) return null;
  const current = cycles.find((cycle, index) => {
    const start = Number(cycle.startYear);
    const nextStart = Number(cycles[index + 1]?.startYear ?? Infinity);
    return targetYear >= start && targetYear < nextStart;
  });
  return current || (targetYear < Number(cycles[0].startYear) ? cycles[0] : cycles[cycles.length - 1]);
}

export function deriveFortuneContrast(result: BaziResult, targetYear: number, locale: ManualLocale): FortuneContrast {
  const cycle = activeDaYun(result, targetYear);
  const flowYear = flowYearGanZhi(targetYear);
  const cycleLabel = cycle ? `${cycle.ganzhi}（${cycle.startYear}–${Number(cycle.startYear) + 9}）` : locale === "en" ? "not available" : locale === "zh-TW" ? "暫無資料" : "暂无资料";
  const title = locale === "en" ? "Da Yun and flow-year context" : locale === "zh-TW" ? "大運與流年對照" : "大运与流年对照";
  const evidence = locale === "en"
    ? `Index: Da Yun ${cycleLabel}; flow year ${flowYear}.`
    : locale === "zh-TW"
      ? `索引：大運 ${cycleLabel}；流年 ${flowYear}（立春後）。`
      : `索引：大运 ${cycleLabel}；流年 ${flowYear}（立春后）。`;
  const focus = locale === "en"
    ? "Use both to check priorities and pace."
    : locale === "zh-TW"
      ? "放在一起看重點和節奏。"
      : "放在一起看重点和节奏。";
  const boundary = locale === "en"
    ? "A reference, not a prediction."
    : locale === "zh-TW"
      ? "只作參考，不預測事件。"
      : "只作参考，不预测事件。";
  return { targetYear, activeDaYun: cycle, flowYear, title, evidence, focus, boundary };
}
