export const manualLocales = ["zh-CN", "zh-TW", "en"] as const;
export type ManualLocale = (typeof manualLocales)[number];

export type ManualEntry = { title: string; focus: string; prompt: string; note: string };

const entries: Record<ManualLocale, ManualEntry[]> = {
  "zh-CN": [
    { title: "定调与留白", focus: "先为新一年的节奏留出观察位置。", prompt: "本月有哪些安排值得先写下来，再慢一点决定？", note: "适合整理待办与关系中的边界，给行程保留余量。" },
    { title: "往来与回应", focus: "把沟通放回具体事实，而非预设。", prompt: "哪一段对话需要补充信息或重新确认？", note: "可留意协作节奏，避免用仓促回应替代完整沟通。" },
    { title: "整理与校对", focus: "回看年初的计划，选择一项做细。", prompt: "此刻真正需要继续投入的事情是什么？", note: "适合归档资料、校对时间表与整理生活空间。" },
    { title: "节奏转换", focus: "在变化里识别可控与不可控。", prompt: "面对变动时，哪一个小动作能让自己更稳定？", note: "用清单拆分事项，避免把不确定性一次性放大。" },
    { title: "专注与收束", focus: "把注意力放在已确定的优先事项。", prompt: "本月最想保护的一段专注时间是什么？", note: "适合完成阶段性工作，也适合做必要的休整。" },
    { title: "中程复盘", focus: "为上半年的经验留出可回看的位置。", prompt: "哪些经验值得带入接下来的安排？", note: "可盘点已完成事项，调整不再适合的承诺。" },
    { title: "关系与空间", focus: "把日常空间和重要关系重新照看一遍。", prompt: "有什么细节能让共同生活更从容？", note: "适合整理居住环境，安排低负担的相聚与休息。" },
    { title: "边界与选择", focus: "面对选项时，先确认自己的时间容量。", prompt: "这项选择是否匹配当下的精力与节奏？", note: "适合减少不必要的并行任务，建立清楚的优先级。" },
    { title: "沉静与沉淀", focus: "把外部噪声减到足以听见自己的程度。", prompt: "哪一件事可以暂缓，而不影响真正重要的目标？", note: "适合复盘资料与承诺，但不急于给出结论。" },
    { title: "收成与表达", focus: "识别一年里已经形成的能力与经验。", prompt: "我可以如何更清楚地表达自己的工作与需求？", note: "适合整理成果、更新档案，并为后续合作做好准备。" },
    { title: "回顾与致谢", focus: "为一年中的支持与变化留下回应。", prompt: "今年哪些人与事值得被认真感谢？", note: "适合完成收尾沟通，减少遗留事项对年底节奏的干扰。" },
    { title: "归档与展望", focus: "让结束成为下一轮计划的可靠起点。", prompt: "明年最希望保留的生活原则是什么？", note: "适合归档年度记录，给未来计划留下弹性。" },
  ],
  "zh-TW": [
    { title: "定調與留白", focus: "先為新一年的節奏留出觀察位置。", prompt: "本月有哪些安排值得先寫下來，再慢一點決定？", note: "適合整理待辦與關係中的邊界，給行程保留餘量。" },
    { title: "往來與回應", focus: "把溝通放回具體事實，而非預設。", prompt: "哪一段對話需要補充資訊或重新確認？", note: "可留意協作節奏，避免用倉促回應替代完整溝通。" },
    { title: "整理與校對", focus: "回看年初的計畫，選擇一項做細。", prompt: "此刻真正需要繼續投入的事情是什麼？", note: "適合歸檔資料、校對時間表與整理生活空間。" },
    { title: "節奏轉換", focus: "在變化裡辨識可控與不可控。", prompt: "面對變動時，哪一個小動作能讓自己更穩定？", note: "用清單拆分事項，避免把不確定性一次放大。" },
    { title: "專注與收束", focus: "把注意力放在已確定的優先事項。", prompt: "本月最想保護的一段專注時間是什麼？", note: "適合完成階段性工作，也適合做必要的休整。" },
    { title: "中程回顧", focus: "為上半年的經驗留出可回看的位置。", prompt: "哪些經驗值得帶入接下來的安排？", note: "可盤點已完成事項，調整不再適合的承諾。" },
    { title: "關係與空間", focus: "把日常空間和重要關係重新照看一遍。", prompt: "有什麼細節能讓共同生活更從容？", note: "適合整理居住環境，安排低負擔的相聚與休息。" },
    { title: "邊界與選擇", focus: "面對選項時，先確認自己的時間容量。", prompt: "這項選擇是否匹配當下的精力與節奏？", note: "適合減少不必要的並行任務，建立清楚的優先順序。" },
    { title: "沉靜與沉澱", focus: "把外部雜訊減到足以聽見自己的程度。", prompt: "哪一件事可以暫緩，而不影響真正重要的目標？", note: "適合回顧資料與承諾，但不急於給出結論。" },
    { title: "收成與表達", focus: "辨識一年裡已經形成的能力與經驗。", prompt: "我可以如何更清楚地表達自己的工作與需求？", note: "適合整理成果、更新檔案，並為後續合作做好準備。" },
    { title: "回顧與致謝", focus: "為一年中的支持與變化留下回應。", prompt: "今年哪些人與事值得被認真感謝？", note: "適合完成收尾溝通，減少遺留事項對年底節奏的干擾。" },
    { title: "歸檔與展望", focus: "讓結束成為下一輪計畫的可靠起點。", prompt: "明年最希望保留的生活原則是什麼？", note: "適合歸檔年度記錄，給未來計畫留下彈性。" },
  ],
  en: [
    { title: "Set the tone", focus: "Leave room to observe the pace of a new year.", prompt: "What deserves to be written down before you decide too quickly?", note: "Tidy tasks and boundaries; leave margin in your calendar." },
    { title: "Exchange and response", focus: "Return communication to concrete facts rather than assumptions.", prompt: "Which conversation needs more information or a second confirmation?", note: "Notice collaboration rhythms and avoid hurried replies." },
    { title: "Sort and verify", focus: "Review early plans and choose one detail to refine.", prompt: "What is genuinely worth continuing to invest in now?", note: "Good for records, calendars, and a lighter living space." },
    { title: "Shift the rhythm", focus: "Distinguish what you can control from what you cannot.", prompt: "What small action would make a change feel steadier?", note: "Break work into a short list instead of enlarging uncertainty." },
    { title: "Focus and close", focus: "Keep attention on the priorities already chosen.", prompt: "What period of focused time do you most want to protect?", note: "Suitable for finishing a stage of work and taking needed rest." },
    { title: "Midway review", focus: "Make space to look back at the first half of the year.", prompt: "Which experiences are worth carrying into what comes next?", note: "Take stock of completed work and adjust unsuitable commitments." },
    { title: "Relationships and space", focus: "Attend again to daily spaces and important relationships.", prompt: "What detail could make shared life feel more spacious?", note: "Tidy your surroundings and choose low-pressure connection." },
    { title: "Boundaries and choices", focus: "Check your time capacity before you choose.", prompt: "Does this option match your current energy and rhythm?", note: "Reduce needless parallel work and set a clear priority." },
    { title: "Quiet and settle", focus: "Lower outside noise until you can hear your own pace.", prompt: "What can be paused without harming what matters most?", note: "Review materials and commitments without forcing a conclusion." },
    { title: "Harvest and express", focus: "Recognize the abilities and experience already taking shape.", prompt: "How can I state my work and needs more clearly?", note: "Organize outcomes, update records, and prepare for collaboration." },
    { title: "Review and thanks", focus: "Respond to the support and change received this year.", prompt: "Which people or events deserve deliberate thanks?", note: "Finish closing conversations and reduce lingering tasks." },
    { title: "Archive and look ahead", focus: "Let an ending become a reliable starting point.", prompt: "Which living principle do I most want to keep next year?", note: "Archive annual notes and leave flexibility for future plans." },
  ],
};

