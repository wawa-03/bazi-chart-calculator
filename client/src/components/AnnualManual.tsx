/**
 * 观象历书设计提醒：命书延续卷宗式阅读，以资料核对、年度总盘、月份档案的顺序组织；文字保持自我观察语气。
 */
import { FormEvent, useMemo, useState } from "react";
import { Archive, CalendarRange, ChevronRight, CircleAlert, Eye, LockKeyhole, LogIn, NotebookPen, Save, ScrollText, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { getFutureLunarAccess } from "@/lib/annualCycle";
import type { BaziInput, BaziResult } from "@/lib/bazi";

type AnnualManualProps = {
  result: BaziResult;
  input: BaziInput;
  isAuthenticated: boolean;
  onRestoreChart: (input: BaziInput) => void;
};

type ArchiveProfile = { name: string; birthPlace: string; residence: string; year: number };

type MonthEntry = {
  title: string;
  focus: string;
  prompt: string;
  note: string;
};

const MONTHS = [
  "农历正月", "农历二月", "农历三月", "农历四月", "农历五月", "农历六月",
  "农历七月", "农历八月", "农历九月", "农历十月", "农历冬月", "农历腊月",
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

export function AnnualManual({ result, input, isAuthenticated, onRestoreChart }: AnnualManualProps) {
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [profile, setProfile] = useState<ArchiveProfile>({ name: "王二小", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [storageStatus, setStorageStatus] = useState("");
  const archiveUtils = trpc.useUtils();
  const archivesQuery = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated });
  const saveArchive = trpc.archives.save.useMutation({
    onSuccess: () => {
      setStorageStatus("已保存至仅自己可见的私有档案。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "保存未完成，请稍后重试。"),
  });
  const removeArchive = trpc.archives.remove.useMutation({
    onSuccess: () => {
      setStorageStatus("记录及其中的住址资料已永久删除。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "删除未完成，请稍后重试。"),
  });

  const futureAccess = useMemo(() => getFutureLunarAccess(today, profile.year), [profile.year, today]);
  const annualLabel = `${profile.year} 年年度归档`;
  const profileName = profile.name.trim() || "未署名";
  const elements = Array.from(new Set(result.pillars.flatMap((pillar) => Array.from(pillar.wuxing)).filter((value) => "木火土金水".includes(value)))).join("、") || "待核对";

  function beginReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStarted(true);
    setActiveMonth(null);
    window.setTimeout(() => document.getElementById("manual-reading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  function saveCurrentArchive() {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    setStorageStatus("正在保存到你的私有档案…");
    saveArchive.mutate({ input, profile });
  }

  function restoreArchive(record: { inputJson: string; profileJson: string }) {
    try {
      const savedInput = JSON.parse(record.inputJson) as BaziInput;
      const savedProfile = JSON.parse(record.profileJson) as ArchiveProfile;
      if (!savedInput.datetime || !Number.isFinite(savedInput.longitude) || !Number.isFinite(savedInput.latitude)) throw new Error("invalid archive");
      setProfile(savedProfile);
      setStarted(true);
      setActiveMonth(null);
      setStorageStatus("已载入私有档案；未向其他用户展示资料。");
      onRestoreChart(savedInput);
    } catch {
      setStorageStatus("该记录格式不完整，无法恢复。你可以将其删除后重新保存。");
    }
  }

  return (
    <section className="manual-section" id="manual" aria-labelledby="manual-title">
      <header className="manual-intro">
        <div>
          <div className="eyebrow"><ScrollText /> ANNUAL ARCHIVE / 04</div>
          <h2 id="manual-title">把一年归入一卷<br /><strong>可回看的年历档案</strong>。</h2>
        </div>
          <p>先核对当下的生活资料，再查看年度归档；月卷按下一节后的传统农历月面向未来开启。</p>
      </header>

      <div className="manual-layout">
        <aside className="manual-form-sheet" aria-label="命书资料">
          <div className="sheet-kicker"><span>03</span> 年度资料</div>
          <h3>先留一份当下的生活坐标</h3>
          <p>住址默认只用于本次页面核对；只有点击“保存至私有档案”后，才会写入你的账户记录。</p>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-name">称呼或姓名</label>
            <input id="manual-name" value={profile.name} maxLength={24} placeholder="例如：王二小" onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} />
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
          <div className="manual-save-zone">
            <button type="button" className="manual-save-button" onClick={saveCurrentArchive} disabled={saveArchive.isPending}>
              {isAuthenticated ? <Save /> : <LogIn />}{saveArchive.isPending ? "正在保存" : isAuthenticated ? "保存至私有档案" : "登录后保存私有档案"}
            </button>
            <p>{isAuthenticated ? "保存后仅登录账户可见；可在下方永久删除。" : "未登录时不会保存任何姓名或住址资料。"}</p>
          </div>
          <div className="manual-privacy"><ShieldCheck /> 不主动写入服务器、不存入本机缓存；仅在明确保存后进入私有账户档案。</div>

          {isAuthenticated && <section className="archive-vault" aria-label="私有档案">
            <div className="archive-vault-head"><span>PRIVATE ARCHIVE</span><Archive /></div>
            {archivesQuery.isLoading ? <p>正在读取你的私有档案…</p> : archivesQuery.data?.length ? <ul>{archivesQuery.data.map((record) => <li key={record.id}><div><b>{record.label}</b><small>{record.targetYear} 年 · {new Date(record.createdAt).toLocaleDateString("zh-CN")}</small></div><span><button type="button" onClick={() => restoreArchive(record)}>载入</button><button type="button" aria-label={`永久删除 ${record.label}`} onClick={() => removeArchive.mutate({ id: record.id })} disabled={removeArchive.isPending}><Trash2 /></button></span></li>)}</ul> : <p>尚未保存任何资料。保存时会保存当前排盘与本页资料。</p>}
          </section>}
          {storageStatus && <p className="archive-status" aria-live="polite">{storageStatus}</p>}
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
                <div className="manual-time-marks"><img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="四轨校验印记" /><div className="manual-date-stamp"><CalendarRange /><b>{futureAccess.openMonths.length} / 12</b><small>未来月卷可读</small></div></div>
              </header>

              <article className="annual-overview-card">
                <div className="annual-overview-top"><span>总盘 / OVERVIEW</span><Eye /><em>请先阅读</em></div>
                <div className="annual-overview-grid">
                  <div className="annual-nameplate"><small>排盘摘录</small><b>{initialsFromResult(result)}</b><p>五行标记：{elements}</p></div>
                  <div><h4>年度阅读线索</h4><p>这一页以四柱排盘为观察索引，提示你把注意力放在<strong>节奏、沟通、空间与回顾</strong>上。它不替代现实信息、专业意见或人生决定。</p></div>
                  <div><h4>当下资料核对</h4><dl><div><dt>出生地</dt><dd>{profile.birthPlace.trim() || "未填写"}</dd></div><div><dt>现居地</dt><dd>{profile.residence.trim() || "未填写"}</dd></div><div><dt>排盘时刻</dt><dd>{result.correctedTime}</dd></div></dl></div>
                </div>
                <div className="annual-overview-foot"><CircleAlert /> 下一节为“{futureAccess.nextJie}”；仅显示其后可阅读的未来农历月卷，不展示已过月份的内容。</div>
              </article>

              <div className="month-ledger-head"><div><span>FUTURE MONTH LEDGER</span><h4>未来月卷</h4></div><p>{profile.year === currentYear ? futureAccess.startMonth ? `自下一个节“${futureAccess.nextJie}”起，开放农历${MONTHS[futureAccess.startMonth - 1].replace("农历", "")}至腊月。` : "本年度的未来月卷已结束。" : `${profile.year} 年为未来年度，十二个月卷均可预览。`}</p></div>
              <div className="month-ledger" role="list" aria-label="月度档案目录">
                {MONTHS.map((month, index) => {
                  const isOpen = futureAccess.openMonths.includes(index + 1);
                  const isActive = activeMonth === index;
                  return (
                    <button type="button" role="listitem" className={`month-ledger-item ${isOpen ? "is-open" : "is-locked"} ${isActive ? "is-active" : ""}`} key={month} disabled={!isOpen} onClick={() => setActiveMonth(index)}>
                      <span>{String(index + 1).padStart(2, "0")}</span><b>{month}</b>{isOpen ? <Eye /> : <LockKeyhole />}
                    </button>
                  );
                })}
              </div>

              {activeMonth !== null && futureAccess.openMonths.includes(activeMonth + 1) && (
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
