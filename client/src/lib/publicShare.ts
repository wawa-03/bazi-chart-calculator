export type PublicShareLocale = "zh-CN" | "zh-TW" | "en";

export function buildPublicSharePayload(locale: PublicShareLocale, url: string) {
  const content = locale === "en"
    ? { title: "Guanli · Bazi & Ephemeris", text: "Explore a free Bazi chart and solar-term annual reading." }
    : locale === "zh-TW"
      ? { title: "觀曆 · 八字與節氣閱讀", text: "分享一個免費的八字排盤與節氣年度閱讀工具。" }
      : { title: "观历 · 八字与节气阅读", text: "分享一个免费的八字排盘与节气年度阅读工具。" };
  return { ...content, url };
}

export async function sharePublicPage(locale: PublicShareLocale, url: string) {
  const payload = buildPublicSharePayload(locale, url);
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share(payload);
    return "shared" as const;
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return "copied" as const;
  }
  return "unsupported" as const;
}
