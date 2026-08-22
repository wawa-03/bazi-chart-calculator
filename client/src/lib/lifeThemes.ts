import type { BaziResult, Pillar } from "@/lib/bazi";
import type { ManualLocale } from "@/lib/manualLanguage";

export type LifeThemeKey = "relationship" | "career" | "finance" | "rhythm";

export type LifeTheme = {
  key: LifeThemeKey;
  title: string;
  label: string;
  focus: string;
  question: string;
  action: string;
  evidence: string;
  boundary: string;
};

type ThemeCopy = Omit<LifeTheme, "key" | "evidence">;

const COPY: Record<ManualLocale, Record<LifeThemeKey, ThemeCopy>> = {
  "zh-CN": {
    relationship: { title: "关系与亲密", label: "RELATIONSHIP", focus: "把关系放回具体互动：先说清需求、界限与可投入的时间。", question: "这一段关系里，我想被怎样理解，也愿意如何回应？", action: "选择一段重要沟通，先写下一个事实和一个感受，再决定是否表达。", boundary: "这不是婚恋结果、相合相冲或任何关系成败的判断。" },
    career: { title: "事业与路径", label: "WORK & PATH", focus: "把注意力放在技能、责任、协作与工作节奏，而非一次性定义职业走向。", question: "现在最值得我反复练习或明确边界的一项工作能力是什么？", action: "为本周选择一件可交付的小成果，并写下完成标准。", boundary: "这不是升职、离职、创业成功或职业结果的预测。" },
    finance: { title: "财务与资源", label: "MONEY & RESOURCES", focus: "把“财务”理解为资源流、承诺与风险暴露的核对，而不是收益预言。", question: "我能否清楚说出本月一项必要支出、一个承诺和一项风险？", action: "只做一次账目或合约核对；涉及投资、借贷或交易时，请以专业与事实信息为准。", boundary: "不构成投资、借贷、交易、保险或任何财务决策建议。" },
    rhythm: { title: "生活节奏", label: "DAILY RHYTHM", focus: "从精力、空间与恢复感入手，为日常留出可以重复的小节奏。", question: "哪一个时段最需要被保护，才能让生活不被事项推着走？", action: "为下一个节气前留出一段无安排时间，并只观察是否更容易恢复。", boundary: "这不是健康诊断、治疗建议或对人生状态的确定判断。" },
  },
  "zh-TW": {
    relationship: { title: "關係與親密", label: "RELATIONSHIP", focus: "把關係放回具體互動：先說清需求、界限與可投入的時間。", question: "這一段關係裡，我想被怎樣理解，也願意如何回應？", action: "選擇一段重要溝通，先寫下一個事實和一個感受，再決定是否表達。", boundary: "這不是婚戀結果、相合相沖或任何關係成敗的判斷。" },
    career: { title: "事業與路徑", label: "WORK & PATH", focus: "把注意力放在技能、責任、協作與工作節奏，而非一次性定義職業走向。", question: "現在最值得我反覆練習或明確邊界的一項工作能力是什麼？", action: "為本週選擇一件可交付的小成果，並寫下完成標準。", boundary: "這不是升職、離職、創業成功或職業結果的預測。" },
    finance: { title: "財務與資源", label: "MONEY & RESOURCES", focus: "把「財務」理解為資源流、承諾與風險暴露的核對，而不是收益預言。", question: "我能否清楚說出本月一項必要支出、一個承諾和一項風險？", action: "只做一次帳目或合約核對；涉及投資、借貸或交易時，請以專業與事實資訊為準。", boundary: "不構成投資、借貸、交易、保險或任何財務決策建議。" },
    rhythm: { title: "生活節奏", label: "DAILY RHYTHM", focus: "從精力、空間與恢復感入手，為日常留出可以重複的小節奏。", question: "哪一個時段最需要被保護，才能讓生活不被事項推著走？", action: "為下一個節氣前留出一段無安排時間，並只觀察是否更容易恢復。", boundary: "這不是健康診斷、治療建議或對人生狀態的確定判斷。" },
  },
  en: {
    relationship: { title: "Relationship & closeness", label: "RELATIONSHIP", focus: "Bring attention back to specific interactions: name needs, boundaries, and the time you can genuinely offer.", question: "In this relationship, how do I hope to be understood, and how am I willing to respond?", action: "For one important conversation, write one fact and one feeling before deciding whether to share them.", boundary: "This does not predict romance, compatibility, conflict, or the outcome of a relationship." },
    career: { title: "Work & path", label: "WORK & PATH", focus: "Attend to skills, responsibility, collaboration, and work rhythm instead of trying to define a whole career at once.", question: "Which ability is most worth practising or giving clearer boundaries right now?", action: "Choose one small deliverable for this week and write down what finished means.", boundary: "This does not predict promotion, resignation, entrepreneurship, or any career result." },
    finance: { title: "Money & resources", label: "MONEY & RESOURCES", focus: "Treat finance as a check of resource flow, commitments, and risk exposure—not a forecast of returns.", question: "Can I name one necessary cost, one commitment, and one risk this month?", action: "Do one review of accounts or an agreement; use professional and factual information for investing, lending, or trading.", boundary: "This is not investment, lending, trading, insurance, or any financial-decision advice." },
    rhythm: { title: "Daily rhythm", label: "DAILY RHYTHM", focus: "Start with energy, space, and recovery, then reserve a small rhythm that can be repeated.", question: "Which part of the day needs protecting so that tasks do not set the whole pace?", action: "Keep one unplanned period before the next solar term and only observe whether recovery becomes easier.", boundary: "This is not a health diagnosis, treatment recommendation, or certain judgment about life circumstances." },
  },
};

