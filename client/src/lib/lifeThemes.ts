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
    relationship: { title: "关系与亲密", label: "RELATIONSHIP", focus: "先说清需求和界限。", question: "我想怎样被理解？", action: "先写一个事实和一个感受。", boundary: "不判断关系成败。" },
    career: { title: "事业与路径", label: "WORK & PATH", focus: "先看技能和节奏。", question: "现在最该练什么？", action: "定一个本周能完成的小目标。", boundary: "不预测职业结果。" },
    finance: { title: "财务与资源", label: "MONEY & RESOURCES", focus: "先看支出、承诺和风险。", question: "这个月最要紧的一笔钱是什么？", action: "核对一次账目或合同。", boundary: "不构成投资或借贷建议。" },
    rhythm: { title: "生活节奏", label: "DAILY RHYTHM", focus: "给自己留一点空。", question: "什么时候最需要不被打扰？", action: "下个节气前，留一段空白时间。", boundary: "不作健康判断。" },
  },
  "zh-TW": {
    relationship: { title: "關係與親密", label: "RELATIONSHIP", focus: "先說清需求和界限。", question: "我想怎樣被理解？", action: "先寫一個事實和一個感受。", boundary: "不判斷關係成敗。" },
    career: { title: "事業與路徑", label: "WORK & PATH", focus: "先看技能和節奏。", question: "現在最該練什麼？", action: "定一個本週能完成的小目標。", boundary: "不預測職業結果。" },
    finance: { title: "財務與資源", label: "MONEY & RESOURCES", focus: "先看支出、承諾和風險。", question: "這個月最要緊的一筆錢是什麼？", action: "核對一次帳目或合約。", boundary: "不是投資或借貸建議。" },
    rhythm: { title: "生活節奏", label: "DAILY RHYTHM", focus: "給自己留一點空。", question: "什麼時候最需要不被打擾？", action: "下個節氣前，留一段空白時間。", boundary: "不作健康判斷。" },
  },
  en: {
    relationship: { title: "Relationship & closeness", label: "RELATIONSHIP", focus: "Name needs and boundaries.", question: "How do I want to be understood?", action: "Write one fact and one feeling.", boundary: "It does not judge a relationship." },
    career: { title: "Work & path", label: "WORK & PATH", focus: "Check skill and pace.", question: "What should I practise now?", action: "Set one small goal for this week.", boundary: "It does not predict career results." },
    finance: { title: "Money & resources", label: "MONEY & RESOURCES", focus: "Check cost, commitment, and risk.", question: "What money need matters most this month?", action: "Review accounts or one agreement.", boundary: "Not investment or lending advice." },
    rhythm: { title: "Daily rhythm", label: "DAILY RHYTHM", focus: "Leave some space for yourself.", question: "When do you need no interruptions?", action: "Keep one open block before the next term.", boundary: "It does not assess health." },
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
