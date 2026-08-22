/**
 * 观象历书设计提醒：这里是可追溯计算的底层，输出字段必须保留输入、修正与历法依据。
 */
import { Solar } from "lunar-javascript";

export type Gender = "male" | "female";

export type BaziInput = {
  datetime: string;
  longitude: number;
  latitude: number;
  gender: Gender;
};

export type Pillar = {
  key: "year" | "month" | "day" | "hour";
  label: string;
  ganzhi: string;
  stem: string;
  branch: string;
  wuxing: string;
  naYin: string;
  stemShiShen: string;
  hiddenGan: string[];
  branchShiShen: string[];
  diShi: string;
};

export type DaYun = {
  ganzhi: string;
  startAge: string;
  endAge: string;
  startYear: string;
};

export type BaziResult = {
  originalTime: string;
  correctedTime: string;
  correctionMinutes: number;
  longitude: number;
  latitude: number;
  pillars: Pillar[];
  lunarText: string;
  currentJieQi: string;
  previousJie: string;
  nextJie: string;
  taiYuan: string;
  mingGong: string;
  shenGong: string;
  direction: "顺排" | "逆排";
  startYunText: string;
  startYunDate: string;
  daYun: DaYun[];
  dayBoundaryNote: string;
};

export function formatCoordinate(value: number) {
  return Number.isFinite(value) ? String(value) : "—";
}

const STEMS = "甲乙丙丁戊己庚辛壬癸";

const pillarGetters = {
  year: {
    label: "年柱",
    ganzhi: "getYear",
    wuxing: "getYearWuXing",
    naYin: "getYearNaYin",
    stemShiShen: "getYearShiShenGan",
    hiddenGan: "getYearHideGan",
    branchShiShen: "getYearShiShenZhi",
    diShi: "getYearDiShi",
  },
  month: {
    label: "月柱",
    ganzhi: "getMonth",
    wuxing: "getMonthWuXing",
    naYin: "getMonthNaYin",
    stemShiShen: "getMonthShiShenGan",
    hiddenGan: "getMonthHideGan",
    branchShiShen: "getMonthShiShenZhi",
    diShi: "getMonthDiShi",
  },
  day: {
    label: "日柱",
    ganzhi: "getDay",
    wuxing: "getDayWuXing",
    naYin: "getDayNaYin",
    stemShiShen: "getDayShiShenGan",
    hiddenGan: "getDayHideGan",
    branchShiShen: "getDayShiShenZhi",
    diShi: "getDayDiShi",
  },
  hour: {
    label: "时柱",
    ganzhi: "getTime",
    wuxing: "getTimeWuXing",
    naYin: "getTimeNaYin",
    stemShiShen: "getTimeShiShenGan",
    hiddenGan: "getTimeHideGan",
    branchShiShen: "getTimeShiShenZhi",
    diShi: "getTimeDiShi",
  },
} as const;

function parseInputTime(value: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    throw new Error("请完整填写公历出生日期与时间。");
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
}

function asYmdHms(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function listValue(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function call(object: Record<string, any>, method: string) {
  const value = object[method];
  return typeof value === "function" ? value.call(object) : "";
}

function formatYunSpan(year: number, month: number, day: number) {
  const parts = [];
  if (year) parts.push(`${year}年`);
  if (month) parts.push(`${month}月`);
  if (day) parts.push(`${day}日`);
  return parts.length ? parts.join(" ") : "出生后即起运";
}

export function calculateBazi(input: BaziInput): BaziResult {
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error("出生地经度请填写 -180° 至 180° 之间的有效数值。");
  }
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error("出生地纬度请填写 -90° 至 90° 之间的有效数值。");
  }

  const originalDate = parseInputTime(input.datetime);
  const correctionMinutes = (input.longitude - 120) * 4;
  const correctedDate = new Date(originalDate.getTime() + correctionMinutes * 60_000);
  const solar = Solar.fromYmdHms(
    correctedDate.getUTCFullYear(),
    correctedDate.getUTCMonth() + 1,
    correctedDate.getUTCDate(),
    correctedDate.getUTCHours(),
    correctedDate.getUTCMinutes(),
    0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 采用“晚子时（23:00）换日”的日柱规则；这是不同流派间常见的可配置差异。
  eightChar.setSect(1);

  const pillars = (Object.keys(pillarGetters) as Array<keyof typeof pillarGetters>).map((key) => {
    const config = pillarGetters[key];
    const ganzhi = String(call(eightChar, config.ganzhi));
    return {
      key,
      label: config.label,
      ganzhi,
      stem: ganzhi.slice(0, 1),
      branch: ganzhi.slice(1, 2),
      wuxing: String(call(eightChar, config.wuxing)),
      naYin: String(call(eightChar, config.naYin)),
      stemShiShen: String(call(eightChar, config.stemShiShen)),
      hiddenGan: listValue(call(eightChar, config.hiddenGan)),
      branchShiShen: listValue(call(eightChar, config.branchShiShen)),
      diShi: String(call(eightChar, config.diShi)),
    };
  });

  const yearStem = pillars[0].stem;
  const isYangYear = STEMS.indexOf(yearStem) % 2 === 0;
  const direction = (input.gender === "male") === isYangYear ? "顺排" : "逆排";
  const yun = eightChar.getYun(input.gender === "male" ? 1 : 0);
  const daYun = (yun.getDaYun?.() ?? [])
    .slice(1, 7)
    .map((item: Record<string, any>) => ({
      ganzhi: String(call(item, "getGanZhi")),
      startAge: String(call(item, "getStartAge")),
      endAge: String(call(item, "getEndAge")),
      startYear: String(call(item, "getStartYear")),
    }))
    .filter((item: DaYun) => item.ganzhi);

  return {
    originalTime: asYmdHms(originalDate),
    correctedTime: asYmdHms(correctedDate),
    correctionMinutes,
    longitude: input.longitude,
    latitude: input.latitude,
    pillars,
    lunarText: lunar.toString(),
    currentJieQi: String(lunar.getJieQi?.() || "节气之间"),
    previousJie: String(lunar.getPrevJie?.().getName?.() || "—"),
    nextJie: String(lunar.getNextJie?.().getName?.() || "—"),
    taiYuan: String(eightChar.getTaiYuan?.() || "—"),
    mingGong: String(eightChar.getMingGong?.() || "—"),
    shenGong: String(eightChar.getShenGong?.() || "—"),
    direction,
    startYunText: formatYunSpan(yun.getStartYear(), yun.getStartMonth(), yun.getStartDay()),
    startYunDate: String(yun.getStartSolar?.().toYmd?.() || "—"),
    daYun,
    dayBoundaryNote: "已采用晚子时（23:00 起）换日规则。",
  };
}
