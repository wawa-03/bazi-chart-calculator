/**
 * 年度阅读按“引导—正式内容”分层：先给唯一下一步，再按需展开依据、月卷和私有档案。
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, BadgeCheck, BriefcaseBusiness, ChevronDown, ChevronRight, Compass, Eye, FileDown, HeartHandshake, LockKeyhole, LogIn, NotebookPen, Save, ScrollText, Share2, ShieldCheck, Sparkles, TimerReset, Trash2, WalletCards } from "lucide-react";
import "./AnnualManual.css";
import { startLogin } from "@/const";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { deriveFortuneContrast } from "@/lib/fortuneContrast";
import { type LifeThemeKey } from "@/lib/lifeThemes";
import { deriveFateAnalysis, deriveMonthReading } from "@/lib/fateAnalysis";
import { describeFateReviewStatus } from "@/lib/fateReviewStatus";
import { manualCopy, manualMonth } from "@/lib/manualLanguage";
import { downloadThemeReport } from "@/lib/themeReport";
import { sharePublicPage } from "@/lib/publicShare";
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
  "zh-CN": { kicker: "年度命书", intro: "按月份看。", accent: "先看这个月。", body: "选年份，马上开始。", name: "怎么称呼你", namePlaceholder: "例如：王二小", year: "看哪一年", birthPlace: "出生地（可选）", birthPlaceholder: "例如：北京", residence: "现住地址（可选）", residencePlaceholder: "保存前不会记录", privacy: "不保存，就不会留下。", emptyKicker: "下一步", emptyTitle: "先选称呼和年份。", emptyBody: "我们会打开下一卷未来月卷。", unnamed: "未署名" },
  "zh-TW": { kicker: "年度命書", intro: "按月份看。", accent: "先看這個月。", body: "選年份，馬上開始。", name: "怎麼稱呼你", namePlaceholder: "例如：王二小", year: "看哪一年", birthPlace: "出生地（可選）", birthPlaceholder: "例如：北京", residence: "現住地址（可選）", residencePlaceholder: "保存前不會記錄", privacy: "不保存，就不會留下。", emptyKicker: "下一步", emptyTitle: "先選稱呼和年份。", emptyBody: "我們會打開下一卷未來月卷。", unnamed: "未署名" },
  en: { kicker: "ANNUAL", intro: "Read by month.", accent: "Start here.", body: "Choose a year. Start now.", name: "What should we call you?", namePlaceholder: "For example: Wang Erxiao", year: "Which year?", birthPlace: "Birthplace (optional)", birthPlaceholder: "For example: Beijing", residence: "Address (optional)", residencePlaceholder: "Not saved unless you save", privacy: "Not saved, not kept.", emptyKicker: "NEXT STEP", emptyTitle: "Choose a name and year.", emptyBody: "We will open your next future volume.", unnamed: "Unnamed" },
} as const;

export function AnnualManual({ result, input, isAuthenticated, onRestoreChart }: AnnualManualProps) {
  const { locale: selectedLocale } = useAppLocale();
  const ui = annualUiCopy[selectedLocale];
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [profile, setProfile] = useState<ArchiveProfile>({ name: "", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
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
  const fateReviewQuery = trpc.fateReviews.mine.useQuery(noteQueryInput, { enabled: isAuthenticated && activeArchiveId !== null });
  const saveArchive = trpc.archives.save.useMutation({
    onSuccess: (record) => {
      setActiveArchiveId(record.id);
      setStorageStatus("已存到你的私有档案。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "没存上，请再试一次。"),
  });
  const removeArchive = trpc.archives.remove.useMutation({
    onSuccess: () => {
      setActiveArchiveId(null);
      setStorageStatus("已永久删除。");
      archiveUtils.archives.list.invalidate();
    },
    onError: (error) => setStorageStatus(error.message || "没删掉，请再试一次。"),
  });
  const saveThemeNote = trpc.themeNotes.save.useMutation({
    onSuccess: () => {
      setStorageStatus("已保存到私有笔记。");
      archiveUtils.themeNotes.list.invalidate(noteQueryInput);
    },
    onError: (error) => setStorageStatus(error.message || "没存上，请再试一次。"),
  });
  const removeThemeNote = trpc.themeNotes.remove.useMutation({
    onSuccess: () => {
      setNoteDraft("");
      setStorageStatus("笔记已删除。");
      archiveUtils.themeNotes.list.invalidate(noteQueryInput);
    },
    onError: (error) => setStorageStatus(error.message || "没删掉，请再试一次。"),
  });

  const requestFateReview = trpc.fateReviews.request.useMutation({
    onSuccess: (review) => {
      setStorageStatus(review?.reviewStatus === "pending" ? "已提交人工复核；仅授权命理师可查看此档案。" : "这份命书已有复核记录。" );
      archiveUtils.fateReviews.mine.invalidate(noteQueryInput);
    },
    onError: (error) => setStorageStatus(error.message || "暂时无法提交复核。"),
  });

  const annualAccess = annualWindow.data;
  const copy = manualCopy[selectedLocale];
  const profileName = profile.name.trim() || (selectedLocale === "en" ? "you" : selectedLocale === "zh-TW" ? "你" : "你");
  const dayPillar = result.pillars.find((pillar) => pillar.key === "day")?.ganzhi || "日柱";
  const activeEntry = useMemo(() => activeMonth === null ? undefined : deriveMonthReading(result, input, profile.year, activeMonth, selectedLocale), [activeMonth, input, profile.year, result, selectedLocale]);
  const fate = useMemo(() => deriveFateAnalysis(result, input, selectedLocale, profile.year), [input, profile.year, result, selectedLocale]);
  const themes = useMemo(() => [
    { key: "relationship" as const, ...fate.relationship, question: fate.relationship.judgment, action: fate.relationship.fortune },
    { key: "career" as const, ...fate.career, question: fate.career.judgment, action: fate.career.fortune },
    { key: "finance" as const, ...fate.finance, question: fate.finance.judgment, action: fate.finance.fortune },
    { key: "rhythm" as const, ...fate.rhythm, question: fate.rhythm.judgment, action: fate.rhythm.fortune },
  ], [fate]);
  const selectedTheme = themes.find((theme) => theme.key === activeTheme) || themes[0];
  const fortuneContrast = useMemo(() => deriveFortuneContrast(result, profile.year, selectedLocale), [profile.year, result, selectedLocale]);
  const fateReviewStatus = describeFateReviewStatus(fateReviewQuery.data ?? null, selectedLocale);
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
      setStorageStatus(access?.nextYearAvailable === false && profile.year > access.currentYear ? "明年命书在六月后开放。" : "这一年没有未来月卷。换个年份试试。");
      return;
    }
    setStarted(true);
    setActiveArchiveId(null);
    setActiveMonth(access.openMonths[0] - 1);
    setShowMonthPicker(true);
    setShowThemes(false);
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
      setShowMonthPicker(true);
      setShowThemes(false);
      setActiveArchiveId(record.id);
      setStorageStatus("已打开私有档案。");
      onRestoreChart(savedInput);
    } catch {
      setStorageStatus("这份档案打不开。请重新保存。");
    }
  }

  function saveCurrentThemeNote() {
    if (!isAuthenticated) return startLogin();
    if (!activeArchiveId) {
      setStorageStatus("先保存这份命书，再写笔记。");
      return;
    }
    const content = noteDraft.trim();
    if (!content) {
      setStorageStatus("先写一点，再保存。");
      return;
    }
    saveThemeNote.mutate({ archiveId: activeArchiveId, themeKey: activeTheme, content });
  }

  function requestCurrentFateReview() {
    if (!isAuthenticated) return startLogin();
    if (!activeArchiveId) {
      setStorageStatus("先保存这份命书，再由你决定是否提交人工复核。");
      return;
    }
    requestFateReview.mutate({ archiveId: activeArchiveId });
  }

  function exportCurrentThemeReport() {
    if (!activeArchiveId) {
      setStorageStatus("先保存命书，再导出报告。");
      return;
    }
    downloadThemeReport({
      archiveId: activeArchiveId,
      profile: { name: profile.name, birthPlace: profile.birthPlace, year: profile.year },
      result,
      input,
      locale: selectedLocale,
      openMonths: annualAccess?.openMonths || [],
      themes,
      contrast: fortuneContrast,
      notes: notesQuery.data || [],
    });
    setStorageStatus("报告已下载。不会写入详细住址。");
  }

  async function shareManual() {
    try {
      const outcome = await sharePublicPage(selectedLocale, `${window.location.origin}/`);
      setStorageStatus(outcome === "copied" ? (selectedLocale === "en" ? "Public Guanli link copied." : "公开链接已复制。") : outcome === "unsupported" ? (selectedLocale === "en" ? "Sharing is unavailable in this browser." : "当前浏览器不支持分享。") : (selectedLocale === "en" ? "Shared." : "已分享。"));
    } catch {
      setStorageStatus(selectedLocale === "en" ? "Sharing was cancelled." : "已取消分享。");
    }
  }

  return (
    <section className="manual-section" id="manual" aria-labelledby="manual-title">
      <header className="manual-intro">
        <div>
          <div className="eyebrow"><ScrollText /> {ui.kicker}</div>
          <h2 id="manual-title">{ui.intro}<br /><strong>{ui.accent}</strong></h2>
        </div>
      </header>

      <div className={`manual-layout${started ? " is-reading" : ""}`}>
        <aside className="manual-form-sheet" aria-label="年度阅读引导">
          <div className="sheet-kicker"><span>03</span> {copy.guide}</div>
          <h3>{copy.choose}</h3>
          <p>{copy.guideBody}</p>
          <p className="locale-control-note">{copy.autoLanguage}</p>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-year">{ui.year}</label>
            <select id="manual-year" value={profile.year} onChange={(event) => {
              setProfile((value) => ({ ...value, year: Number(event.target.value) }));
              setStarted(false);
              setActiveMonth(null);
            }}>
              <option value={currentYear}>{currentYear}{selectedLocale === "en" ? "" : " 年"}</option>
              <option value={currentYear + 1} disabled={annualAccess?.nextYearAvailable === false}>{currentYear + 1}{selectedLocale === "en" ? "" : " 年"}{annualAccess?.nextYearAvailable === false ? (selectedLocale === "en" ? " · after June" : selectedLocale === "zh-TW" ? " · 六月後" : " · 六月后") : ""}</option>
            </select>
            <button className="manual-create-button" type="submit" disabled={annualWindow.isFetching}><Sparkles /> {annualWindow.isFetching ? "…" : copy.start} <ChevronRight /></button>
          </form>
          <button className="optional-profile-toggle" type="button" aria-expanded={showOptionalProfile} onClick={() => setShowOptionalProfile((value) => !value)}><ChevronDown /> {copy.optional}</button>
          {showOptionalProfile && <div className="optional-profile-fields"><label htmlFor="manual-name">{ui.name}</label><input id="manual-name" value={profile.name} maxLength={24} placeholder={ui.namePlaceholder} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} /><label htmlFor="manual-birth-place">{ui.birthPlace}</label><input id="manual-birth-place" value={profile.birthPlace} maxLength={60} placeholder={ui.birthPlaceholder} onChange={(event) => setProfile((value) => ({ ...value, birthPlace: event.target.value }))} /><label htmlFor="manual-residence">{ui.residence}</label><textarea id="manual-residence" value={profile.residence} maxLength={140} placeholder={ui.residencePlaceholder} onChange={(event) => setProfile((value) => ({ ...value, residence: event.target.value }))} /></div>}
          <div className="manual-privacy"><ShieldCheck /> {ui.privacy}</div>
          {storageStatus && <p className="archive-status" aria-live="polite">{storageStatus}</p>}
        </aside>

        <div className={`manual-reading${showThemes ? "" : " is-themes-paused"}`} id="manual-reading">
          {!started ? null : (
            <>
              <header className="focus-reading-head"><div><span>{copy.prepared.replace("{name}", profileName)}</span><h3>{profile.year} {copy.future}</h3></div><p><b>{copy.onlyFuture}</b></p></header>
              {showMonthPicker && <section className="month-first-picker" aria-label={copy.future}><header><span>{selectedLocale === "en" ? "MONTHS" : "月份"}</span><b>{selectedLocale === "en" ? "Choose a month" : "先选一个月"}</b></header><div className="future-month-picker" role="list">{Array.from({ length: 12 }, (_, index) => index).map((index) => { const isOpen = Boolean(annualAccess?.openMonths.includes(index + 1)); return <button key={index} type="button" role="listitem" disabled={!isOpen} className={activeMonth === index ? "is-active" : ""} onClick={() => setActiveMonth(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{manualMonth(selectedLocale, index)}</b>{isOpen ? <Eye /> : <LockKeyhole />}</button>; })}</div></section>}
              {activeEntry && activeMonth !== null && <article className="focus-reading-card" aria-live="polite"><div className="focus-reading-meta"><span>{copy.first} / {profile.year}</span><b>{manualMonth(selectedLocale, activeMonth)}</b></div><h4>{activeEntry.title}</h4><p className="focus-personal-line">{selectedLocale === "en" ? <>Flowing month is read with your <strong>{dayPillar}</strong> Day Pillar, month command, Da Yun, and flowing year.</> : <>流月与日柱、月令、大运、流年同看。</>}</p><section><span>{selectedLocale === "en" ? "FLOWING MONTH" : "流月"}</span><p>{activeEntry.focus}</p></section><section><span>{selectedLocale === "en" ? "NATAL LANDING" : "命局"}</span><p>{activeEntry.prompt}</p></section><section><span>{selectedLocale === "en" ? "LUCK CYCLE" : "行运"}</span><p>{activeEntry.note}</p></section><details className="monthly-evidence"><summary><ChevronDown /> {selectedLocale === "en" ? "See derivation" : "看推演依据"}</summary><p>{activeEntry.evidence}</p></details><p className="monthly-disclaimer">{selectedLocale === "en" ? "Traditional chart interpretation only; it does not guarantee events or provide medical, legal, investment, or major life-decision advice." : selectedLocale === "zh-TW" ? "此為命理判讀，不保證事件結果，也不作醫療、法律、投資或重大人生決策依據。" : "这是命理判读，不保证事件结果，也不作为医疗、法律、投资或重大人生决策依据。"}</p></article>}
              {hasAnnualEntitlement ? <>
              <details className="reading-details fortune-contrast-details"><summary><ChevronDown /> {selectedLocale === "en" ? "Longer context" : "延展对照"}</summary><section className="fortune-contrast-card" aria-labelledby="fortune-contrast-title"><div><span>{selectedLocale === "en" ? "LONGER CONTEXT" : "延展对照"}</span><h4 id="fortune-contrast-title">{fortuneContrast.title}</h4></div><dl><div><dt>{selectedLocale === "en" ? "Da Yun" : "大运"}</dt><dd>{fortuneContrast.activeDaYun?.ganzhi || "—"}</dd></div><div><dt>{selectedLocale === "en" ? "Flow year" : "流年"}</dt><dd>{fortuneContrast.flowYear}</dd></div></dl><p>{fortuneContrast.focus}</p><details><summary><ChevronDown /> {selectedLocale === "en" ? "See the contrast index" : "查看对照索引"}</summary><p>{fortuneContrast.evidence}</p></details><p className="life-theme-boundary">{fortuneContrast.boundary}</p></section></details>
              {fateReviewQuery.data?.reviewStatus === "published" && <section className="fate-review-result"><header><BadgeCheck /><div><span>{fateReviewStatus.kicker}</span><h4>{fateReviewQuery.data.structureVerdict || fateReviewStatus.label}</h4></div></header>{fateReviewQuery.data.displayCopy && <p>{fateReviewQuery.data.displayCopy}</p>}<details><summary><ChevronDown /> {selectedLocale === "en" ? "See review basis" : "看复核依据"}</summary><p>{fateReviewQuery.data.rationale || (selectedLocale === "en" ? "The reviewer did not add public-facing basis notes." : "命理师未添加可见依据说明。")}</p>{fateReviewQuery.data.specialCombinationVerdict && <p>{selectedLocale === "en" ? "Special combination: " : "特殊合化："}{fateReviewQuery.data.specialCombinationVerdict}</p>}</details><small>{selectedLocale === "en" ? "A human review remains conditional and does not guarantee an event." : "人工复核仍为条件性命理解读，不保证事件结果。"}</small></section>}
              {selectedTheme && !showThemes && <section className="theme-pause-card" aria-label="可选人生主题"><span>{selectedLocale === "en" ? "OPTIONAL" : "可选阅读"}</span><h4>{selectedLocale === "en" ? "Themes can wait." : "主题，想看再打开。"}</h4><p>{selectedLocale === "en" ? "You do not need an answer now. Stay with this volume, or open a theme when you want." : "现在不用给自己一个答案。先停在这一卷，想看时再打开主题。"}</p><div className="theme-pause-actions"><button type="button" onClick={() => setShowThemes(true)}><Sparkles /> {selectedLocale === "en" ? "Open themes" : "打开主题"}</button><a href="#calculator"><Compass /> {selectedLocale === "en" ? "Back to chart" : "回到排盘"}</a></div></section>}
              {selectedTheme && <section className="life-theme-section" id="life-themes" aria-labelledby="life-theme-title"><header><span>{selectedLocale === "en" ? "FATE DOMAINS" : "命局落点"}</span><h4 id="life-theme-title">{selectedLocale === "en" ? "Read one domain" : "再看一个落点"}</h4><p>{selectedLocale === "en" ? "Each domain shows its natal basis and the active luck-cycle relation." : "每一项都先列命局依据，再看当前行运。"}</p><button className="theme-pause-button" type="button" onClick={() => setShowThemes(false)}>{selectedLocale === "en" ? "Pause domains" : "先停在这里"}</button></header><div className="life-theme-tabs" role="tablist" aria-label={selectedLocale === "en" ? "Fate domains" : "命局落点"}>{themes.map((theme) => { const Icon = themeIcons[theme.key]; return <button key={theme.key} type="button" role="tab" aria-selected={theme.key === activeTheme} className={theme.key === activeTheme ? "is-active" : ""} onClick={() => setActiveTheme(theme.key)}><Icon /><span>{theme.title}</span></button>; })}</div><article className="life-theme-card" role="tabpanel"><div className="life-theme-card-head"><span>{selectedTheme.label}</span><b>{selectedTheme.title}</b></div><p className="life-theme-focus">{selectedTheme.focus}</p><dl><div><dt>{selectedLocale === "en" ? "Natal judgment" : "命局判断"}</dt><dd>{selectedTheme.question}</dd></div><div><dt>{selectedLocale === "en" ? "Luck-cycle landing" : "行运落点"}</dt><dd>{selectedTheme.action}</dd></div></dl><details><summary><ChevronDown /> {selectedLocale === "en" ? "See derivation" : "看推演依据"}</summary><p>{selectedTheme.evidence}</p></details><p className="life-theme-boundary">{selectedTheme.boundary}</p><section className="theme-note-editor"><header><NotebookPen /><div><b>{selectedLocale === "en" ? "Private note" : "私有笔记"}</b><p>{activeArchiveId ? (selectedLocale === "en" ? "Only in this saved reading." : "只存这份命书。") : (selectedLocale === "en" ? "Save this reading first." : "先保存这份命书。")}</p></div></header>{isAuthenticated ? <><textarea value={noteDraft} maxLength={2000} placeholder={selectedLocale === "en" ? "Write a thought…" : "写一点想法…"} onChange={(event) => setNoteDraft(event.target.value)} disabled={!activeArchiveId} /><div><button type="button" onClick={saveCurrentThemeNote} disabled={!activeArchiveId || saveThemeNote.isPending}><Save /> {selectedLocale === "en" ? "Save note" : "保存笔记"}</button>{savedNote && <button type="button" className="quiet" onClick={() => activeArchiveId && removeThemeNote.mutate({ archiveId: activeTheme && activeArchiveId, themeKey: activeTheme })} disabled={removeThemeNote.isPending}><Trash2 /> {selectedLocale === "en" ? "Delete" : "删除"}</button>}</div></> : <button type="button" onClick={startLogin}><LogIn /> {selectedLocale === "en" ? "Log in to save" : "登录后保存"}</button>}</section></article></section>}
              <details className="reading-details focus-actions-details"><summary><ChevronDown /> {selectedLocale === "en" ? "More options" : "更多操作"}</summary><div className="focus-actions"><button type="button" onClick={() => setShowMonthPicker((value) => !value)}><Eye /> {showMonthPicker ? copy.hideMonths : copy.otherMonths}</button><button type="button" className="quiet-action" onClick={saveCurrentArchive} disabled={saveArchive.isPending}>{isAuthenticated ? <Save /> : <LogIn />}{isAuthenticated ? copy.save : copy.login}</button>{isAuthenticated && <button type="button" className="quiet-action" onClick={exportCurrentThemeReport} disabled={!activeArchiveId}><FileDown /> {selectedLocale === "en" ? "Export full theme report" : "导出完整主题报告"}</button>}<button type="button" className="quiet-action" onClick={shareManual}><Share2 /> {selectedLocale === "en" ? "Share Guanli" : "分享观历"}</button><Link className="quiet-action focus-consult-link" href="/consultation?service=deep_reading"><HeartHandshake /> {selectedLocale === "en" ? "Learn about human deep reading" : "了解人工深度解读"}</Link></div></details>
              {isAuthenticated && <section className="fate-review-request"><BadgeCheck /><div><span>{fateReviewStatus.kicker}</span><b>{fateReviewStatus.label}</b><p>{fateReviewStatus.description}</p></div>{fateReviewStatus.canRequest && <button type="button" onClick={requestCurrentFateReview} disabled={!activeArchiveId || requestFateReview.isPending}>{requestFateReview.isPending ? "正在提交…" : "提交复核"}</button>}</section>}
              <details className="reading-details"><summary><ChevronDown /> {copy.basis}</summary><div><p><b>节气：</b>{annualAccess?.timezone || "北京时间"}；下一节“{annualAccess?.nextJie || "校验中"}”；可读 {annualAccess?.openMonths.length || 0} 卷。</p><p><b>排盘：</b>日柱 {dayPillar}；时间 {result.correctedTime}。{profile.birthPlace ? `地点：${profile.birthPlace}。` : ""}</p></div></details>
              <details className="reading-details"><summary><ChevronDown /> {copy.method}</summary><div><p><b>{copy.source}：</b>{annualMethod.data?.calendarLibrary || "lunar-javascript"}；版本 {annualMethod.data?.version || "校验中"}。</p><p>{annualMethod.data?.annualWindow}</p><p>{annualMethod.data?.contentGeneration}</p><p>{annualMethod.data?.limitation}</p></div></details>
              <details className="archive-details" open={showArchive} onToggle={(event) => setShowArchive((event.currentTarget as HTMLDetailsElement).open)}><summary><ChevronDown /> 我的私有档案</summary><div className="archive-details-body"><p>{isAuthenticated ? "只有你能看到。" : "登录后才会保存。"}</p>{isAuthenticated && (archivesQuery.isLoading ? <p>正在读取…</p> : archivesQuery.data?.length ? <ul>{archivesQuery.data.map((record) => <li key={record.id}><div><b>{record.label}</b><small>{record.targetYear} 年 · {new Date(record.createdAt).toLocaleDateString("zh-CN")}</small></div><span><button type="button" onClick={() => restoreArchive(record)}>打开</button><button type="button" aria-label={`永久删除 ${record.label}`} onClick={() => removeArchive.mutate({ id: record.id })} disabled={removeArchive.isPending}><Trash2 /></button></span></li>)}</ul> : <p>还没有保存的命书。</p>)}</div></details>
              </> : <section className="annual-upgrade-gate" aria-label="完整年度命书"><div className="annual-upgrade-stamp"><LockKeyhole /><span>ANNUAL MANUAL / ¥9.90 · US$9.90 · €9.90</span></div><h4>{selectedLocale === "en" ? "You have read the nearest volume. Continue with the full annual manual when you want a longer thread." : "你已读完最近一卷。想把线索延展成全年阅读时，再打开完整年度命书。"}</h4><p>{selectedLocale === "en" ? "The annual manual adds all available future solar-term volumes, Da Yun and flow-year context, four life themes, private reflections, and a complete report. No subscription is required." : "完整年度命书包含其余可读的节气月卷、大运—流年对照、四类人生主题、私有回顾与完整报告；不需要订阅。"}</p><div><Link href="/pricing">{selectedLocale === "en" ? "View annual manual · regional static pricing" : "查看年度命书 · 静态区域定价"} <ChevronRight /></Link><Link className="quiet-link" href="/consultation?service=annual_manual">{selectedLocale === "en" ? "Ask a question first" : "先咨询后再决定"}</Link></div><small>{selectedLocale === "en" ? "Payment is not yet enabled. Actual currency, taxes, instant-delivery consent, and refund terms will be confirmed before checkout." : "支付尚未开启；实际收款币种、税费、即时交付同意与退款条款会在结账前明确展示。"}</small></section>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