const monthNames: Record<ManualLocale, string[]> = {
  "zh-CN": ["农历正月", "农历二月", "农历三月", "农历四月", "农历五月", "农历六月", "农历七月", "农历八月", "农历九月", "农历十月", "农历冬月", "农历腊月"],
  "zh-TW": ["農曆正月", "農曆二月", "農曆三月", "農曆四月", "農曆五月", "農曆六月", "農曆七月", "農曆八月", "農曆九月", "農曆十月", "農曆冬月", "農曆臘月"],
  en: ["Lunar Month 1", "Lunar Month 2", "Lunar Month 3", "Lunar Month 4", "Lunar Month 5", "Lunar Month 6", "Lunar Month 7", "Lunar Month 8", "Lunar Month 9", "Lunar Month 10", "Lunar Month 11", "Lunar Month 12"],
};

export function manualEntry(locale: ManualLocale, index: number) { return entries[locale][index]; }
export function manualMonth(locale: ManualLocale, index: number) { return monthNames[locale][index]; }

export const manualCopy: Record<ManualLocale, Record<string, string>> = {
  "zh-CN": { language: "阅读语言", autoLanguage: "已按登录会话地区或浏览器语言设置；不会保存原始 IP。", guide: "阅读引导", choose: "只做两个选择", guideBody: "选择年份，确认称呼。其他资料可以稍后补充。", start: "开始下一卷", optional: "补充生活资料（可选）", prepared: "为 {name} 准备", future: "未来月卷", nextJie: "下一节", onlyFuture: "只显示未来月卷", first: "先读这一卷", cue: "本月线索", question: "给自己的一个问题", action: "轻量行动提示", otherMonths: "选择其他未来月卷", hideMonths: "收起其他月卷", basis: "想了解这卷的依据？", method: "命书如何形成？", source: "计算来源与方式", save: "保存这份阅读", login: "登录后保存" },
  "zh-TW": { language: "閱讀語言", autoLanguage: "已按登入會話地區或瀏覽器語言設定；不會保存原始 IP。", guide: "閱讀引導", choose: "只做兩個選擇", guideBody: "選擇年份，確認稱呼。其他資料可以稍後補充。", start: "開始下一卷", optional: "補充生活資料（可選）", prepared: "為 {name} 準備", future: "未來月卷", nextJie: "下一節", onlyFuture: "只顯示未來月卷", first: "先讀這一卷", cue: "本月線索", question: "給自己的一個問題", action: "輕量行動提示", otherMonths: "選擇其他未來月卷", hideMonths: "收起其他月卷", basis: "想了解這卷的依據？", method: "命書如何形成？", source: "計算來源與方式", save: "保存這份閱讀", login: "登入後保存" },
  en: { language: "Reading language", autoLanguage: "Set from login-session region or browser language; raw IP addresses are never stored.", guide: "Reading guide", choose: "Make two choices", guideBody: "Choose a year and confirm a name. Other details can wait.", start: "Begin the next volume", optional: "Add life details (optional)", prepared: "Prepared for {name}", future: "Future lunar volumes", nextJie: "Next solar term", onlyFuture: "Future volumes only", first: "Read this volume first", cue: "Monthly cue", question: "One question for yourself", action: "A light action", otherMonths: "Choose another future volume", hideMonths: "Hide other volumes", basis: "How is this volume grounded?", method: "How is this reading made?", source: "Sources and method", save: "Save this reading", login: "Log in to save" },
};
