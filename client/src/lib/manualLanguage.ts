export const manualLocales = ["zh-CN", "zh-TW", "en"] as const;
export type ManualLocale = (typeof manualLocales)[number];

export type ManualEntry = { title: string; focus: string; prompt: string; note: string };

const entries: Record<ManualLocale, ManualEntry[]> = {
  "zh-CN": [
    { title: "先定下来", focus: "慢一点。", prompt: "哪件事不急？", note: "先留空。" },
    { title: "好好说话", focus: "少猜。", prompt: "哪句话要确认？", note: "晚点再回。" },
    { title: "整理一下", focus: "先做一件。", prompt: "什么最重要？", note: "排个顺序。" },
    { title: "遇到变化", focus: "先稳住。", prompt: "你能做什么？", note: "写下第一步。" },
    { title: "专心一点", focus: "守住重点。", prompt: "先完成什么？", note: "做完再歇。" },
    { title: "回头看看", focus: "看看过去。", prompt: "什么还管用？", note: "留下它。" },
    { title: "关系和空间", focus: "照顾日常。", prompt: "哪里能更舒服？", note: "收拾一下。" },
    { title: "做个选择", focus: "先看精力。", prompt: "现在接得住吗？", note: "少做一点。" },
    { title: "安静一下", focus: "少点噪声。", prompt: "什么能先放？", note: "先别决定。" },
    { title: "说清自己", focus: "看见成果。", prompt: "你需要什么？", note: "说清一点。" },
    { title: "好好收尾", focus: "把话说完。", prompt: "该谢谢谁？", note: "认真说声谢。" },
    { title: "准备下一年", focus: "收好今年。", prompt: "明年留什么？", note: "别排太满。" },
  ],
  "zh-TW": [
    { title: "先定下來", focus: "慢一點。", prompt: "哪件事不急？", note: "先留白。" },
    { title: "好好說話", focus: "少猜。", prompt: "哪句話要確認？", note: "晚點再回。" },
    { title: "整理一下", focus: "先做一件。", prompt: "什麼最重要？", note: "排個順序。" },
    { title: "遇到變化", focus: "先穩住。", prompt: "你能做什麼？", note: "寫下第一步。" },
    { title: "專心一點", focus: "守住重點。", prompt: "先完成什麼？", note: "做完再歇。" },
    { title: "回頭看看", focus: "看看過去。", prompt: "什麼還管用？", note: "留下它。" },
    { title: "關係和空間", focus: "照顧日常。", prompt: "哪裡能更舒服？", note: "收拾一下。" },
    { title: "做個選擇", focus: "先看精力。", prompt: "現在接得住嗎？", note: "少做一點。" },
    { title: "安靜一下", focus: "少點雜訊。", prompt: "什麼能先放？", note: "先別決定。" },
    { title: "說清自己", focus: "看見成果。", prompt: "你需要什麼？", note: "說清一點。" },
    { title: "好好收尾", focus: "把話說完。", prompt: "該謝謝誰？", note: "認真說聲謝。" },
    { title: "準備下一年", focus: "收好今年。", prompt: "明年留什麼？", note: "別排太滿。" },
  ],
  en: [
    { title: "Set the tone", focus: "Check your pace.", prompt: "What can wait?", note: "Clear tasks. Leave space." },
    { title: "Talk it through", focus: "Use facts, not guesses.", prompt: "What needs a second check?", note: "Do not rush your reply." },
    { title: "Tidy up", focus: "Do one thing well.", prompt: "What deserves your time now?", note: "Sort files and plans." },
    { title: "Meet change", focus: "Know what you can control.", prompt: "What small step helps?", note: "Write the steps down." },
    { title: "Focus", focus: "Keep the main thing main.", prompt: "What focus time do you need?", note: "Finish one thing. Then rest." },
    { title: "Look back", focus: "Review the first half.", prompt: "What should you carry on?", note: "Keep what works. Drop the rest." },
    { title: "People and space", focus: "Care for people and place.", prompt: "What would make daily life easier?", note: "Tidy up. Meet simply." },
    { title: "Choose", focus: "Check your energy first.", prompt: "Can you take this on now?", note: "Do less. Pick an order." },
    { title: "Get quiet", focus: "Lower the noise.", prompt: "What can pause?", note: "Look first. Do not rush." },
    { title: "Say it clearly", focus: "See what you have made.", prompt: "How can you state what you need?", note: "Gather your work. Get ready." },
    { title: "Close well", focus: "Thank the people who helped.", prompt: "Who deserves a real thank you?", note: "Say what needs saying." },
    { title: "Plan ahead", focus: "Put this year away well.", prompt: "What do you want to keep next year?", note: "Save notes. Leave room." },
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
  "zh-CN": { language: "阅读语言", autoLanguage: "语言会自动选择。", guide: "开始前", choose: "先选年份", guideBody: "按月份开始读。", start: "打开这个月", optional: "补充资料（可选）", prepared: "为 {name} 准备", future: "未来月卷", nextJie: "下一节", onlyFuture: "只看未来", first: "这个月", cue: "看", question: "想", action: "做", otherMonths: "换一卷", hideMonths: "收起", basis: "这卷怎么算？", method: "命书怎么来的？", source: "来源", save: "保存命书", login: "登录后保存" },
  "zh-TW": { language: "閱讀語言", autoLanguage: "語言會自動選擇。", guide: "開始前", choose: "先選年份", guideBody: "按月份開始讀。", start: "打開這個月", optional: "補充資料（可選）", prepared: "為 {name} 準備", future: "未來月卷", nextJie: "下一節", onlyFuture: "只看未來", first: "這個月", cue: "看", question: "想", action: "做", otherMonths: "換一卷", hideMonths: "收起", basis: "這卷怎麼算？", method: "命書怎麼來的？", source: "來源", save: "保存命書", login: "登入後保存" },
  en: { language: "Language", autoLanguage: "Language is picked for you.", guide: "START", choose: "Choose a year", guideBody: "Read month by month.", start: "Open this month", optional: "Add details (optional)", prepared: "For {name}", future: "Future volumes", nextJie: "Next term", onlyFuture: "Future only", first: "This month", cue: "See", question: "Ask", action: "Do", otherMonths: "Choose another", hideMonths: "Hide", basis: "How is this made?", method: "About this reading", source: "Source", save: "Save reading", login: "Log in to save" },
};
