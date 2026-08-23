/**
 * 年度阅读按“引导—正式内容”分层：先给唯一下一步，再按需展开依据、月卷和私有档案。
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, BriefcaseBusiness, ChevronDown, ChevronRight, Compass, Eye, FileDown, HeartHandshake, LockKeyhole, LogIn, NotebookPen, Save, ScrollText, ShieldCheck, Sparkles, TimerReset, Trash2, WalletCards } from "lucide-react";
import "./AnnualManual.css";
import { startLogin } from "@/const";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { deriveFortuneContrast } from "@/lib/fortuneContrast";
import { deriveLifeThemes, type LifeThemeKey } from "@/lib/lifeThemes";
import { manualCopy, manualEntry, manualMonth } from "@/lib/manualLanguage";
import { downloadThemeReport } from "@/lib/themeReport";
import { trpc } from "@/lib/trpc";
import type { BaziInput, BaziResult } from "@/lib/bazi";
import { Link } from "wouter";

type AnnualManualProps = {
  result: BaziResult;
  input: BaziInput;
  isAuthenticated: boolean;
  onRestoreChart: (input: BaziInput) => void;
};

type ArchiveProfile = { name: string; birthPlace: string; residence: string; year: number };

const annualUiCopy = {
  "zh-CN": { kicker: "年度阅读 / 04", intro: "不必一次看完。", accent: "先读下一卷。", body: "先用一分钟完成引导，再进入与你的排盘、目标年份与下一节相关的正式阅读。", name: "称呼或姓名", namePlaceholder: "例如：王二小", year: "阅读年份", birthPlace: "出生地点", birthPlaceholder: "例如：北京市东城区", residence: "现居详细地址", residencePlaceholder: "可填写至门牌号；仅明确保存时才写入私有档案", privacy: "未点击保存前，资料只停留在当前页面。", emptyKicker: "一个清晰的下一步", emptyTitle: "现在不需要处理全部资料。", emptyBody: "左侧完成称呼与年份后，系统会从服务端按北京时间与下一节，准备一卷可以直接开始的未来月卷。", unnamed: "未署名" },
  "zh-TW": { kicker: "年度閱讀 / 04", intro: "不必一次看完。", accent: "先讀下一卷。", body: "先用一分鐘完成引導，再進入與你的排盤、目標年份與下一節相關的正式閱讀。", name: "稱呼或姓名", namePlaceholder: "例如：王二小", year: "閱讀年份", birthPlace: "出生地點", birthPlaceholder: "例如：北京市東城區", residence: "現居詳細地址", residencePlaceholder: "可填寫至門牌號；僅明確保存時才寫入私人檔案", privacy: "未點擊保存前，資料只停留在目前頁面。", emptyKicker: "一個清晰的下一步", emptyTitle: "現在不需要處理全部資料。", emptyBody: "左側完成稱呼與年份後，系統會從伺服器按北京時間與下一節，準備一卷可以直接開始的未來月卷。", unnamed: "未署名" },
  en: { kicker: "ANNUAL READING / 04", intro: "You do not need to read it all at once.", accent: "Begin with the next volume.", body: "Spend one minute on the guide, then enter a focused reading connected to your chart, chosen year, and next solar term.", name: "Name or preferred form of address", namePlaceholder: "For example: Wang Erxiao", year: "Reading year", birthPlace: "Birthplace", birthPlaceholder: "For example: Dongcheng District, Beijing", residence: "Current address", residencePlaceholder: "You may include a street number; it is saved only when you explicitly choose to save.", privacy: "Until you choose Save, these details remain only on this page.", emptyKicker: "ONE CLEAR NEXT STEP", emptyTitle: "You do not need to process every detail now.", emptyBody: "After confirming a name and year, the server uses Beijing time and the next solar term to prepare one future volume you can start immediately.", unnamed: "Unsigned" },
} as const;

export function AnnualManual({ result, input, isAuthenticated, onRestoreChart }: AnnualManualProps) {
  const { locale: selectedLocale } = useAppLocale();
  const ui = annualUiCopy[selectedLocale];
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [profile, setProfile] = useState<ArchiveProfile>({ name: "王二小", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [storageStatus, setStorageStatus] = useState("");
  const [activeTheme, setActiveTheme] = useState<LifeThemeKey>("relationship");
  const [activeArchiveId, setActiveArchiveId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const archiveUtils = trpc.useUtils();
  const annualWindow = trpc.annual.window.useQuery({ targetYear: profile.year });
  const annualMethod = trpc.annual.method.useQuery();
  const archivesQuery = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated && showArchive });
  const noteQueryInput = useMemo(() => ({ archiveId: activeArchiveId ?? 0 }), [activeArchiveId]);
  const notesQuery = trpc.themeNotes.list.useQuery(noteQueryInput, { enabled: isAuthenticated && activeArchiveId !== null });
  const saveArchive = trpc.archives.save.useMutation({
    onSuccess: (record) => {
      setActiveArchiveId(record.id);
      setStorageStatus("已保存至仅自己可见的私有档案。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "保存未完成，请稍后重试。"),
  });
  const removeArchive = trpc.archives.remove.useMutation({
    onSuccess: () => {
      setActiveArchiveId(null);
      setStorageStatus("记录及其中的住址资料已永久删除。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "删除未完成，请稍后重试。"),
  });
  const saveThemeNote = trpc.themeNotes.save.useMutation({
    onSuccess: () => {
      setStorageStatus("主题回顾已保存至此命书的私有笔记。");
      archiveUtils.themeNotes.list.invalidate(noteQueryInput);
    },
    onError: (error) => setStorageStatus(error.message || "主题笔记未保存，请稍后重试。"),
  });
  const removeThemeNote = trpc.themeNotes.remove.useMutation({
    onSuccess: () => {
      setNoteDraft("");
      setStorageStatus("该主题回顾笔记已删除。");
      archiveUtils.themeNotes.list.invalidate(noteQueryInput);
    },
    onError: (error) => setStorageStatus(error.message || "主题笔记未删除，请稍后重试。"),
  });

  const annualAccess = annualWindow.data;
  const copy = manualCopy[selectedLocale];
  const profileName = profile.name.trim() || ui.unnamed;
  const dayPillar = result.pillars.find((pillar) => pillar.key === "day")?.ganzhi || "日柱";
  const activeEntry = activeMonth === null ? undefined : manualEntry(selectedLocale, activeMonth);
  const themes = useMemo(() => deriveLifeThemes(result, selectedLocale), [result, selectedLocale]);
  const selectedTheme = themes.find((theme) => theme.key === activeTheme) || themes[0];
  const fortuneContrast = useMemo(() => deriveFortuneContrast(result, profile.year, selectedLocale), [profile.year, result, selectedLocale]);
  const savedNote = notesQuery.data?.find((note) => note.themeKey === activeTheme);
  const themeIcons = { relationship: HeartHandshake, career: BriefcaseBusiness, finance: WalletCards, rhythm: TimerReset } as const;
  // The annual manual, life themes, and report remain openly available. Any
  // separate human service is requested through the consultation flow.
  const hasAnnualEntitlement = true;

  useEffect(() => {
    if (started && activeMonth === null && annualAccess?.openMonths[0]) {
      setActiveMonth(annualAccess.openMonths[0] - 1);
    }
  }, [activeMonth, annualAccess?.openMonths, started]);

  useEffect(() => {
    setNoteDraft(savedNote?.content || "");
  }, [activeTheme, savedNote?.content]);

  async function beginReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await annualWindow.refetch();
    const access = response.data;
    if (!access?.openMonths.length) {
      setStorageStatus("当前年份没有可读的未来月卷，请选择当前年或下一年。");
      return;
    }
    setStarted(true);
    setActiveArchiveId(null);
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

  function restoreArchive(record: { id: number; inputJson: string; profileJson: string }) {
    try {
      const savedInput = JSON.parse(record.inputJson) as BaziInput;
      const savedProfile = JSON.parse(record.profileJson) as ArchiveProfile;
      if (!savedInput.datetime || !Number.isFinite(savedInput.longitude) || !Number.isFinite(savedInput.latitude)) throw new Error("invalid archive");
      setProfile(savedProfile);
      setStarted(true);
      setActiveMonth(null);
      setShowMonthPicker(false);
      setActiveArchiveId(record.id);
      setStorageStatus("已载入私有档案；未向其他用户展示资料。");
      onRestoreChart(savedInput);
    } catch {
      setStorageStatus("该记录格式不完整，无法恢复。你可以将其删除后重新保存。");
    }
  }

  function saveCurrentThemeNote() {
    if (!isAuthenticated) return startLogin();
    if (!activeArchiveId) {
      setStorageStatus("请先保存或载入这份命书，再为主题写下私有回顾。");
      return;
    }
    const content = noteDraft.trim();
    if (!content) {
      setStorageStatus("先写下一句回顾，再保存主题笔记。 ");
      return;
    }
    saveThemeNote.mutate({ archiveId: activeArchiveId, themeKey: activeTheme, content });
  }

  function exportCurrentThemeReport() {
    if (!activeArchiveId) {
      setStorageStatus("完整主题报告只针对已保存或已载入的命书生成。 ");
      return;
    }
    downloadThemeReport({
      archiveId: activeArchiveId,
      profile: { name: profile.name, birthPlace: profile.birthPlace, year: profile.year },
      result,
      locale: selectedLocale,
      openMonths: annualAccess?.openMonths || [],
      themes,
      contrast: fortuneContrast,
      notes: notesQuery.data || [],
    });
    setStorageStatus("完整主题报告已在当前浏览器生成下载；详细住址不会写入报告。 ");
  }

  return (
    <section className="manual-section" id="manual" aria-labelledby="manual-title">
      <header className="manual-intro">
        <div>
          <div className="eyebrow"><ScrollText /> {ui.kicker}</div>
          <h2 id="manual-title">{ui.intro}<br /><strong>{ui.accent}</strong></h2>
        </div>
        <p>{ui.body}</p>
      </header>

      <div className="manual-layout">
        <aside className="manual-form-sheet" aria-label="年度阅读引导">
          <div className="sheet-kicker"><span>03</span> {copy.guide}</div>
          <h3>{copy.choose}</h3>
          <p>{copy.guideBody}</p>
          <p className="locale-control-note">{copy.autoLanguage}</p>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-name">{ui.name}</label>
            <input id="manual-name" value={profile.name} maxLength={24} placeholder={ui.namePlaceholder} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} />
            <label htmlFor="manual-year">{ui.year}</label>
            <select id="manual-year" value={profile.year} onChange={(event) => {
              setProfile((value) => ({ ...value, year: Number(event.target.value) }));
              setStarted(false);
              setActiveMonth(null);
            }}>
              <option value={currentYear}>{currentYear}{selectedLocale === "en" ? "" : " 年"}</option>
              <option value={currentYear + 1}>{currentYear + 1}{selectedLocale === "en" ? "" : " 年"}</option>
            </select>
            <button className="manual-create-button" type="submit" disabled={annualWindow.isFetching}><Sparkles /> {annualWindow.isFetching ? "…" : copy.start} <ChevronRight /></button>
          </form>
          <button className="optional-profile-toggle" type="button" aria-expanded={showOptionalProfile} onClick={() => setShowOptionalProfile((value) => !value)}><ChevronDown /> {copy.optional}</button>
          {showOptionalProfile && <div className="optional-profile-fields"><label htmlFor="manual-birth-place">{ui.birthPlace}</label><input id="manual-birth-place" value={profile.birthPlace} maxLength={60} placeholder={ui.birthPlaceholder} onChange={(event) => setProfile((value) => ({ ...value, birthPlace: event.target.value }))} /><label htmlFor="manual-residence">{ui.residence}</label><textarea id="manual-residence" value={profile.residence} maxLength={140} placeholder={ui.residencePlaceholder} onChange={(event) => setProfile((value) => ({ ...value, residence: event.target.value }))} /></div>}
          <div className="manual-privacy"><ShieldCheck /> {ui.privacy}</div>
          {storageStatus && <p className="archive-status" aria-live="polite">{storageStatus}</p>}
        </aside>

        <div className="manual-reading" id="manual-reading">
          {!started ? (
            <div className="manual-empty-state focus-empty-state"><Compass /><div><span>{ui.emptyKicker}</span><h3>{ui.emptyTitle}</h3><p>{ui.emptyBody}</p><p className="theme-entry-note"><NotebookPen /> {selectedLocale === "en" ? "After you begin the next volume, Relationship, Work, Money, and Daily rhythm appear directly below that monthly reading." : "开始下一卷后，关系与亲密、事业与路径、财务与资源、生活节奏会显示在该月卷下方。"}</p></div></div>
          ) : (
            <>
              <header className="focus-reading-head"><div><span>{copy.prepared.replace("{name}", profileName)}</span><h3>{profile.year} {copy.future}</h3></div><p><b>{copy.nextJie}: {annualAccess?.nextJie || "…"}</b> · {copy.onlyFuture}</p></header>
              {activeEntry && activeMonth !== null && <article className="focus-reading-card" aria-live="polite"><div className="focus-reading-meta"><span>{copy.first} / {profile.year}</span><b>{manualMonth(selectedLocale, activeMonth)}</b></div><h4>{activeEntry.title}</h4><p className="focus-personal-line">{selectedLocale === "en" ? <>This volume uses your <strong>{dayPillar}</strong> day pillar, corrected birth time, and the next solar term <strong>{annualAccess?.nextJie || ""}</strong> as reading coordinates.</> : <>这卷以你的<strong>{dayPillar}</strong>日柱、已校正的出生时刻与下一节<strong>{annualAccess?.nextJie || ""}</strong>作为阅读坐标。先只处理一个问题。</>}</p><section><span>{copy.cue}</span><p>{activeEntry.focus}</p></section><section><span>{copy.question}</span><p>{activeEntry.prompt}</p></section><section><span>{copy.action}</span><p>{activeEntry.note}</p></section><p className="monthly-disclaimer">{selectedLocale === "en" ? "This is a cultural-research reading prompt, not a certain prediction or life-decision recommendation." : "这是结合你当前排盘与时间窗口的文化研究阅读提示，不构成对未来的确定判断或人生决策建议。"}</p></article>}
              {hasAnnualEntitlement ? <>
              <section className="fortune-contrast-card" aria-labelledby="fortune-contrast-title"><div><span>{selectedLocale === "en" ? "LONGER CONTEXT" : "延展对照"}</span><h4 id="fortune-contrast-title">{fortuneContrast.title}</h4></div><dl><div><dt>{selectedLocale === "en" ? "Da Yun" : "大运"}</dt><dd>{fortuneContrast.activeDaYun?.ganzhi || "—"}</dd></div><div><dt>{selectedLocale === "en" ? "Flow year" : "流年"}</dt><dd>{fortuneContrast.flowYear}</dd></div></dl><p>{fortuneContrast.focus}</p><details><summary><ChevronDown /> {selectedLocale === "en" ? "See the contrast index" : "查看对照索引"}</summary><p>{fortuneContrast.evidence}</p></details><p className="life-theme-boundary">{fortuneContrast.boundary}</p></section>
              {selectedTheme && <section className="life-theme-section" id="life-themes" aria-labelledby="life-theme-title"><header><span>{selectedLocale === "en" ? "PERSONAL THEMES" : "人生主题 / 在未来月卷下方"}</span><h4 id="life-theme-title">{selectedLocale === "en" ? "Choose one area to explore" : "选择一个想先看的方向"}</h4><p>{selectedLocale === "en" ? "These are reflective prompts linked to visible markers in your chart—not forecasts of outcomes." : "这些是与排盘可见标记关联的反思线索，不是对结果的预言。"}</p></header><div className="life-theme-tabs" role="tablist" aria-label={selectedLocale === "en" ? "Life themes" : "人生主题"}>{themes.map((theme) => { const Icon = themeIcons[theme.key]; return <button key={theme.key} type="button" role="tab" aria-selected={theme.key === activeTheme} className={theme.key === activeTheme ? "is-active" : ""} onClick={() => setActiveTheme(theme.key)}><Icon /><span>{theme.title}</span></button>; })}</div><article className="life-theme-card" role="tabpanel"><div className="life-theme-card-head"><span>{selectedTheme.label}</span><b>{selectedTheme.title}</b></div><p className="life-theme-focus">{selectedTheme.focus}</p><dl><div><dt>{selectedLocale === "en" ? "A question" : "一个问题"}</dt><dd>{selectedTheme.question}</dd></div><div><dt>{selectedLocale === "en" ? "A small action" : "一个小行动"}</dt><dd>{selectedTheme.action}</dd></div></dl><details><summary><ChevronDown /> {selectedLocale === "en" ? "See the chart index for this theme" : "查看此主题的排盘索引"}</summary><p>{selectedTheme.evidence}</p></details><p className="life-theme-boundary">{selectedTheme.boundary}</p><section className="theme-note-editor"><header><NotebookPen /><div><b>{selectedLocale === "en" ? "Private reflection" : "私有主题回顾"}</b><p>{activeArchiveId ? (selectedLocale === "en" ? "This note belongs only to the currently saved reading." : "这条笔记只属于当前已保存的命书。") : (selectedLocale === "en" ? "Save or load this reading before adding a private note." : "请先保存或载入这份命书，再写下私有笔记。")}</p></div></header>{isAuthenticated ? <><textarea value={noteDraft} maxLength={2000} placeholder={selectedLocale === "en" ? "Write a short reflection…" : "写下这一次阅读后的回顾…"} onChange={(event) => setNoteDraft(event.target.value)} disabled={!activeArchiveId} /><div><button type="button" onClick={saveCurrentThemeNote} disabled={!activeArchiveId || saveThemeNote.isPending}><Save /> {selectedLocale === "en" ? "Save reflection" : "保存回顾"}</button>{savedNote && <button type="button" className="quiet" onClick={() => activeArchiveId && removeThemeNote.mutate({ archiveId: activeArchiveId, themeKey: activeTheme })} disabled={removeThemeNote.isPending}><Trash2 /> {selectedLocale === "en" ? "Delete" : "删除"}</button>}</div></> : <button type="button" onClick={startLogin}><LogIn /> {selectedLocale === "en" ? "Log in to save a reflection" : "登录后保存主题回顾"}</button>}</section></article></section>}
              <div className="focus-actions"><button type="button" onClick={() => setShowMonthPicker((value) => !value)}><Eye /> {showMonthPicker ? copy.hideMonths : copy.otherMonths}</button><button type="button" className="quiet-action" onClick={saveCurrentArchive} disabled={saveArchive.isPending}>{isAuthenticated ? <Save /> : <LogIn />}{isAuthenticated ? copy.save : copy.login}</button>{isAuthenticated && <button type="button" className="quiet-action" onClick={exportCurrentThemeReport} disabled={!activeArchiveId}><FileDown /> {selectedLocale === "en" ? "Export full theme report" : "导出完整主题报告"}</button>}</div>
              {showMonthPicker && <div className="future-month-picker" role="list" aria-label={copy.future}>{Array.from({ length: 12 }, (_, index) => index).map((index) => { const isOpen = Boolean(annualAccess?.openMonths.includes(index + 1)); return <button key={index} type="button" role="listitem" disabled={!isOpen} className={activeMonth === index ? "is-active" : ""} onClick={() => setActiveMonth(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{manualMonth(selectedLocale, index)}</b>{isOpen ? <Eye /> : <LockKeyhole />}</button>; })}</div>}
              <details className="reading-details"><summary><ChevronDown /> {copy.basis}</summary><div><p><b>服务端节气窗口：</b>使用 {annualAccess?.timezone || "北京时间"} 计算；下一节为“{annualAccess?.nextJie || "校验中"}”，当前可读 {annualAccess?.openMonths.length || 0} 卷。</p><p><b>你的排盘信息：</b>日柱 {dayPillar}，用于排盘时刻 {result.correctedTime}。{profile.birthPlace ? `出生地点：${profile.birthPlace}。` : ""}</p></div></details>
              <details className="reading-details"><summary><ChevronDown /> {copy.method}</summary><div><p><b>{copy.source}：</b>{annualMethod.data?.calendarLibrary || "lunar-javascript"}；版本 {annualMethod.data?.version || "校验中"}。</p><p>{annualMethod.data?.annualWindow}</p><p>{annualMethod.data?.contentGeneration}</p><p>{annualMethod.data?.limitation}</p></div></details>
              <details className="archive-details" open={showArchive} onToggle={(event) => setShowArchive((event.currentTarget as HTMLDetailsElement).open)}><summary><ChevronDown /> 私有档案与保存</summary><div className="archive-details-body"><p>{isAuthenticated ? "保存后仅登录账户可见；完整住址仅在主动载入时使用。" : "未登录时不会保存姓名或住址资料。"}</p>{isAuthenticated && (archivesQuery.isLoading ? <p>正在读取私有档案…</p> : archivesQuery.data?.length ? <ul>{archivesQuery.data.map((record) => <li key={record.id}><div><b>{record.label}</b><small>{record.targetYear} 年 · {new Date(record.createdAt).toLocaleDateString("zh-CN")}</small></div><span><button type="button" onClick={() => restoreArchive(record)}>载入</button><button type="button" aria-label={`永久删除 ${record.label}`} onClick={() => removeArchive.mutate({ id: record.id })} disabled={removeArchive.isPending}><Trash2 /></button></span></li>)}</ul> : <p>还没有已保存的阅读。</p>)}</div></details>
              </> : <section className="annual-upgrade-gate" aria-label="完整年度命书"><div className="annual-upgrade-stamp"><LockKeyhole /><span>ANNUAL MANUAL / ¥9.90 · US$9.90 · €9.90</span></div><h4>{selectedLocale === "en" ? "You have read the nearest volume. Continue with the full annual manual when you want a longer thread." : "你已读完最近一卷。想把线索延展成全年阅读时，再打开完整年度命书。"}</h4><p>{selectedLocale === "en" ? "The annual manual adds all available future solar-term volumes, Da Yun and flow-year context, four life themes, private reflections, and a complete report. No subscription is required." : "完整年度命书包含其余可读的节气月卷、大运—流年对照、四类人生主题、私有回顾与完整报告；不需要订阅。"}</p><div><Link href="/pricing">{selectedLocale === "en" ? "View annual manual · regional static pricing" : "查看年度命书 · 静态区域定价"} <ChevronRight /></Link><Link className="quiet-link" href="/consultation?service=annual_manual">{selectedLocale === "en" ? "Ask a question first" : "先咨询后再决定"}</Link></div><small>{selectedLocale === "en" ? "Payment is not yet enabled. Actual currency, taxes, instant-delivery consent, and refund terms will be confirmed before checkout." : "支付尚未开启；实际收款币种、税费、即时交付同意与退款条款会在结账前明确展示。"}</small></section>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
