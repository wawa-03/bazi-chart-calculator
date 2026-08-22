/**
 * 年度阅读按“引导—正式内容”分层：先给唯一下一步，再按需展开依据、月卷和私有档案。
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, ChevronDown, ChevronRight, Compass, Eye, LockKeyhole, LogIn, Save, ScrollText, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import type { BaziInput, BaziResult } from "@/lib/bazi";

type AnnualManualProps = {
  result: BaziResult;
  input: BaziInput;
  isAuthenticated: boolean;
  onRestoreChart: (input: BaziInput) => void;
};

type ArchiveProfile = { name: string; birthPlace: string; residence: string; year: number };
type MonthEntry = { title: string; focus: string; prompt: string; note: string };

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
  { title: "中程复盘", focus: "为上半年的经验留出可回看的位置。", prompt: "哪些经验值得带入接下来的安排？", note: "可盘点已完成事项，调整不再适合的承诺。" },
  { title: "关系与空间", focus: "把日常空间和重要关系重新照看一遍。", prompt: "有什么细节能让共同生活更从容？", note: "适合整理居住环境，安排低负担的相聚与休息。" },
  { title: "边界与选择", focus: "面对选项时，先确认自己的时间容量。", prompt: "这项选择是否匹配当下的精力与节奏？", note: "适合减少不必要的并行任务，建立清楚的优先级。" },
  { title: "沉静与沉淀", focus: "把外部噪声减到足以听见自己的程度。", prompt: "哪一件事可以暂缓，而不影响真正重要的目标？", note: "适合复盘资料与承诺，但不急于给出结论。" },
  { title: "收成与表达", focus: "识别一年里已经形成的能力与经验。", prompt: "我可以如何更清楚地表达自己的工作与需求？", note: "适合整理成果、更新档案，并为后续合作做好准备。" },
  { title: "回顾与致谢", focus: "为一年中的支持与变化留下回应。", prompt: "今年哪些人与事值得被认真感谢？", note: "适合完成收尾沟通，减少遗留事项对年底节奏的干扰。" },
  { title: "归档与展望", focus: "让结束成为下一轮计划的可靠起点。", prompt: "明年最希望保留的生活原则是什么？", note: "适合归档年度记录，给未来计划留下弹性。" },
];

export function AnnualManual({ result, input, isAuthenticated, onRestoreChart }: AnnualManualProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [profile, setProfile] = useState<ArchiveProfile>({ name: "王二小", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [storageStatus, setStorageStatus] = useState("");
  const archiveUtils = trpc.useUtils();
  const annualWindow = trpc.annual.window.useQuery({ targetYear: profile.year });
  const archivesQuery = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated && showArchive });
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

  const annualAccess = annualWindow.data;
  const profileName = profile.name.trim() || "未署名";
  const dayPillar = result.pillars.find((pillar) => pillar.key === "day")?.ganzhi || "日柱";
  const activeEntry = activeMonth === null ? undefined : MONTH_ENTRIES[activeMonth];

  useEffect(() => {
    if (started && activeMonth === null && annualAccess?.openMonths[0]) {
      setActiveMonth(annualAccess.openMonths[0] - 1);
    }
  }, [activeMonth, annualAccess?.openMonths, started]);

  async function beginReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await annualWindow.refetch();
    const access = response.data;
    if (!access?.openMonths.length) {
      setStorageStatus("当前年份没有可读的未来月卷，请选择当前年或下一年。");
      return;
    }
    setStarted(true);
    setActiveMonth(access.openMonths[0] - 1);
    setShowMonthPicker(false);
    globalThis.window.setTimeout(() => document.getElementById("manual-reading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
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
      setShowMonthPicker(false);
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
          <h2 id="manual-title">不必一次看完。<br /><strong>先读下一卷。</strong></h2>
        </div>
        <p>先用一分钟完成引导，再进入与你的排盘、目标年份与下一节相关的正式阅读。</p>
      </header>

      <div className="manual-layout">
        <aside className="manual-form-sheet" aria-label="年度阅读引导">
          <div className="sheet-kicker"><span>03</span> 阅读引导</div>
          <h3>只做两个选择</h3>
          <p>选择年份，确认称呼。其他资料可以稍后补充，不妨碍开始阅读。</p>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-name">称呼或姓名</label>
            <input id="manual-name" value={profile.name} maxLength={24} placeholder="例如：王二小" onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} />
            <label htmlFor="manual-year">阅读年份</label>
            <select id="manual-year" value={profile.year} onChange={(event) => {
              setProfile((value) => ({ ...value, year: Number(event.target.value) }));
              setStarted(false);
              setActiveMonth(null);
            }}>
              <option value={currentYear}>{currentYear} 年</option>
              <option value={currentYear + 1}>{currentYear + 1} 年</option>
            </select>
            <button className="manual-create-button" type="submit" disabled={annualWindow.isFetching}><Sparkles /> {annualWindow.isFetching ? "正在准备" : "开始下一卷"} <ChevronRight /></button>
          </form>
          <button className="optional-profile-toggle" type="button" aria-expanded={showOptionalProfile} onClick={() => setShowOptionalProfile((value) => !value)}><ChevronDown /> 补充生活资料（可选）</button>
          {showOptionalProfile && <div className="optional-profile-fields"><label htmlFor="manual-birth-place">出生地点</label><input id="manual-birth-place" value={profile.birthPlace} maxLength={60} placeholder="例如：北京市东城区" onChange={(event) => setProfile((value) => ({ ...value, birthPlace: event.target.value }))} /><label htmlFor="manual-residence">现居详细地址</label><textarea id="manual-residence" value={profile.residence} maxLength={140} placeholder="可填写至门牌号；仅明确保存时才写入私有档案" onChange={(event) => setProfile((value) => ({ ...value, residence: event.target.value }))} /></div>}
          <div className="manual-privacy"><ShieldCheck /> 未点击保存前，资料只停留在当前页面。</div>
          {storageStatus && <p className="archive-status" aria-live="polite">{storageStatus}</p>}
        </aside>

        <div className="manual-reading" id="manual-reading">
          {!started ? (
            <div className="manual-empty-state focus-empty-state"><Compass /><div><span>ONE CLEAR NEXT STEP</span><h3>现在不需要处理全部资料。</h3><p>左侧完成称呼与年份后，系统会从服务端按北京时间与下一节，准备一卷可以直接开始的未来月卷。</p></div></div>
          ) : (
            <>
              <header className="focus-reading-head"><div><span>为 {profileName} 准备</span><h3>{profile.year} 年未来月卷</h3></div><p><b>下一节：{annualAccess?.nextJie || "校验中"}</b> · 只显示未来月卷</p></header>
              {activeEntry && activeMonth !== null && <article className="focus-reading-card" aria-live="polite"><div className="focus-reading-meta"><span>先读这一卷 / {profile.year}</span><b>{MONTHS[activeMonth]}</b></div><h4>{activeEntry.title}</h4><p className="focus-personal-line">这卷以你的<strong>{dayPillar}</strong>日柱、已校正的出生时刻与下一节<strong>{annualAccess?.nextJie || ""}</strong>作为阅读坐标。先只处理一个问题。</p><section><span>本月线索</span><p>{activeEntry.focus}</p></section><section><span>给自己的一个问题</span><p>{activeEntry.prompt}</p></section><section><span>轻量行动提示</span><p>{activeEntry.note}</p></section><p className="monthly-disclaimer">这是结合你当前排盘与时间窗口的文化研究阅读提示，不构成对未来的确定判断或人生决策建议。</p></article>}
              <div className="focus-actions"><button type="button" onClick={() => setShowMonthPicker((value) => !value)}><Eye /> {showMonthPicker ? "收起其他月卷" : "选择其他未来月卷"}</button><button type="button" className="quiet-action" onClick={saveCurrentArchive} disabled={saveArchive.isPending}>{isAuthenticated ? <Save /> : <LogIn />}{isAuthenticated ? "保存这份阅读" : "登录后保存"}</button></div>
              {showMonthPicker && <div className="future-month-picker" role="list" aria-label="未来月卷选择">{MONTHS.map((month, index) => { const isOpen = Boolean(annualAccess?.openMonths.includes(index + 1)); return <button key={month} type="button" role="listitem" disabled={!isOpen} className={activeMonth === index ? "is-active" : ""} onClick={() => setActiveMonth(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{month}</b>{isOpen ? <Eye /> : <LockKeyhole />}</button>; })}</div>}
              <details className="reading-details"><summary><ChevronDown /> 想了解这卷的依据？</summary><div><p><b>服务端节气窗口：</b>使用 {annualAccess?.timezone || "北京时间"} 计算；下一节为“{annualAccess?.nextJie || "校验中"}”，当前可读 {annualAccess?.openMonths.length || 0} 卷。</p><p><b>你的排盘信息：</b>日柱 {dayPillar}，用于排盘时刻 {result.correctedTime}。{profile.birthPlace ? `出生地点：${profile.birthPlace}。` : ""}</p></div></details>
              <details className="archive-details" open={showArchive} onToggle={(event) => setShowArchive((event.currentTarget as HTMLDetailsElement).open)}><summary><ChevronDown /> 私有档案与保存</summary><div className="archive-details-body"><p>{isAuthenticated ? "保存后仅登录账户可见；完整住址仅在主动载入时使用。" : "未登录时不会保存姓名或住址资料。"}</p>{isAuthenticated && (archivesQuery.isLoading ? <p>正在读取私有档案…</p> : archivesQuery.data?.length ? <ul>{archivesQuery.data.map((record) => <li key={record.id}><div><b>{record.label}</b><small>{record.targetYear} 年 · {new Date(record.createdAt).toLocaleDateString("zh-CN")}</small></div><span><button type="button" onClick={() => restoreArchive(record)}>载入</button><button type="button" aria-label={`永久删除 ${record.label}`} onClick={() => removeArchive.mutate({ id: record.id })} disabled={removeArchive.isPending}><Trash2 /></button></span></li>)}</ul> : <p>还没有已保存的阅读。</p>)}</div></details>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
