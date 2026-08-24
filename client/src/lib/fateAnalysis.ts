import { Solar } from "lunar-javascript";
import type { BaziInput, BaziResult, DaYun, Pillar } from "@/lib/bazi";
import type { ManualLocale } from "@/lib/manualLanguage";

type Element = "木" | "火" | "土" | "金" | "水";
type BranchRelation = "冲" | "合" | "害" | "刑";
type Strength = "偏强" | "偏弱" | "较平";

export type FateDomain = {
  title: string;
  label: string;
  focus: string;
  judgment: string;
  fortune: string;
  evidence: string;
  boundary: string;
};

export type FateAnalysis = {
  dayMaster: string;
  dayMasterElement: Element;
  monthCommand: { branch: string; stem: string; element: Element; tenGod: string };
  strength: { label: Strength; text: string; evidence: string[] };
  useGod: { method: string; favored: Element[]; avoid: Element[]; text: string };
  structure: { title: string; text: string; interactions: string[] };
  currentLuck: { ganzhi: string; tenGod: string; text: string; interactions: string[]; flowYear: string; flowYearTenGod: string; flowYearText: string; flowYearInteractions: string[] };
  relationship: FateDomain;
  career: FateDomain;
  finance: FateDomain;
  rhythm: FateDomain;
};

export type DerivedMonthEntry = {
  title: string;
  focus: string;
  prompt: string;
  note: string;
  evidence: string;
};

export type ThreeYearFortune = {
  year: number;
  ganzhi: string;
  tenGod: string;
  daYun: string;
  alignment: "supports" | "needs-weighing" | "contextual";
  focus: string;
  evidence: string;
  interactions: string[];
};

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

const STEM_ELEMENT: Record<string, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
  辰: ["戊", "乙", "癸"], 巳: ["丙", "庚", "戊"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
};

const GENERATES: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<Element, Element> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];
const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

const STEM_COMBINATIONS: Record<string, Element> = {
  "甲己": "土", "乙庚": "金", "丙辛": "水", "丁壬": "木", "戊癸": "火",
};

const BRANCH_PAIRS: Record<BranchRelation, string[][]> = {
  冲: [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]],
  合: [["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"]],
  害: [["子", "未"], ["丑", "午"], ["寅", "巳"], ["卯", "辰"], ["申", "亥"], ["酉", "戌"]],
  刑: [["子", "卯"]],
};

const THREE_PENALTIES = [["寅", "巳", "申"], ["丑", "未", "戌"]];
const THREE_COMBINATIONS: Array<{ branches: string[]; element: Element; name: string }> = [
  { branches: ["申", "子", "辰"], element: "水", name: "三合水局" },
  { branches: ["亥", "卯", "未"], element: "木", name: "三合木局" },
  { branches: ["寅", "午", "戌"], element: "火", name: "三合火局" },
  { branches: ["巳", "酉", "丑"], element: "金", name: "三合金局" },
  { branches: ["亥", "子", "丑"], element: "水", name: "三会水局" },
  { branches: ["寅", "卯", "辰"], element: "木", name: "三会木局" },
  { branches: ["巳", "午", "未"], element: "火", name: "三会火局" },
  { branches: ["申", "酉", "戌"], element: "金", name: "三会金局" },
];

const PILLAR_NAMES: Record<Pillar["key"], string> = { year: "年", month: "月", day: "日", hour: "时" };
const MONTH_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

