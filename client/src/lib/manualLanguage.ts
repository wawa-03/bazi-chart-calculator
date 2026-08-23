export const manualLocales = ["zh-CN", "zh-TW", "en"] as const;
export type ManualLocale = (typeof manualLocales)[number];

export type ManualEntry = { title: string; focus: string; prompt: string; note: string };

const entries: Record<ManualLocale, ManualEntry[]> = {
  "zh-CN": [
    { title: "先定下来", focus: "先看节奏。", prompt: "什么事可以慢一点决定？", note: "整理待办，留点空白。" },
    { title: "好好说话", focus: "看事实，少猜。", prompt: "哪段对话该再确认？", note: "别急着回复。" },
    { title: "整理一下", focus: "只做好一件事。", prompt: "现在最值得投入什么？", note: "整理资料和时间表。" },
    { title: "遇到变化", focus: "分清能做和不能做。", prompt: "什么小事能让你稳一点？", note: "把事拆开写。" },
    { title: "专心一点", focus: "守住重点。", prompt: "你想留出哪段专注时间？", note: "做完一件事，再休息。" },
    { title: "回头看看", focus: "看看前半年。", prompt: "哪些经验还想带着走？", note: "留下有用的，放掉不合适的。" },
    { title: "关系和空间", focus: "照看身边的人和地方。", prompt: "什么细节会让日子更舒服？", note: "收拾空间，轻松见面。" },
    { title: "做个选择", focus: "先看你的精力。", prompt: "这件事现在接得住吗？", note: "少做几件，排好先后。" },
    { title: "安静一下", focus: "少一点噪声。", prompt: "什么事可以先放一放？", note: "先看清，不急着决定。" },
    { title: "说清自己", focus: "看看已经做成什么。", prompt: "怎样说清你的需要？", note: "整理成果，准备下一步。" },
    { title: "好好收尾", focus: "感谢支持你的人。", prompt: "谁值得认真说声谢谢？", note: "把该说的话说完。" },
    { title: "准备下一年", focus: "把今年收好。", prompt: "明年想保留什么原则？", note: "存下记录，别排太满。" },
  ],
  "zh-TW": [
    { title: "先定下來", focus: "先看節奏。", prompt: "什麼事可以慢一點決定？", note: "整理待辦，留點空白。" },
    { title: "好好說話", focus: "看事實，少猜。", prompt: "哪段對話該再確認？", note: "別急著回覆。" },
    { title: "整理一下", focus: "只做好一件事。", prompt: "現在最值得投入什麼？", note: "整理資料和時間表。" },
    { title: "遇到變化", focus: "分清能做和不能做。", prompt: "什麼小事能讓你穩一點？", note: "把事拆開寫。" },
    { title: "專心一點", focus: "守住重點。", prompt: "你想留出哪段專注時間？", note: "做完一件事，再休息。" },
    { title: "回頭看看", focus: "看看前半年。", prompt: "哪些經驗還想帶著走？", note: "留下有用的，放掉不合適的。" },
    { title: "關係和空間", focus: "照看身邊的人和地方。", prompt: "什麼細節會讓日子更舒服？", note: "收拾空間，輕鬆見面。" },
    { title: "做個選擇", focus: "先看你的精力。", prompt: "這件事現在接得住嗎？", note: "少做幾件，排好先後。" },
    { title: "安靜一下", focus: "少一點雜訊。", prompt: "什麼事可以先放一放？", note: "先看清，不急著決定。" },
    { title: "說清自己", focus: "看看已經做成什麼。", prompt: "怎樣說清你的需要？", note: "整理成果，準備下一步。" },
    { title: "好好收尾", focus: "感謝支持你的人。", prompt: "誰值得認真說聲謝謝？", note: "把該說的話說完。" },
    { title: "準備下一年", focus: "把今年收好。", prompt: "明年想保留什麼原則？", note: "存下記錄，別排太滿。" },
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
  "zh-CN": { language: "阅读语言", autoLanguage: "语言会自动选择。", guide: "开始前", choose: "只选两项", guideBody: "选年份，填称呼。", start: "打开下一卷", optional: "补充资料（可选）", prepared: "为 {name} 准备", future: "未来月卷", nextJie: "下一节", onlyFuture: "只看未来", first: "先看这卷", cue: "本月线索", question: "想一想", action: "试着做", otherMonths: "换一卷", hideMonths: "收起", basis: "这卷怎么算？", method: "命书怎么来的？", source: "来源", save: "保存命书", login: "登录后保存" },
  "zh-TW": { language: "閱讀語言", autoLanguage: "語言會自動選擇。", guide: "開始前", choose: "只選兩項", guideBody: "選年份，填稱呼。", start: "打開下一卷", optional: "補充資料（可選）", prepared: "為 {name} 準備", future: "未來月卷", nextJie: "下一節", onlyFuture: "只看未來", first: "先看這卷", cue: "本月線索", question: "想一想", action: "試著做", otherMonths: "換一卷", hideMonths: "收起", basis: "這卷怎麼算？", method: "命書怎麼來的？", source: "來源", save: "保存命書", login: "登入後保存" },
  en: { language: "Language", autoLanguage: "Language is picked for you.", guide: "START", choose: "Choose two things", guideBody: "Pick a year. Add a name.", start: "Open next volume", optional: "Add details (optional)", prepared: "For {name}", future: "Future volumes", nextJie: "Next term", onlyFuture: "Future only", first: "Read this first", cue: "This month", question: "Think about", action: "Try this", otherMonths: "Choose another", hideMonths: "Hide", basis: "How is this made?", method: "About this reading", source: "Source", save: "Save reading", login: "Log in to save" },
};
