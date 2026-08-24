import { Solar } from "lunar-javascript";

const JIE_TO_FUTURE_LUNAR_MONTH: Record<string, number> = {
  小寒: 1,
  立春: 2,
  惊蛰: 3,
  清明: 4,
  立夏: 5,
  芒种: 6,
  小暑: 7,
  立秋: 8,
  白露: 9,
  寒露: 10,
  立冬: 11,
  大雪: 12,
};

export type AnnualWindow = {
  timezone: "Asia/Shanghai";
  currentYear: number;
  targetYear: number;
  nextJie: string;
  startMonth: number | null;
  openMonths: number[];
  nextYearAvailable: boolean;
};

function shanghaiParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/**
 * Server-authoritative annual reading window. It deliberately uses only the
 * Beijing business timezone and never trusts a client-supplied clock.
 */
export function getAnnualWindow(targetYear: number, now = new Date()): AnnualWindow {
  const current = shanghaiParts(now);
  const solar = Solar.fromYmdHms(current.year, current.month, current.day, current.hour, current.minute, current.second);
  const nextJie = solar.getLunar().getNextJie().getName();
  const nextYearAvailable = current.month >= 7;

  if (targetYear > current.year) {
    const canOpen = targetYear > current.year + 1 || nextYearAvailable;
    return { timezone: "Asia/Shanghai", currentYear: current.year, targetYear, nextJie, startMonth: canOpen ? 1 : null, openMonths: canOpen ? Array.from({ length: 12 }, (_, index) => index + 1) : [], nextYearAvailable };
  }
  if (targetYear < current.year) {
    return { timezone: "Asia/Shanghai", currentYear: current.year, targetYear, nextJie, startMonth: null, openMonths: [], nextYearAvailable };
  }

  const startMonth = JIE_TO_FUTURE_LUNAR_MONTH[nextJie];
  if (!startMonth) {
    throw new Error(`无法将下一节“${nextJie}”映射为未来月卷；请检查历法规则版本。`);
  }
  return { timezone: "Asia/Shanghai", currentYear: current.year, targetYear, nextJie, startMonth, openMonths: Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index), nextYearAvailable };
}
