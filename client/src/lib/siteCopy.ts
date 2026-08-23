import type { ManualLocale } from "@/lib/manualLanguage";

type SiteCopy = {
  language: string;
  nav: { calculator: string; annual: string; method: string };
  localStatus: string;
  hero: { kicker: string; titleBefore: string; titleAccent: string; body: string; notes: [string, string, string]; caption: string; captionHint: string };
  form: { kicker: string; title: string; body: string; datetime: string; longitude: string; latitude: string; longitudeHint: string; latitudeHint: string; precision: string; correction: string; gender: string; male: string; female: string; calculate: string; example: string; privacy: string; error: string };
  result: { kicker: string; title: string; subtitle: string; correction: string; correctedSolarTime: string; originalTime: string; chartTime: string; coordinates: string; rule: string; exportKicker: string; exportBody: string; download: string; generating: string; copy: string; copying: string; copied: string; jieQi: string; previous: string; next: string; additional: string; fetalOrigin: string; lifePalace: string; bodyPalace: string; direction: string; fortuneDirection: string; fortuneHint: string; start: string; year: string; localPillars: Record<string, string>; stemDeity: string; hiddenStems: string; naYinState: string; dayMaster: string };
  method: { kicker: string; titleBefore: string; titleAccent: string; firstTitle: string; firstBody: string; secondTitle: string; secondBody: string; thirdTitle: string; thirdBody: string; link: string };
  footer: { brand: string; disclaimer: string };
  city: { label: string; ready: string; connecting: string; placeholder: string; clear: string; searching: string; results: string; selected: string };
};

