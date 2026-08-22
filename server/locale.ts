import type { IncomingHttpHeaders } from "node:http";

export const supportedLocales = ["zh-CN", "zh-TW", "en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export type LocaleSource = "user-preference" | "edge-country" | "accept-language" | "default";

const TRADITIONAL_COUNTRIES = new Set(["TW", "HK", "MO"]);
const SIMPLIFIED_COUNTRIES = new Set(["CN", "SG"]);
const COUNTRY_HEADERS = ["cf-ipcountry", "x-vercel-ip-country", "x-geo-country"] as const;

function headerValue(headers: IncomingHttpHeaders, name: string) {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function localeFromAcceptLanguage(value?: string): SupportedLocale | null {
  const preferred = (value || "").toLowerCase();
  if (preferred.includes("zh-tw") || preferred.includes("zh-hk") || preferred.includes("zh-mo") || preferred.includes("hant")) return "zh-TW";
  if (preferred.includes("zh")) return "zh-CN";
  if (preferred.includes("en")) return "en";
  return null;
}

/**
 * Resolves a display locale from an edge-provided country code, never from a
 * raw IP address. The detected country is intentionally not returned or stored.
 */
export function resolveRequestLocale(headers: IncomingHttpHeaders, userPreference?: string | null) {
  if (supportedLocales.includes(userPreference as SupportedLocale)) {
    return { locale: userPreference as SupportedLocale, source: "user-preference" as const };
  }

  const country = COUNTRY_HEADERS
    .map((name) => headerValue(headers, name)?.trim().toUpperCase())
    .find((value) => value && value !== "XX" && value !== "T1");

  if (country) {
    if (TRADITIONAL_COUNTRIES.has(country)) return { locale: "zh-TW" as const, source: "edge-country" as const };
    if (SIMPLIFIED_COUNTRIES.has(country)) return { locale: "zh-CN" as const, source: "edge-country" as const };
    return { locale: "en" as const, source: "edge-country" as const };
  }

  const accepted = localeFromAcceptLanguage(headerValue(headers, "accept-language"));
  if (accepted) return { locale: accepted, source: "accept-language" as const };
  return { locale: "zh-CN" as const, source: "default" as const };
}
