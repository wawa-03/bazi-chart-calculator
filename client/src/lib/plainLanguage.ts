import type { FateAnalysis, FateDomain, ThreeYearFortune } from "./fateAnalysis";

export type ReadingLocale = "zh-CN" | "zh-TW" | "en";
export type PlainCard = { title: string; body: string; note: string };

const domainMeaning: Record<"relationship" | "career" | "finance" | "rhythm", [string, string, string]> = {
  relationship: ["关系这张卡，先看相处时的投入、边界和互动节奏。它不直接断定会不会结婚或分开。", "關係這張卡，先看相處時的投入、界線和互動節奏。它不直接斷定會不會結婚或分開。", "This card is about effort, boundaries, and interaction rhythms in relationships; it does not decide whether a relationship will begin or end."],
  career: ["事业这张卡，先看责任、规则、位置和压力怎么来到你面前。它不直接断定升不升职。", "事業這張卡，先看責任、規則、位置和壓力怎麼來到你面前。它不直接斷定升不升職。", "This card reads responsibility, rules, role, and pressure; it does not decide a promotion."],
  finance: ["财运这张卡，先看资源怎么流动、机会怎么出现，以及自己承不承担得住。它不预测赚多少钱。", "財運這張卡，先看資源怎麼流動、機會怎麼出現，以及自己承不承擔得住。它不預測賺多少錢。", "This card reads resource flow, opportunity, and capacity; it does not predict an amount of money."],
  rhythm: ["生活节奏这张卡，先看精力、环境和节奏怎样彼此影响。它不是医疗判断。", "生活節奏這張卡，先看精力、環境和節奏怎樣彼此影響。它不是醫療判斷。", "This card reads energy, environment, and rhythm; it is not a medical assessment."],
};

function pick(locale: ReadingLocale, values: [string, string, string]) { return values[locale === "zh-CN" ? 0 : locale === "zh-TW" ? 1 : 2]; }

export function plainStrength(analysis: FateAnalysis, locale: ReadingLocale): PlainCard {
  const strength = analysis.strength.label;
  const body = locale === "en"
    ? strength === "偏弱" ? "Your own momentum is more easily affected by demands, pressure, or drain from the surroundings. The key is to notice what restores capacity and what consumes it." : strength === "偏强" ? "Your own momentum and preferences are more pronounced. The key is to leave room for feedback, pacing, and balance rather than relying on force alone." : "Your own momentum and outside demands are relatively balanced. The key is to adjust with the situation instead of assuming one fixed approach."
    : strength === "偏弱" ? "你自己的力量更容易受到环境、责任或消耗影响。重点不是“弱就不好”，而是分清什么会帮到你，什么会让负担变重。" : strength === "偏强" ? "你自己的惯性和主张比较明显。重点不是“强就好”，而是给反馈、节奏和不同选择留出位置。" : "你自己的力量和外部要求相对均衡。重点不是固定用一种做法，而是看当下环境再调整。";
  return { title: locale === "en" ? "In plain words: your base energy" : "大白话：你的底子", body, note: locale === "en" ? "This translates the strength reading; it does not replace its month-command and root evidence." : "这是对旺衰判断的翻译，不替代月令与根气依据。" };
}

export function plainMonthAxis(analysis: FateAnalysis, locale: ReadingLocale): PlainCard {
  const body = locale === "en"
    ? `The month you were born in acts like the chart’s background setting. Here it brings ${analysis.monthCommand.tenGod} themes to the front, so the rest of the chart is read through that background before drawing conclusions.`
    : `出生月份像这张盘的“底色”。这里把「${analysis.monthCommand.tenGod}」这一类主题放得更前，所以看其他部分时，先别急着下结论，要先看它和这层底色怎么配合。`;
  return { title: locale === "en" ? "In plain words: the chart’s backdrop" : "大白话：命盘的底色", body, note: locale === "en" ? "The original card keeps the technical month-command chain." : "命理原文里仍保留月令与十神的判断链条。" };
}

export function plainLuck(analysis: FateAnalysis, locale: ReadingLocale): PlainCard {
  const favored = analysis.useGod.favored.join(locale === "en" ? " / " : "、");
  const body = locale === "en"
    ? `Think of the current decade and this year as two layers of weather. This reading pays extra attention to whether events help or strain the chart’s working preference (${favored}); it does not turn one year into a verdict.`
    : `可以把当前十年和今年想成两层同时变化的“天气”。这里重点看外部节奏是否更贴近这张盘需要的方向（${favored}），不是看到某个年份就直接判好坏。`;
  return { title: locale === "en" ? "In plain words: the current timing" : "大白话：现在这段时间", body, note: locale === "en" ? "Return to the original for Da Yun, flow-year, and useful-element terms." : "想核对大运、流年和喜用术语，随时切回命理原文。" };
}

export function plainDomain(key: "relationship" | "career" | "finance" | "rhythm", domain: FateDomain, locale: ReadingLocale): PlainCard {
  return { title: locale === "en" ? `In plain words: ${domain.title}` : `大白话：${domain.title}`, body: pick(locale, domainMeaning[key]), note: locale === "en" ? "Return to the original for the natal basis, luck-cycle relation, and derivation." : "切回命理原文，可看到命局、行运和推演依据如何对应。" };
}

export function plainYear(year: ThreeYearFortune, locale: ReadingLocale): PlainCard {
  const body = locale === "en"
    ? year.alignment === "supports" ? "This year’s outside rhythm is relatively more aligned with what the chart is trying to balance. It is a year to read with context, not a promise that events will go smoothly." : year.alignment === "needs-weighing" ? "This year brings a part of the chart that needs more weighing to the foreground. It is not automatically a bad year; it asks for more context before you make a judgment." : "This year does not lean clearly toward support or extra strain on its own. Read it together with the active decade and the situation at hand."
    : year.alignment === "supports" ? "这一年的外部节奏，和这张盘当前更需要的方向相对合拍。它不是“保证顺利”，只是看事情时可以把这层配合放进参考。" : year.alignment === "needs-weighing" ? "这一年会把命盘里需要多衡量的一面带到前面。它不等于坏年，只是不要只看一个信号就下判断。" : "这一年单看不明显偏帮，也不明显加重压力。更适合连同当下十年大背景和具体情况一起看。";
  return { title: locale === "en" ? `In plain words: ${year.year}` : `大白话：${year.year}`, body, note: locale === "en" ? "Return to the original for the year’s GanZhi, Ten God, and branch relations." : "切回命理原文，可核对这一年的干支、十神和合冲关系。" };
}
