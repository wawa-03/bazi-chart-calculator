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
    ? `Reading index: active Da Yun ${cycleLabel}; selected flow year ${flowYear}. The flow-year label is taken at a fixed post–Li Chun date in ${targetYear}.`
    : locale === "zh-TW"
      ? `閱讀索引：目前大運 ${cycleLabel}；所選流年 ${flowYear}。流年標記以 ${targetYear} 年立春後的固定日期取得。`
      : `阅读索引：当前大运 ${cycleLabel}；所选流年 ${flowYear}。流年标记以 ${targetYear} 年立春后的固定日期取得。`;
  const focus = locale === "en"
    ? "Use the longer ten-year cycle and selected year side by side to review priorities, commitments, and pacing before deciding what deserves attention."
    : locale === "zh-TW"
      ? "把十年大運與所選年份並列，用來回看優先順序、承諾與節奏，再決定什麼值得被照看。"
      : "把十年大运与所选年份并列，用来回看优先级、承诺与节奏，再决定什么值得被照看。";
  const boundary = locale === "en"
    ? "This comparison is a cultural-research index, not a prediction of events, relationships, income, health, or a decision recommendation."
    : locale === "zh-TW"
      ? "此對照是文化研究索引，不預測事件、關係、收入、健康，也不構成決策建議。"
      : "此对照是文化研究索引，不预测事件、关系、收入、健康，也不构成决策建议。";
  return { targetYear, activeDaYun: cycle, flowYear, title, evidence, focus, boundary };
}
