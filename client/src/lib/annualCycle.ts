/**
 * 年度归档按“节”切换：下一节对应下一段可预览的传统月卷，而非按公历自然月开启。
 */
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

export type FutureLunarAccess = {
  openMonths: number[];
  nextJie: string;
  startMonth: number | null;
};

export function getFutureLunarAccess(today: Date, targetYear: number): FutureLunarAccess {
  const currentYear = today.getFullYear();
  const solar = Solar.fromYmdHms(
    currentYear,
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );
  const lunar = solar.getLunar();
  const nextJie = String(lunar.getNextJie?.().getName?.() || "下一节");

  if (targetYear > currentYear) {
    return { openMonths: Array.from({ length: 12 }, (_, index) => index + 1), nextJie, startMonth: 1 };
  }
  if (targetYear < currentYear) {
    return { openMonths: [], nextJie, startMonth: null };
  }

  const startMonth = JIE_TO_FUTURE_LUNAR_MONTH[nextJie] ?? Math.min(12, today.getMonth() + 2);
  return {
    openMonths: Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index),
    nextJie,
    startMonth,
  };
}