export const siteCopy: Record<ManualLocale, SiteCopy> = {
  "zh-CN": {
    language: "语言", nav: { calculator: "起盘", annual: "年卷", method: "依据" }, localStatus: "浏览器本地推算",
    hero: { kicker: "排盘 / 01", titleBefore: "先把出生时间\n放回", titleAccent: "正确位置", body: "按节气和出生地时间排四柱。", notes: ["按节气", "校正时间", "晚子时换日"], caption: "排盘工具", captionHint: "先核对时间和地点" },
    form: { kicker: "填写资料", title: "出生信息", body: "填北京时间。地点可搜城市。", datetime: "出生日期和时间", longitude: "出生地经度", latitude: "出生地纬度", longitudeHint: "东为正", latitudeHint: "北为正", precision: "小数位数不限。", correction: "时间校正", gender: "性别（排大运用）", male: "男", female: "女", calculate: "开始排盘", example: "恢复示例", privacy: "不保存你的输入。", error: "算不出来。请检查资料。" },
    result: { kicker: "你的四柱", title: "排盘结果", subtitle: "八字", correction: "时间校正", correctedSolarTime: "真太阳时", originalTime: "原始时间", chartTime: "排盘时间", coordinates: "经度 {longitude}° · 纬度 {latitude}°", rule: "按节气排盘。晚子时从 23:00 换日。", exportKicker: "导出", exportBody: "文件只在本机生成。", download: "下载 PNG", generating: "生成中", copy: "复制文字", copying: "复制中", copied: "已复制。", jieQi: "节气", previous: "上一节", next: "下一节", additional: "其他", fetalOrigin: "胎元", lifePalace: "命宫", bodyPalace: "身宫", direction: "大运方向", fortuneDirection: "大运", fortuneHint: "按性别和年干计算", start: "起", year: "岁", localPillars: { year: "年柱", month: "月柱", day: "日柱", hour: "时柱" }, stemDeity: "十神", hiddenStems: "藏干", naYinState: "纳音 / 地势", dayMaster: "日主" },
    method: { kicker: "排盘依据", titleBefore: "看的是", titleAccent: "时刻和节气", firstTitle: "校正时间", firstBody: "按经度校正出生地时间。", secondTitle: "按节气换柱", secondBody: "立春换年，节气换月。", thirdTitle: "晚子时", thirdBody: "23:00 起算新的一天。", link: "查看历法说明" },
    footer: { brand: "观历 · 四柱排盘", disclaimer: "只作参考。" },
    city: { label: "出生城市", ready: "地点服务已就绪", connecting: "正在连接地点服务", placeholder: "输入城市，如北京、上海", clear: "清除城市", searching: "正在搜索", results: "城市搜索结果", selected: "已选" },
  },
  "zh-TW": {
    language: "語言", nav: { calculator: "起盤", annual: "年卷", method: "依據" }, localStatus: "瀏覽器本機推算",
    hero: { kicker: "排盤 / 01", titleBefore: "先把出生時間\n放回", titleAccent: "正確位置", body: "按節氣和出生地時間排四柱。", notes: ["按節氣", "校正時間", "晚子時換日"], caption: "排盤工具", captionHint: "先核對時間和地點" },
    form: { kicker: "填寫資料", title: "出生資訊", body: "填北京時間。地點可搜尋城市。", datetime: "出生日期和時間", longitude: "出生地經度", latitude: "出生地緯度", longitudeHint: "東為正", latitudeHint: "北為正", precision: "小數位數不限。", correction: "時間校正", gender: "性別（排大運用）", male: "男", female: "女", calculate: "開始排盤", example: "恢復範例", privacy: "不保存你的輸入。", error: "算不出來。請檢查資料。" },
    result: { kicker: "你的四柱", title: "排盤結果", subtitle: "八字", correction: "時間校正", correctedSolarTime: "真太陽時", originalTime: "原始時間", chartTime: "排盤時間", coordinates: "經度 {longitude}° · 緯度 {latitude}°", rule: "按節氣排盤。晚子時從 23:00 換日。", exportKicker: "匯出", exportBody: "檔案只在本機生成。", download: "下載 PNG", generating: "生成中", copy: "複製文字", copying: "複製中", copied: "已複製。", jieQi: "節氣", previous: "上一節", next: "下一節", additional: "其他", fetalOrigin: "胎元", lifePalace: "命宮", bodyPalace: "身宮", direction: "大運方向", fortuneDirection: "大運", fortuneHint: "按性別和年干計算", start: "起", year: "歲", localPillars: { year: "年柱", month: "月柱", day: "日柱", hour: "時柱" }, stemDeity: "十神", hiddenStems: "藏干", naYinState: "納音 / 地勢", dayMaster: "日主" },
    method: { kicker: "排盤依據", titleBefore: "看的是", titleAccent: "時刻和節氣", firstTitle: "校正時間", firstBody: "按經度校正出生地時間。", secondTitle: "按節氣換柱", secondBody: "立春換年，節氣換月。", thirdTitle: "晚子時", thirdBody: "23:00 起算新的一天。", link: "查看曆法說明" },
    footer: { brand: "觀曆 · 四柱排盤", disclaimer: "只作參考。" },
    city: { label: "出生城市", ready: "地點服務已就緒", connecting: "正在連線地點服務", placeholder: "輸入城市，如北京、上海", clear: "清除城市", searching: "正在搜尋", results: "城市搜尋結果", selected: "已選" },
  },
  en: {
    language: "Language", nav: { calculator: "Chart", annual: "Annual", method: "Method" }, localStatus: "Calculated locally in this browser",
    hero: { kicker: "CHART / 01", titleBefore: "Put the birth time\nin the", titleAccent: "right place", body: "Use solar terms and local time to chart Four Pillars.", notes: ["solar terms", "time correction", "late-Zi day change"], caption: "Charting tool", captionHint: "Check time and place first" },
    form: { kicker: "YOUR DETAILS", title: "Birth details", body: "Enter Beijing time. Search for a city if needed.", datetime: "Birth date and time", longitude: "Birth longitude", latitude: "Birth latitude", longitudeHint: "East is positive", latitudeHint: "North is positive", precision: "Any decimal length works.", correction: "Time correction", gender: "Gender (for fortune cycles)", male: "Male", female: "Female", calculate: "Make my chart", example: "Restore example", privacy: "Your input is not saved.", error: "Could not make this chart. Check the details." },
    result: { kicker: "YOUR FOUR PILLARS", title: "Your chart", subtitle: "BĀZÌ", correction: "Time correction", correctedSolarTime: "Local solar time", originalTime: "Original time", chartTime: "Chart time", coordinates: "Longitude {longitude}° · Latitude {latitude}°", rule: "Solar terms set the pillars. The day changes at 23:00.", exportKicker: "EXPORT", exportBody: "Files are made on this device.", download: "Download PNG", generating: "Making", copy: "Copy text", copying: "Copying", copied: "Copied.", jieQi: "Solar term", previous: "Previous", next: "Next", additional: "More", fetalOrigin: "Fetal origin", lifePalace: "Life palace", bodyPalace: "Body palace", direction: "Fortune direction", fortuneDirection: "Fortune cycles", fortuneHint: "Based on gender and year stem", start: "from", year: "years", localPillars: { year: "Year", month: "Month", day: "Day", hour: "Hour" }, stemDeity: "Relation", hiddenStems: "Hidden stems", naYinState: "Na Yin / phase", dayMaster: "Day master" },
    method: { kicker: "HOW IT WORKS", titleBefore: "It uses", titleAccent: "time and solar terms", firstTitle: "Correct time", firstBody: "Longitude adjusts local birth time.", secondTitle: "Solar terms", secondBody: "Li Chun changes the year. Solar terms change the month.", thirdTitle: "Late Zi", thirdBody: "A new day starts at 23:00.", link: "See the calendar source" },
    footer: { brand: "Guanli · Four Pillars", disclaimer: "For reference only." },
    city: { label: "Birth city", ready: "Place service ready", connecting: "Connecting to place service", placeholder: "Search a city, e.g. Beijing or Shanghai", clear: "Clear city", searching: "Searching", results: "City search results", selected: "Selected" },
  },
};