function elementName(element: Element, locale: ManualLocale) {
  if (locale !== "en") return element;
  return ({ 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" } as const)[element];
}

function localTenGod(value: string, locale: ManualLocale) {
  if (locale !== "en") return value;
  return ({
    比肩: "Peer", 劫财: "Rob Wealth", 食神: "Eating God", 伤官: "Hurting Officer", 正财: "Direct Wealth", 偏财: "Indirect Wealth",
    正官: "Direct Officer", 七杀: "Seven Killings", 正印: "Direct Resource", 偏印: "Indirect Resource",
  } as Record<string, string>)[value] || value;
}

function samePolarity(first: string, second: string) {
  return YANG_STEMS.has(first) === YANG_STEMS.has(second);
}

function produces(element: Element) { return GENERATES[element]; }
function wealthOf(element: Element) { return CONTROLS[element]; }
function officerOf(element: Element) { return ELEMENTS.find((candidate) => CONTROLS[candidate] === element) as Element; }
function resourceOf(element: Element) { return ELEMENTS.find((candidate) => GENERATES[candidate] === element) as Element; }

export function tenGodFor(dayStem: string, otherStem: string) {
  const dayElement = STEM_ELEMENT[dayStem];
  const otherElement = STEM_ELEMENT[otherStem];
  if (!dayElement || !otherElement) return "—";
  const same = samePolarity(dayStem, otherStem);
  if (dayElement === otherElement) return same ? "比肩" : "劫财";
  if (produces(dayElement) === otherElement) return same ? "食神" : "伤官";
  if (wealthOf(dayElement) === otherElement) return same ? "偏财" : "正财";
  if (officerOf(dayElement) === otherElement) return same ? "七杀" : "正官";
  return same ? "偏印" : "正印";
}

function primaryHiddenStem(branch: string) { return HIDDEN_STEMS[branch]?.[0] || ""; }

function activeDaYun(result: BaziResult, year: number): DaYun | null {
  if (!result.daYun.length) return null;
  const current = result.daYun.find((cycle, index) => year >= Number(cycle.startYear) && year < Number(result.daYun[index + 1]?.startYear ?? Infinity));
  return current || (year < Number(result.daYun[0].startYear) ? result.daYun[0] : result.daYun[result.daYun.length - 1]);
}

function flowYearGanZhi(year: number) {
  return String(Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar().getYearInGanZhiExact());
}

function relationBetween(first: string, second: string): BranchRelation | null {
  for (const [kind, pairs] of Object.entries(BRANCH_PAIRS) as Array<[BranchRelation, string[][]]>) {
    if (pairs.some((pair) => pair.includes(first) && pair.includes(second))) return kind;
  }
  return null;
}

function branchRelationText(first: string, second: string, locale: ManualLocale) {
  const relation = relationBetween(first, second);
  if (!relation) return "";
  if (locale === "en") return `${first} and ${second} form a ${({ 冲: "clash", 合: "combination", 害: "harm", 刑: "punishment" } as const)[relation]}.`;
  return `${first}${second}${relation}`;
}

function stemCombinationText(first: string, second: string, locale: ManualLocale) {
  const matched = STEM_COMBINATIONS[`${first}${second}`] || STEM_COMBINATIONS[`${second}${first}`];
  if (!matched) return "";
  return locale === "en" ? `${first}${second} combines toward ${elementName(matched, locale)}; transformation still needs seasonal support.` : `${first}${second}合${matched}，是否化气仍看月令与根气。`;
}

function collectNatalInteractions(pillars: Pillar[], locale: ManualLocale) {
  const results: string[] = [];
  for (let index = 0; index < pillars.length; index += 1) {
    for (let next = index + 1; next < pillars.length; next += 1) {
      const first = pillars[index];
      const second = pillars[next];
      const stemText = stemCombinationText(first.stem, second.stem, locale);
      if (stemText) results.push(stemText);
      const branchText = branchRelationText(first.branch, second.branch, locale);
      if (branchText) results.push(locale === "en" ? `${PILLAR_NAMES[first.key]} and ${PILLAR_NAMES[second.key]} branches: ${branchText}` : `${PILLAR_NAMES[first.key]}支${first.branch}与${PILLAR_NAMES[second.key]}支${second.branch}${branchText.slice(2)}。`);
    }
  }
  const branches = pillars.map((pillar) => pillar.branch);
  THREE_COMBINATIONS.forEach((item) => {
    if (item.branches.every((branch) => branches.includes(branch))) results.push(locale === "en" ? `${item.name} (${elementName(item.element, locale)}) appears in the branches.` : `地支见${item.name}。`);
  });
  THREE_PENALTIES.forEach((group) => {
    if (group.every((branch) => branches.includes(branch))) results.push(locale === "en" ? `${group.join("-")} complete a three-branch punishment.` : `地支见${group.join("、")}三刑。`);
  });
  return Array.from(new Set(results)).slice(0, 6);
}

function elementScores(pillars: Pillar[]) {
  const scores: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((pillar) => {
    const monthMultiplier = pillar.key === "month" ? 1.55 : 1;
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement) scores[stemElement] += 1.1 * monthMultiplier;
    (HIDDEN_STEMS[pillar.branch] || []).forEach((stem, index) => {
      const element = STEM_ELEMENT[stem];
      if (element) scores[element] += [0.9, 0.45, 0.25][index] * monthMultiplier;
    });
  });
  return scores;
}

function strengthOf(dayStem: string, pillars: Pillar[], locale: ManualLocale) {
  const dayElement = STEM_ELEMENT[dayStem] as Element;
  const monthBranch = pillars.find((pillar) => pillar.key === "month")?.branch || "";
  const monthElement = STEM_ELEMENT[primaryHiddenStem(monthBranch)] as Element;
  const scores = elementScores(pillars);
  const resource = resourceOf(dayElement);
  const support = scores[dayElement] + scores[resource];
  const pressure = scores[produces(dayElement)] + scores[wealthOf(dayElement)] + scores[officerOf(dayElement)];
  let seasonWeight = 0;
  if (monthElement === dayElement) seasonWeight = 2.2;
  else if (monthElement === resource) seasonWeight = 1.5;
  else if (monthElement === produces(dayElement)) seasonWeight = -1.1;
  else if (monthElement === wealthOf(dayElement)) seasonWeight = -0.7;
  else seasonWeight = -1.4;
  const value = support + seasonWeight - pressure;
  const label: Strength = value >= 2.2 ? "偏强" : value <= -2.2 ? "偏弱" : "较平";
  const rootCount = pillars.filter((pillar) => (HIDDEN_STEMS[pillar.branch] || []).some((stem) => STEM_ELEMENT[stem] === dayElement)).length;
  const seasonText = monthElement === dayElement || monthElement === resource
    ? (locale === "en" ? "month command supports the Day Master" : "月令生扶日主")
    : (locale === "en" ? "month command drains or restrains the Day Master" : "月令泄耗或克制日主");
  const labelText = locale === "en" ? ({ 偏强: "relatively strong", 偏弱: "relatively weak", 较平: "relatively balanced" } as const)[label] : label;
  return {
    label,
    text: locale === "en" ? `${elementName(dayElement, locale)} Day Master is ${labelText}.` : `${dayStem}${dayElement}日主${labelText}。`,
    evidence: [seasonText, locale === "en" ? `${rootCount} branch root(s) for the Day Master element` : `日主同类根气 ${rootCount} 处`, locale === "en" ? `support ${support.toFixed(1)} / drain-control ${pressure.toFixed(1)}` : `扶身与泄耗制身的相对分量：${support.toFixed(1)} / ${pressure.toFixed(1)}`],
    dayElement,
    monthElement,
    scores,
  };
}

function climateNeed(monthBranch: string) {
  if (["亥", "子", "丑"].includes(monthBranch)) return "火" as Element;
  if (["巳", "午", "未"].includes(monthBranch)) return "水" as Element;
  return null;
}

function useGodOf(dayElement: Element, strength: Strength, monthBranch: string, locale: ManualLocale) {
  const support = [resourceOf(dayElement), dayElement];
  const drain = [produces(dayElement), wealthOf(dayElement), officerOf(dayElement)];
  const climate = climateNeed(monthBranch);
  const primary = strength === "偏强" ? drain : strength === "偏弱" ? support : [produces(dayElement), wealthOf(dayElement)];
  const favored = Array.from(new Set(climate ? [climate, ...primary] : primary));
  const avoidBase = strength === "偏强" ? support : strength === "偏弱" ? drain : [resourceOf(dayElement)];
  const avoid = avoidBase.filter((element) => !favored.includes(element));
  const method = climate ? (locale === "en" ? "climate adjustment with support/control" : "调候兼扶抑") : (locale === "en" ? "support/control" : "扶抑");
  const text = locale === "en"
    ? `${method}: the working preference is ${favored.map((item) => elementName(item, locale)).join(" / ")}; avoid adding ${avoid.map((item) => elementName(item, locale)).join(" / ")} without a supporting role.`
    : `${method}取向：先看${favored.join("、")}；${avoid.join("、")}不宜再偏重。`;
  return { method, favored, avoid, text };
}

function monthAxisText(monthTenGod: string, locale: ManualLocale) {
  const map: Record<string, string> = {
    正官: "官星当令，先核财印是否相扶、食伤是否损官。", 七杀: "七杀当令，先核日主能否任杀、食印是否制化。",
    正财: "正财当令，先核日主能否任财、比劫是否分财。", 偏财: "偏财当令，先核日主能否任财、财源是否有根。",
    正印: "印星当令，先核身强身弱，再看财是否破印、食伤是否泄秀。", 偏印: "偏印当令，先核印是否过重、食神是否受制。",
    食神: "食神当令，先核日主是否有根，再看财与枭的去留。", 伤官: "伤官当令，先核能否生财，及官星是否受损。",
    比肩: "比肩当令，先核日主强弱，再看财官食伤是否能疏通。", 劫财: "劫财当令，先核财星、官星或食伤能否制化。",
  };
  if (locale !== "en") return map[monthTenGod] || "以月令配四柱，先定喜忌。";
  return `${localTenGod(monthTenGod, locale)} commands the month; read the remaining pillars through this axis before assigning outcomes.`;
}

function starLocations(pillars: Pillar[], dayStem: string, gods: string[], locale: ManualLocale) {
  const visible: string[] = [];
  const hidden: string[] = [];
  pillars.forEach((pillar) => {
    const location = locale === "en" ? PILLAR_NAMES[pillar.key] : `${PILLAR_NAMES[pillar.key]}柱`;
    if (gods.includes(tenGodFor(dayStem, pillar.stem))) visible.push(location);
    (HIDDEN_STEMS[pillar.branch] || []).forEach((stem) => {
      if (gods.includes(tenGodFor(dayStem, stem))) hidden.push(location);
    });
  });
  const summary = visible.length ? (locale === "en" ? `visible in ${visible.join(", ")}` : `透于${visible.join("、")}`) : hidden.length ? (locale === "en" ? `stored in ${Array.from(new Set(hidden)).join(", ")}` : `藏于${Array.from(new Set(hidden)).join("、")}`) : (locale === "en" ? "not visible in the natal pillars" : "原局未现");
  return { visible, hidden, summary };
}

function currentLuckOf(result: BaziResult, dayStem: string, favored: Element[], avoid: Element[], year: number, locale: ManualLocale) {
  const cycle = activeDaYun(result, year);
  const flowYear = flowYearGanZhi(year);
  const [flowStem, flowBranch] = Array.from(flowYear);
  const flowElement = STEM_ELEMENT[flowStem];
  const flowYearTenGod = tenGodFor(dayStem, flowStem);
  const flowTendency = favored.includes(flowElement)
    ? (locale === "en" ? "leans toward the working preference" : "落在当前喜用倾向")
    : avoid.includes(flowElement)
      ? (locale === "en" ? "adds an element currently treated as secondary or avoidable" : "加重当前偏忌之气")
      : (locale === "en" ? "still needs to be weighed with the natal chart" : "仍需连同原局定轻重");
  const flowYearInteractions = result.pillars.map((pillar) => branchRelationText(flowBranch, pillar.branch, locale)).filter(Boolean);
  const flowYearText = locale === "en"
    ? `${flowYear} flowing year: ${flowStem} is ${localTenGod(flowYearTenGod, locale)} and ${flowTendency}.`
    : `${flowYear}流年：流年干${flowStem}为${flowYearTenGod}，${flowTendency}。`;
  if (!cycle) return { ganzhi: "—", tenGod: "—", text: locale === "en" ? "No active ten-year cycle is available." : "当前大运资料暂缺。", interactions: [], flowYear, flowYearTenGod: localTenGod(flowYearTenGod, locale), flowYearText, flowYearInteractions: Array.from(new Set(flowYearInteractions)).slice(0, 3) };
  const [stem, branch] = Array.from(cycle.ganzhi);
  const stemElement = STEM_ELEMENT[stem];
  const tenGod = tenGodFor(dayStem, stem);
  const tendency = favored.includes(stemElement)
    ? (locale === "en" ? "leans toward the current working preference" : "天干落在当前喜用倾向")
    : avoid.includes(stemElement)
      ? (locale === "en" ? "adds an element currently treated as secondary or avoidable" : "天干加重当前偏忌之气")
      : (locale === "en" ? "needs to be read with the branch and natal structure" : "需连同运支与原局一起定轻重");
  const interactions = result.pillars.map((pillar) => branchRelationText(branch, pillar.branch, locale)).filter(Boolean);
  const text = locale === "en"
    ? `${cycle.ganzhi} ten-year cycle: ${stem} is ${localTenGod(tenGod, locale)} and ${tendency}.`
    : `${cycle.ganzhi}大运：运干${stem}为${tenGod}，${tendency}。`;
  return { ganzhi: cycle.ganzhi, tenGod: localTenGod(tenGod, locale), text, interactions: Array.from(new Set(interactions)).slice(0, 3), flowYear, flowYearTenGod: localTenGod(flowYearTenGod, locale), flowYearText, flowYearInteractions: Array.from(new Set(flowYearInteractions)).slice(0, 3) };
}

function domainTitle(key: "relationship" | "career" | "finance" | "rhythm", locale: ManualLocale) {
  const text = {
    relationship: ["关系与婚姻", "關係與婚姻", "Relationship"], career: ["事业与职分", "事業與職分", "Career"],
    finance: ["财运与财星", "財運與財星", "Wealth"], rhythm: ["五行与调候", "五行與調候", "Elements & climate"],
  } as const;
  return text[key][locale === "zh-CN" ? 0 : locale === "zh-TW" ? 1 : 2];
}

function boundaryFor(key: "relationship" | "career" | "finance" | "rhythm", locale: ManualLocale) {
  if (locale === "en") return key === "finance" ? "Traditional chart interpretation only; not investment, lending, trading, medical, legal, or major life-decision advice." : "Traditional chart interpretation only; it does not guarantee events or provide medical, legal, investment, or major life-decision advice.";
  if (key === "finance") return locale === "zh-TW" ? "此為命理判讀，不構成投資、借貸、交易、醫療、法律或重大人生決策建議。" : "这是命理判读，不构成投资、借贷、交易、医疗、法律或重大人生决策建议。";
  return locale === "zh-TW" ? "此為命理判讀，不保證事件結果，也不作醫療、法律、投資或重大人生決策依據。" : "这是命理判读，不保证事件结果，也不作为医疗、法律、投资或重大人生决策依据。";
}

function domainReading(args: {
  key: "relationship" | "career" | "finance" | "rhythm";
  dayStem: string;
  dayElement: Element;
  result: BaziResult;
  input: BaziInput;
  strength: Strength;
  favored: Element[];
  currentLuck: FateAnalysis["currentLuck"];
  monthCommand: FateAnalysis["monthCommand"];
  locale: ManualLocale;
}) : FateDomain {
  const { key, dayStem, dayElement, result, input, strength, favored, currentLuck, monthCommand, locale } = args;
  const relationshipGods = input.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  const targetGods = key === "finance" ? ["正财", "偏财"] : key === "career" ? ["正官", "七杀"] : key === "relationship" ? relationshipGods : [];
  const targetElement = key === "finance" ? wealthOf(dayElement) : key === "career" ? officerOf(dayElement) : key === "relationship" ? (input.gender === "male" ? wealthOf(dayElement) : officerOf(dayElement)) : null;
  const locations = targetGods.length ? starLocations(result.pillars, dayStem, targetGods, locale) : null;
  const dayBranch = result.pillars.find((pillar) => pillar.key === "day")?.branch || "";
  const dayBranchLinks = result.pillars.filter((pillar) => pillar.key !== "day").map((pillar) => branchRelationText(dayBranch, pillar.branch, locale)).filter(Boolean);
  const label = key === "finance" ? "WEALTH STAR" : key === "career" ? "OFFICER / KILLING" : key === "relationship" ? "SPOUSE STAR" : "FIVE ELEMENTS";
  if (key === "rhythm") {
    const scores = elementScores(result.pillars);
    const ordered = [...ELEMENTS].sort((first, second) => scores[second] - scores[first]);
    const climate = climateNeed(monthCommand.branch);
    return {
      title: domainTitle(key, locale), label,
      focus: locale === "en" ? `${elementName(ordered[0], locale)} is the most visible element; ${elementName(ordered[ordered.length - 1], locale)} is least visible.` : `原局五行以${ordered[0]}较显，${ordered[ordered.length - 1]}较少。`,
      judgment: locale === "en" ? `${dayStem}${elementName(dayElement, locale)} is ${strength}; month command ${monthCommand.branch} sets the climate.` : `${dayStem}${dayElement}日主${strength}；${monthCommand.branch}月先看时令气候。`,
      fortune: climate ? (locale === "en" ? `Seasonal adjustment first looks to ${elementName(climate, locale)}; ${currentLuck.text} ${currentLuck.flowYearText}` : `调候先看${climate}；${currentLuck.text}${currentLuck.flowYearText}`) : `${currentLuck.text}${currentLuck.flowYearText}`,
      evidence: locale === "en" ? `Basis: month command ${monthCommand.branch}; visible five-element distribution and branch roots.` : `依据：月令${monthCommand.branch}、四柱五行分布与通根。`,
      boundary: boundaryFor(key, locale),
    };
  }
  const favorText = favored.includes(targetElement as Element)
    ? (locale === "en" ? "falls within the current working preference" : "落在当前喜用倾向内")
    : (locale === "en" ? "is not automatically favourable; strength and structure decide its role" : "不因出现即为喜，仍看身强弱与全局配合");
  const kind = targetGods.map((god) => localTenGod(god, locale)).join(locale === "en" ? " / " : "、");
  const relationText = key === "relationship" && dayBranchLinks.length ? (locale === "en" ? `Day branch links: ${dayBranchLinks.join(" ")}` : `日支${dayBranch}见${dayBranchLinks.join("、")}。`) : "";
  const focus = locale === "en"
    ? `${kind} element is ${elementName(targetElement as Element, locale)} and is ${locations?.summary}.`
    : `${kind}属${targetElement}，${locations?.summary}。`;
  const judgment = locale === "en"
    ? `${focus} It ${favorText}. ${relationText}`
    : `${focus}${favorText}。${relationText}`;
  const fortune = locale === "en"
    ? `${currentLuck.text} ${currentLuck.flowYearText} ${currentLuck.interactions.join(" ")} ${currentLuck.flowYearInteractions.join(" ")}`
    : `${currentLuck.text}${currentLuck.flowYearText}${currentLuck.interactions.length ? ` 运支与原局：${currentLuck.interactions.join("、")}。` : ""}${currentLuck.flowYearInteractions.length ? ` 流年支与原局：${currentLuck.flowYearInteractions.join("、")}。` : ""}`;
  return {
    title: domainTitle(key, locale), label, focus, judgment, fortune,
    evidence: locale === "en" ? `Basis: Day Master ${dayStem}; ${kind} locations; month command ${monthCommand.branch}; active Da Yun ${currentLuck.ganzhi}.` : `依据：日主${dayStem}、${kind}位置、月令${monthCommand.branch}与当前${currentLuck.ganzhi}大运。`,
    boundary: boundaryFor(key, locale),
  };
}

export function deriveFateAnalysis(result: BaziResult, input: BaziInput, locale: ManualLocale, targetYear = new Date().getFullYear()): FateAnalysis {
  const day = result.pillars.find((pillar) => pillar.key === "day") || result.pillars[2];
  const month = result.pillars.find((pillar) => pillar.key === "month") || result.pillars[1];
  const monthStem = primaryHiddenStem(month.branch);
  const monthCommand = { branch: month.branch, stem: monthStem, element: STEM_ELEMENT[monthStem] as Element, tenGod: tenGodFor(day.stem, monthStem) };
  const strengthResult = strengthOf(day.stem, result.pillars, locale);
  const useGod = useGodOf(strengthResult.dayElement, strengthResult.label, month.branch, locale);
  const interactions = collectNatalInteractions(result.pillars, locale);
  const currentLuck = currentLuckOf(result, day.stem, useGod.favored, useGod.avoid, targetYear, locale);
  const structure = {
    title: locale === "en" ? "Natal structure" : "命局主轴",
    text: locale === "en"
      ? `Month command ${month.branch} stores ${monthStem} (${localTenGod(monthCommand.tenGod, locale)}). ${monthAxisText(monthCommand.tenGod, locale)}`
      : `月令${month.branch}主气为${monthStem}${monthCommand.element}，对日主为${monthCommand.tenGod}。${monthAxisText(monthCommand.tenGod, locale)}`,
    interactions,
  };
  const common = { dayStem: day.stem, dayElement: strengthResult.dayElement, result, input, strength: strengthResult.label, favored: useGod.favored, currentLuck, monthCommand, locale };
  return {
    dayMaster: day.stem,
    dayMasterElement: strengthResult.dayElement,
    monthCommand,
    strength: { label: strengthResult.label, text: strengthResult.text, evidence: strengthResult.evidence },
    useGod,
    structure,
    currentLuck,
    relationship: domainReading({ ...common, key: "relationship" }),
    career: domainReading({ ...common, key: "career" }),
    finance: domainReading({ ...common, key: "finance" }),
    rhythm: domainReading({ ...common, key: "rhythm" }),
  };
}

function yearStemFor(year: number) { return flowYearGanZhi(year).slice(0, 1); }

function lunarMonthGanZhi(year: number, monthIndex: number) {
  const yearStem = yearStemFor(year);
  const firstStem = ({ 甲: "丙", 己: "丙", 乙: "戊", 庚: "戊", 丙: "庚", 辛: "庚", 丁: "壬", 壬: "壬", 戊: "甲", 癸: "甲" } as Record<string, string>)[yearStem];
  const stem = STEMS[(STEMS.indexOf(firstStem) + monthIndex) % STEMS.length];
  return `${stem}${MONTH_BRANCHES[monthIndex]}`;
}

export function deriveMonthReading(result: BaziResult, input: BaziInput, year: number, monthIndex: number, locale: ManualLocale): DerivedMonthEntry {
  const analysis = deriveFateAnalysis(result, input, locale, year);
  const ganzhi = lunarMonthGanZhi(year, monthIndex);
  const [stem, branch] = Array.from(ganzhi);
  const element = STEM_ELEMENT[stem];
  const tenGod = tenGodFor(analysis.dayMaster, stem);
  const natalLinks = result.pillars.map((pillar) => branchRelationText(branch, pillar.branch, locale)).filter(Boolean);
  const favored = analysis.useGod.favored.includes(element);
  const domain = ["正财", "偏财"].includes(tenGod) ? analysis.finance : ["正官", "七杀"].includes(tenGod) ? analysis.career : ["比肩", "劫财"].includes(tenGod) ? analysis.relationship : analysis.rhythm;
  const title = locale === "en" ? `${ganzhi} month · ${localTenGod(tenGod, locale)}` : `${ganzhi}月 · ${tenGod}`;
  const focus = locale === "en"
    ? `${stem} is ${localTenGod(tenGod, locale)} for the Day Master; ${elementName(element, locale)} ${favored ? "matches" : "does not automatically match"} the current working preference.`
    : `流月干${stem}为${tenGod}；${element}${favored ? "入当前喜用倾向" : "不宜脱离全局单看"}。`;
  const prompt = locale === "en" ? `Natal landing: ${domain.judgment}` : `命局落点：${domain.judgment}`;
  const note = locale === "en"
    ? `${natalLinks.length ? `Branch links: ${natalLinks.join(" ")}` : "No direct branch clash, combination, harm, or punishment is detected against the natal branches."} ${analysis.currentLuck.text} ${analysis.currentLuck.flowYearText}`
    : `${natalLinks.length ? `流月支${branch}与原局：${natalLinks.join("、")}。` : `流月支${branch}与原局未见直接冲合刑害。`}${analysis.currentLuck.text}${analysis.currentLuck.flowYearText}`;
  return { title, focus, prompt, note, evidence: locale === "en" ? `Basis: ${ganzhi}, natal month command ${analysis.monthCommand.branch}, and Da Yun ${analysis.currentLuck.ganzhi}.` : `依据：流月${ganzhi}、原局月令${analysis.monthCommand.branch}与${analysis.currentLuck.ganzhi}大运。` };
}

/**
 * Compare the current flowing year with the next two years. Every card keeps
 * the month-command, useful-element, Da Yun, and branch-relation context, so
 * the comparison never treats a single yearly GanZhi as a standalone verdict.
 */
export function deriveThreeYearComparison(result: BaziResult, input: BaziInput, locale: ManualLocale, startYear = new Date().getFullYear()): ThreeYearFortune[] {
  return [0, 1, 2].map((offset) => {
    const year = startYear + offset;
    const analysis = deriveFateAnalysis(result, input, locale, year);
    const [stem] = Array.from(analysis.currentLuck.flowYear);
    const stemElement = STEM_ELEMENT[stem];
    const alignment: ThreeYearFortune["alignment"] = analysis.useGod.favored.includes(stemElement)
      ? "supports"
      : analysis.useGod.avoid.includes(stemElement)
        ? "needs-weighing"
        : "contextual";
    const focus = locale === "en"
      ? `${analysis.currentLuck.flowYearText} Active Da Yun: ${analysis.currentLuck.ganzhi}.`
      : `${analysis.currentLuck.flowYearText} 同看${analysis.currentLuck.ganzhi}大运。`;
    const evidence = locale === "en"
      ? `Basis: month command ${analysis.monthCommand.branch}; Day Master ${analysis.dayMaster}; useful elements ${analysis.useGod.favored.map((item) => elementName(item, locale)).join(" / ")}; Da Yun ${analysis.currentLuck.ganzhi}.`
      : `依据：月令${analysis.monthCommand.branch}、日主${analysis.dayMaster}、喜用${analysis.useGod.favored.join("、")}与${analysis.currentLuck.ganzhi}大运。`;
    return {
      year,
      ganzhi: analysis.currentLuck.flowYear,
      tenGod: analysis.currentLuck.flowYearTenGod,
      daYun: analysis.currentLuck.ganzhi,
      alignment,
      focus,
      evidence,
      interactions: analysis.currentLuck.flowYearInteractions,
    };
  });
}