const MARKER_GROUPS: Record<Exclude<LifeThemeKey, "rhythm">, string[]> = {
  relationship: ["比肩", "劫财", "正官", "七杀"],
  career: ["正官", "七杀", "正印", "偏印", "食神", "伤官"],
  finance: ["正财", "偏财"],
};

function markerText(pillars: Pillar[], group: string[], fallback: Pillar) {
  const visible = pillars.flatMap((pillar) => [pillar.stemShiShen, ...pillar.branchShiShen]).filter((value) => group.includes(value));
  return Array.from(new Set(visible)).join("、") || fallback.stemShiShen || fallback.ganzhi;
}

function elementText(pillars: Pillar[]) {
  const count: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((pillar) => Array.from(pillar.wuxing).forEach((element) => { if (element in count) count[element] += 1; }));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  return top && top[1] > 0 ? `${top[0]}（四柱可见 ${top[1]} 处）` : "四柱五行标记";
}

export function deriveLifeThemes(result: BaziResult, locale: ManualLocale): LifeTheme[] {
  const day = result.pillars.find((pillar) => pillar.key === "day") || result.pillars[0];
  const month = result.pillars.find((pillar) => pillar.key === "month") || day;
  const copy = COPY[locale];
  const evidencePrefix = locale === "en" ? "Reading index: " : locale === "zh-TW" ? "閱讀索引：" : "阅读索引：";
  const dayLabel = locale === "en" ? `day pillar ${day.ganzhi}` : `日柱 ${day.ganzhi}`;
  const monthLabel = locale === "en" ? `month pillar ${month.ganzhi}` : `月柱 ${month.ganzhi}`;

  return (Object.keys(copy) as LifeThemeKey[]).map((key) => {
    let evidence = `${evidencePrefix}${dayLabel}。`;
    if (key === "relationship") evidence = `${evidencePrefix}${dayLabel}；十神标记 ${markerText(result.pillars, MARKER_GROUPS.relationship, day)}。`;
    if (key === "career") evidence = `${evidencePrefix}${monthLabel}；十神标记 ${markerText(result.pillars, MARKER_GROUPS.career, month)}。`;
    if (key === "finance") evidence = `${evidencePrefix}${dayLabel}；资源相关十神标记 ${markerText(result.pillars, MARKER_GROUPS.finance, day)}。`;
    if (key === "rhythm") evidence = `${evidencePrefix}${dayLabel}；五行可见重心 ${elementText(result.pillars)}。`;
    return { key, ...copy[key], evidence };
  });
}
