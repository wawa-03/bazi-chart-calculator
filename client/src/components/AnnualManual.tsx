/**
 * 观象历书设计提醒：命书延续卷宗式阅读，以资料核对、年度总盘、月份档案的顺序组织；文字保持自我观察语气。
 */
import { FormEvent, useMemo, useState } from "react";
import { CalendarRange, ChevronRight, CircleAlert, Eye, LockKeyhole, MapPinned, NotebookPen, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import type { BaziResult } from "@/lib/bazi";

type AnnualManualProps = {
  result: BaziResult;
};

type MonthEntry = {
  title: string;
  focus: string;
  prompt: string;
  note: string;
};

const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

const MONTH_ENTRIES: MonthEntry[] = [
  { title: "定调与留白", focus: "先为新一年的节奏留出观察位置。", prompt: "本月有哪些安排值得先写下来，再慢一点决定？", note: "适合整理待办与关系中的边界，给行程保留余量。" },
  { title: "往来与回应", focus: "把沟通放回具体事实，而非预设。", prompt: "哪一段对话需要补充信息或重新确认？", note: "可留意协作节奏，避免用仓促回应替代完整沟通。" },
  { title: "整理与校对", focus: "回看年初的计划，选择一项做细。", prompt: "此刻真正需要继续投入的事情是什么？", note: "适合归档资料、校对时间表与整理生活空间。" },
  { title: "节奏转换", focus: "在变化里识别可控与不可控。", prompt: "面对变动时，哪一个小动作能让自己更稳定？", note: "用清单拆分事项，避免把不确定性一次性放大。" },
  { title: "专注与收束", focus: "把注意力放在已确定的优先事项。", prompt: "本月最想保护的一段专注时间是什么？", note: "适合完成阶段性工作，也适合做必要的休整。" },
  { title: "中程复盘", focus: "为上半年留下可回看的记录。", prompt: "哪些经验值得带入下半年的安排？", note: "可盘点已完成事项，调整不再适合的承诺。" },
  { title: "关系与空间", focus: "把日常空间和重要关系重新照看一遍。", prompt: "有什么细节能让共同生活更从容？", note: "适合整理居住环境，安排低负担的相聚与休息。" },
  { title: "边界与选择", focus: "面对选项时，先确认自己的时间容量。", prompt: "这项选择是否匹配当下的精力与节奏？", note: "适合减少不必要的并行任务，建立清楚的优先级。" },
  { title: "沉静与沉淀", focus: "把外部噪声减到足以听见自己的程度。", prompt: "哪一件事可以暂缓，而不影响真正重要的目标？", note: "适合复盘收支、资料与承诺，但不急于给出结论。" },
  { title: "收成与表达", focus: "识别一年里已经形成的能力与经验。", prompt: "我可以如何更清楚地表达自己的工作与需求？", note: "适合整理成果、更新档案，并为后续合作做好准备。" },
  { title: "回顾与致谢", focus: "为一年中的支持与变化留下回应。", prompt: "今年哪些人与事值得被认真感谢？", note: "适合完成收尾沟通，减少遗留事项对年底节奏的干扰。" },
  { title: "归档与展望", focus: "让结束成为下一轮计划的可靠起点。", prompt: "明年最希望保留的生活原则是什么？", note: "适合归档年度记录，给未来计划留下弹性。" },
];

function initialsFromResult(result: BaziResult) {
  return result.pillars.map((pillar) => pillar.ganzhi).join(" · ");
}

export function AnnualManual({ result }: AnnualManualProps) {
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [profile, setProfile] = useState({ name: "", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  const unlockedThrough = profile.year < currentYear ? 12 : profile.year === currentYear ? currentMonth : 0;
  const annualLabel = `${profile.year} 年年度归档`;
  const profileName = profile.name.trim() || "未署名";
  const elements = Array.from(new Set(result.pillars.flatMap((pillar) => Array.from(pillar.wuxing)).filter((value) => "木火土金水".includes(value)))).join("、") || "待核对";

  function beginReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStarted(true);
    setActiveMonth(null);
    window.setTimeout(() => document.getElementById("manual-reading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  return (
    <section className="manual-section" id="manual" aria-labelledby="manual-title">
      <header className="manual-intro">
        <div>
          <div className="eyebrow"><ScrollText /> ANNUAL ARCHIVE / 04</div>
          <h2 id="manual-title">把一年归入一卷<br /><strong>可回看的年历档案</strong>。</h2>
        </div>
          <p>先核对当下的生活资料，再查看年度归档；每个月在它真正到来后才开放，避免让未来月份提前占据今天。</p>
      </header>

      <div className="manual-layout">
        <aside className="manual-form-sheet" aria-label="命书资料">
          <div className="sheet-kicker"><span>03</span> 年度资料</div>
          <h3>先留一份当下的生活坐标</h3>
          <p>住址只在本次浏览器会话中用于资料核对；刷新或离开页面后不会保留。</p>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-name">称呼或姓名</label>
            <input id="manual-name" value={profile.name} maxLength={24} placeholder="例如：郑皓源" onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} />
            <label htmlFor="manual-birth-place">出生地点</label>
            <input id="manual-birth-place" value={profile.birthPlace} maxLength={60} placeholder="例如：北京市东城区" onChange={(event) => setProfile((value) => ({ ...value, birthPlace: event.target.value }))} />
            <label htmlFor="manual-residence">现居详细地址</label>
            <textarea id="manual-residence" value={profile.residence} maxLength={140} placeholder="可填写至门牌号；仅在此设备当前页面使用" onChange={(event) => setProfile((value) => ({ ...value, residence: event.target.value }))} />
            <label htmlFor="manual-year">阅读年份</label>
            <select id="manual-year" value={profile.year} onChange={(event) => {
              setProfile((value) => ({ ...value, year: Number(event.target.value) }));
              setActiveMonth(null);
            }}>
              <option value={currentYear}>{currentYear} 年</option>
              <option value={currentYear + 1}>{currentYear + 1} 年</option>
            </select>
            <button className="manual-create-button" type="submit"><Sparkles /> 归档年度阅读 <ChevronRight /></button>
          </form>
          <div className="manual-privacy"><ShieldCheck /> 不写入服务器、不存入本机缓存；只用于本次页面阅读。</div>
        </aside>

        <div className="manual-reading" id="manual-reading">
          {!started ? (
            <div className="manual-empty-state">
              <NotebookPen />
              <div><span>READING ORDER</span><h3>先读年度总盘，再打开当月档案</h3><p>填写资料后，将以当前的四柱计算结果生成一份本地年度归档页。</p></div>
            </div>
          ) : (
            <>
              <header className="manual-reading-head">
                <div><span>资料署名 / {profileName}</span><h3>{annualLabel}</h3></div>
                <div className="manual-time-marks"><img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="四轨校验印记" /><div className="manual-date-stamp"><CalendarRange /><b>{unlockedThrough} / 12</b><small>月度已开放</small></div></div>
              </header>

              <article className="annual-overview-card">
                <div className="annual-overview-top"><span>总盘 / OVERVIEW</span><Eye /><em>请先阅读</em></div>
                <div className="annual-overview-grid">
                  <div className="annual-nameplate"><small>排盘摘录</small><b>{initialsFromResult(result)}</b><p>五行标记：{elements}</p></div>
                  <div><h4>年度阅读线索</h4><p>这一页以四柱排盘为观察索引，提示你把注意力放在<strong>节奏、沟通、空间与回顾</strong>上。它不替代现实信息、专业意见或人生决定。</p></div>
                  <div><h4>当下资料核对</h4><dl><div><dt>出生地</dt><dd>{profile.birthPlace.trim() || "未填写"}</dd></div><div><dt>现居地</dt><dd>{profile.residence.trim() || "未填写"}</dd></div><div><dt>排盘时刻</dt><dd>{result.correctedTime}</dd></div></dl></div>
                </div>
                <div className="annual-overview-foot"><CircleAlert /> 月度档案会在对应自然月到来时开放；未来月份不显示具体内容。</div>
              </article>

              <div className="month-ledger-head"><div><span>MONTHLY LEDGER</span><h4>月度档案</h4></div><p>{profile.year === currentYear ? `当前仅开放 1 月至 ${currentMonth} 月。` : `${profile.year} 年月度内容将在对应月份开始时开放。`}</p></div>
              <div className="month-ledger" role="list" aria-label="月度档案目录">
                {MONTHS.map((month, index) => {
                  const isOpen = index + 1 <= unlockedThrough;
                  const isActive = activeMonth === index;
                  return (
                    <button type="button" role="listitem" className={`month-ledger-item ${isOpen ? "is-open" : "is-locked"} ${isActive ? "is-active" : ""}`} key={month} disabled={!isOpen} onClick={() => setActiveMonth(index)}>
                      <span>{String(index + 1).padStart(2, "0")}</span><b>{month}</b>{isOpen ? <Eye /> : <LockKeyhole />}
                    </button>
                  );
                })}
              </div>

              {activeMonth !== null && activeMonth + 1 <= unlockedThrough && (
                <article className="monthly-reading-card" aria-live="polite">
                  <div className="monthly-reading-meta"><span>{profile.year} / {String(activeMonth + 1).padStart(2, "0")}</span><button type="button" onClick={() => setActiveMonth(null)}>回到总盘</button></div>
                  <h4>{MONTHS[activeMonth]} · {MONTH_ENTRIES[activeMonth].title}</h4>
                  <div className="monthly-reading-grid"><div><small>本月线索</small><p>{MONTH_ENTRIES[activeMonth].focus}</p></div><div><small>回顾问题</small><p>{MONTH_ENTRIES[activeMonth].prompt}</p></div><div><small>日常提示</small><p>{MONTH_ENTRIES[activeMonth].note}</p></div></div>
                  <p className="monthly-disclaimer">本页为文化研究与个人记录的阅读提示，不构成对未来的确定判断或决策建议。</p>
                </article>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
