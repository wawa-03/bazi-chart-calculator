import type { BaziResult } from "@/lib/bazi";
import type { FortuneContrast } from "@/lib/fortuneContrast";
import type { LifeTheme } from "@/lib/lifeThemes";
import { manualEntry, manualMonth, type ManualLocale } from "@/lib/manualLanguage";

export type ThemeReportInput = {
  archiveId: number;
  profile: { name: string; birthPlace: string; year: number };
  result: BaziResult;
  locale: ManualLocale;
  openMonths: number[];
  themes: LifeTheme[];
  contrast: FortuneContrast;
  notes: Array<{ themeKey: string; content: string; updatedAt?: Date | string }>;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function reportCopy(locale: ManualLocale) {
  if (locale === "en") return { title: "Guanli · Complete theme report", chart: "Four Pillars", monthly: "Future lunar volumes", contrast: "Da Yun and flow-year context", themes: "Personal themes", notes: "Private reflection notes", privacy: "Detailed current address is intentionally excluded from this export.", method: "This report is for cultural research and reflection. It is not a certain prediction or a medical, legal, investment, insurance, lending, trading, or life-decision recommendation." };
  if (locale === "zh-TW") return { title: "觀曆 · 完整主題報告", chart: "四柱排盤", monthly: "未來月卷", contrast: "大運與流年對照", themes: "人生主題", notes: "私人回顧筆記", privacy: "本匯出刻意不包含現居詳細地址。", method: "本報告僅供文化研究與反思，不構成確定預言、醫療、法律、投資、保險、借貸、交易或人生決策建議。" };
  return { title: "观历 · 完整主题报告", chart: "四柱排盘", monthly: "未来月卷", contrast: "大运与流年对照", themes: "人生主题", notes: "私有回顾笔记", privacy: "本导出刻意不包含现居详细地址。", method: "本报告仅供文化研究与反思，不构成确定预言、医疗、法律、投资、保险、借贷、交易或人生决策建议。" };
}

export function buildThemeReportHtml(input: ThemeReportInput) {
  const copy = reportCopy(input.locale);
  const name = input.profile.name.trim() || (input.locale === "en" ? "Unsigned" : "未署名");
  const noteByTheme = new Map(input.notes.map((note) => [note.themeKey, note.content]));
  const pillarRows = input.result.pillars.map((pillar) => `<tr><th>${escapeHtml(pillar.label)}</th><td>${escapeHtml(pillar.ganzhi)}</td><td>${escapeHtml(pillar.stemShiShen)}</td><td>${escapeHtml(pillar.hiddenGan.join("、") || "—")}</td></tr>`).join("");
  const monthSections = input.openMonths.map((month) => {
    const entry = manualEntry(input.locale, month - 1);
    return `<article><h3>${escapeHtml(manualMonth(input.locale, month - 1))} · ${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.focus)}</p><p><b>${input.locale === "en" ? "Question" : "问题"}：</b>${escapeHtml(entry.prompt)}</p><p><b>${input.locale === "en" ? "Light action" : "轻量行动"}：</b>${escapeHtml(entry.note)}</p></article>`;
  }).join("");
  const themeSections = input.themes.map((theme) => `<article><h3>${escapeHtml(theme.title)}</h3><p>${escapeHtml(theme.focus)}</p><p><b>${input.locale === "en" ? "Question" : "一个问题"}：</b>${escapeHtml(theme.question)}</p><p><b>${input.locale === "en" ? "Action" : "一个小行动"}：</b>${escapeHtml(theme.action)}</p><p><b>${input.locale === "en" ? "Reading index" : "阅读索引"}：</b>${escapeHtml(theme.evidence)}</p><p class="boundary">${escapeHtml(theme.boundary)}</p>${noteByTheme.has(theme.key) ? `<section class="note"><b>${copy.notes}</b><p>${escapeHtml(noteByTheme.get(theme.key) || "")}</p></section>` : ""}</article>`).join("");

  return `<!doctype html><html lang="${input.locale}"><head><meta charset="utf-8"><title>${escapeHtml(copy.title)}</title><style>body{max-width:880px;margin:0 auto;padding:48px 28px;color:#1d2628;background:#f7f3eb;font-family:system-ui,"Noto Sans SC",sans-serif;line-height:1.7}h1,h2,h3{font-family:Georgia,"Noto Serif SC",serif}h1{margin-bottom:4px}h2{margin-top:42px;border-top:1px solid #cfc5b6;padding-top:22px}article{margin:16px 0;padding:16px 18px;background:#fffdf8;border-left:3px solid #b4472d}p{margin:8px 0}table{width:100%;border-collapse:collapse;background:#fffdf8}th,td{padding:9px;border:1px solid #d9d0c4;text-align:left}.muted,.boundary{color:#69736e;font-size:.9em}.note{margin-top:14px;padding-top:12px;border-top:1px solid #ded6ca}.stamp{color:#a13d2a;font-size:.82em;letter-spacing:.1em}</style></head><body><p class="stamp">ARCHIVE #${input.archiveId}</p><h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(name)} · ${input.profile.year}${input.locale === "en" ? "" : " 年"}${input.profile.birthPlace ? ` · ${escapeHtml(input.profile.birthPlace)}` : ""}</p><p class="muted">${escapeHtml(copy.privacy)}</p><h2>${escapeHtml(copy.chart)}</h2><p>${escapeHtml(input.result.originalTime)} → ${escapeHtml(input.result.correctedTime)} · ${escapeHtml(String(input.result.longitude))}°, ${escapeHtml(String(input.result.latitude))}°</p><table><thead><tr><th>${input.locale === "en" ? "Pillar" : "柱"}</th><th>${input.locale === "en" ? "GanZhi" : "干支"}</th><th>${input.locale === "en" ? "Stem relation" : "天干十神"}</th><th>${input.locale === "en" ? "Hidden stems" : "地支藏干"}</th></tr></thead><tbody>${pillarRows}</tbody></table><h2>${escapeHtml(copy.contrast)}</h2><article><h3>${escapeHtml(input.contrast.activeDaYun?.ganzhi || "—")} · ${escapeHtml(input.contrast.flowYear)}</h3><p>${escapeHtml(input.contrast.focus)}</p><p><b>${input.locale === "en" ? "Reading index" : "阅读索引"}：</b>${escapeHtml(input.contrast.evidence)}</p><p class="boundary">${escapeHtml(input.contrast.boundary)}</p></article><h2>${escapeHtml(copy.monthly)}</h2>${monthSections || `<p class="muted">${input.locale === "en" ? "No future lunar volumes are available for this saved year." : "该已保存年份暂没有可读的未来月卷。"}</p>`}<h2>${escapeHtml(copy.themes)}</h2>${themeSections}<h2>${escapeHtml(copy.notes)}</h2><p class="muted">${input.notes.length ? input.notes.length : 0}${input.locale === "en" ? " saved theme note(s)." : " 条已保存的主题回顾笔记。"}</p><hr><p class="boundary">${escapeHtml(copy.method)}</p></body></html>`;
}

export function downloadThemeReport(input: ThemeReportInput) {
  const html = buildThemeReportHtml(input);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `观历-主题报告-${input.profile.year}-${input.archiveId}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
