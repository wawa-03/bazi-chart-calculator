/**
 * 年度阅读按“引导—正式内容”分层：先给唯一下一步，再按需展开依据、月卷和私有档案。
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, BriefcaseBusiness, ChevronDown, ChevronRight, Compass, Eye, HeartHandshake, LockKeyhole, LogIn, Save, ScrollText, ShieldCheck, Sparkles, TimerReset, Trash2, WalletCards } from "lucide-react";
import "./AnnualManual.css";
import { startLogin } from "@/const";
import { deriveLifeThemes, type LifeThemeKey } from "@/lib/lifeThemes";
import { manualCopy, manualEntry, manualLocales, manualMonth, type ManualLocale } from "@/lib/manualLanguage";
import { trpc } from "@/lib/trpc";
import type { BaziInput, BaziResult } from "@/lib/bazi";

type AnnualManualProps = {
  result: BaziResult;
  input: BaziInput;
  isAuthenticated: boolean;
  onRestoreChart: (input: BaziInput) => void;
};

type ArchiveProfile = { name: string; birthPlace: string; residence: string; year: number };

export function AnnualManual({ result, input, isAuthenticated, onRestoreChart }: AnnualManualProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [profile, setProfile] = useState<ArchiveProfile>({ name: "王二小", birthPlace: "", residence: "", year: currentYear });
  const [started, setStarted] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [storageStatus, setStorageStatus] = useState("");
  const [locale, setLocale] = useState<ManualLocale | null>(null);
  const [activeTheme, setActiveTheme] = useState<LifeThemeKey>("relationship");
  const archiveUtils = trpc.useUtils();
  const annualWindow = trpc.annual.window.useQuery({ targetYear: profile.year });
  const localeQuery = trpc.locale.current.useQuery();
  const annualMethod = trpc.annual.method.useQuery();
  const archivesQuery = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated && showArchive });
  const setLocalePreference = trpc.locale.set.useMutation({ onSuccess: () => localeQuery.refetch() });
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
  const selectedLocale = locale || localeQuery.data?.locale || "zh-CN";
  const copy = manualCopy[selectedLocale];
  const profileName = profile.name.trim() || "未署名";
  const dayPillar = result.pillars.find((pillar) => pillar.key === "day")?.ganzhi || "日柱";
  const activeEntry = activeMonth === null ? undefined : manualEntry(selectedLocale, activeMonth);
  const themes = useMemo(() => deriveLifeThemes(result, selectedLocale), [result, selectedLocale]);
  const selectedTheme = themes.find((theme) => theme.key === activeTheme) || themes[0];
  const themeIcons = { relationship: HeartHandshake, career: BriefcaseBusiness, finance: WalletCards, rhythm: TimerReset } as const;

  useEffect(() => {
    if (started && activeMonth === null && annualAccess?.openMonths[0]) {
      setActiveMonth(annualAccess.openMonths[0] - 1);
    }
  }, [activeMonth, annualAccess?.openMonths, started]);

  useEffect(() => {
    if (localeQuery.data?.locale && locale === null) setLocale(localeQuery.data.locale);
  }, [locale, localeQuery.data?.locale]);

  useEffect(() => {
    document.documentElement.lang = selectedLocale;
  }, [selectedLocale]);

  function chooseLocale(nextLocale: ManualLocale) {
    setLocale(nextLocale);
    if (isAuthenticated) setLocalePreference.mutate({ locale: nextLocale });
  }

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
          <div className="sheet-kicker"><span>03</span> {copy.guide}</div>
          <h3>{copy.choose}</h3>
          <p>{copy.guideBody}</p>
          <div className="locale-control"><label htmlFor="manual-locale">{copy.language}</label><select id="manual-locale" value={selectedLocale} onChange={(event) => chooseLocale(event.target.value as ManualLocale)}>{manualLocales.map((value) => <option key={value} value={value}>{value === "zh-CN" ? "简体中文" : value === "zh-TW" ? "繁體中文" : "English"}</option>)}</select><small>{copy.autoLanguage}</small></div>
          <form onSubmit={beginReading}>
            <label htmlFor="manual-name">{selectedLocale === "en" ? "Name or preferred form of address" : "称呼或姓名"}</label>
            <input id="manual-name" value={profile.name} maxLength={24} placeholder="例如：王二小" onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} />
            <label htmlFor="manual-year">{selectedLocale === "en" ? "Reading year" : "阅读年份"}</label>
            <select id="manual-year" value={profile.year} onChange={(event) => {
              setProfile((value) => ({ ...value, year: Number(event.target.value) }));
              setStarted(false);
              setActiveMonth(null);
            }}>
              <option value={currentYear}>{currentYear} 年</option>
              <option value={currentYear + 1}>{currentYear + 1} 年</option>
            </select>
            <button className="manual-create-button" type="submit" disabled={annualWindow.isFetching}><Sparkles /> {annualWindow.isFetching ? "…" : copy.start} <ChevronRight /></button>
          </form>
          <button className="optional-profile-toggle" type="button" aria-expanded={showOptionalProfile} onClick={() => setShowOptionalProfile((value) => !value)}><ChevronDown /> {copy.optional}</button>
          {showOptionalProfile && <div className="optional-profile-fields"><label htmlFor="manual-birth-place">出生地点</label><input id="manual-birth-place" value={profile.birthPlace} maxLength={60} placeholder="例如：北京市东城区" onChange={(event) => setProfile((value) => ({ ...value, birthPlace: event.target.value }))} /><label htmlFor="manual-residence">现居详细地址</label><textarea id="manual-residence" value={profile.residence} maxLength={140} placeholder="可填写至门牌号；仅明确保存时才写入私有档案" onChange={(event) => setProfile((value) => ({ ...value, residence: event.target.value }))} /></div>}
          <div className="manual-privacy"><ShieldCheck /> 未点击保存前，资料只停留在当前页面。</div>
          {storageStatus && <p className="archive-status" aria-live="polite">{storageStatus}</p>}
        </aside>

        <div className="manual-reading" id="manual-reading">
          {!started ? (
            <div className="manual-empty-state focus-empty-state"><Compass /><div><span>ONE CLEAR NEXT STEP</span><h3>现在不需要处理全部资料。</h3><p>左侧完成称呼与年份后，系统会从服务端按北京时间与下一节，准备一卷可以直接开始的未来月卷。</p></div></div>
          ) : (
            <>
              <header className="focus-reading-head"><div><span>{copy.prepared.replace("{name}", profileName)}</span><h3>{profile.year} {copy.future}</h3></div><p><b>{copy.nextJie}: {annualAccess?.nextJie || "…"}</b> · {copy.onlyFuture}</p></header>
              {activeEntry && activeMonth !== null && <article className="focus-reading-card" aria-live="polite"><div className="focus-reading-meta"><span>{copy.first} / {profile.year}</span><b>{manualMonth(selectedLocale, activeMonth)}</b></div><h4>{activeEntry.title}</h4><p className="focus-personal-line">{selectedLocale === "en" ? <>This volume uses your <strong>{dayPillar}</strong> day pillar, corrected birth time, and the next solar term <strong>{annualAccess?.nextJie || ""}</strong> as reading coordinates.</> : <>这卷以你的<strong>{dayPillar}</strong>日柱、已校正的出生时刻与下一节<strong>{annualAccess?.nextJie || ""}</strong>作为阅读坐标。先只处理一个问题。</>}</p><section><span>{copy.cue}</span><p>{activeEntry.focus}</p></section><section><span>{copy.question}</span><p>{activeEntry.prompt}</p></section><section><span>{copy.action}</span><p>{activeEntry.note}</p></section><p className="monthly-disclaimer">{selectedLocale === "en" ? "This is a cultural-research reading prompt, not a certain prediction or life-decision recommendation." : "这是结合你当前排盘与时间窗口的文化研究阅读提示，不构成对未来的确定判断或人生决策建议。"}</p></article>}
              {selectedTheme && <section className="life-theme-section" aria-labelledby="life-theme-title"><header><span>{selectedLocale === "en" ? "PERSONAL THEMES" : "人生主题"}</span><h4 id="life-theme-title">{selectedLocale === "en" ? "Choose one area to explore" : "选择一个想先看的方向"}</h4><p>{selectedLocale === "en" ? "These are reflective prompts linked to visible markers in your chart—not forecasts of outcomes." : "这些是与排盘可见标记关联的反思线索，不是对结果的预言。"}</p></header><div className="life-theme-tabs" role="tablist" aria-label={selectedLocale === "en" ? "Life themes" : "人生主题"}>{themes.map((theme) => { const Icon = themeIcons[theme.key]; return <button key={theme.key} type="button" role="tab" aria-selected={theme.key === activeTheme} className={theme.key === activeTheme ? "is-active" : ""} onClick={() => setActiveTheme(theme.key)}><Icon /><span>{theme.title}</span></button>; })}</div><article className="life-theme-card" role="tabpanel"><div className="life-theme-card-head"><span>{selectedTheme.label}</span><b>{selectedTheme.title}</b></div><p className="life-theme-focus">{selectedTheme.focus}</p><dl><div><dt>{selectedLocale === "en" ? "A question" : "一个问题"}</dt><dd>{selectedTheme.question}</dd></div><div><dt>{selectedLocale === "en" ? "A small action" : "一个小行动"}</dt><dd>{selectedTheme.action}</dd></div></dl><details><summary><ChevronDown /> {selectedLocale === "en" ? "See the chart index for this theme" : "查看此主题的排盘索引"}</summary><p>{selectedTheme.evidence}</p></details><p className="life-theme-boundary">{selectedTheme.boundary}</p></article></section>}
              <div className="focus-actions"><button type="button" onClick={() => setShowMonthPicker((value) => !value)}><Eye /> {showMonthPicker ? copy.hideMonths : copy.otherMonths}</button><button type="button" className="quiet-action" onClick={saveCurrentArchive} disabled={saveArchive.isPending}>{isAuthenticated ? <Save /> : <LogIn />}{isAuthenticated ? copy.save : copy.login}</button></div>
              {showMonthPicker && <div className="future-month-picker" role="list" aria-label={copy.future}>{Array.from({ length: 12 }, (_, index) => index).map((index) => { const isOpen = Boolean(annualAccess?.openMonths.includes(index + 1)); return <button key={index} type="button" role="listitem" disabled={!isOpen} className={activeMonth === index ? "is-active" : ""} onClick={() => setActiveMonth(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{manualMonth(selectedLocale, index)}</b>{isOpen ? <Eye /> : <LockKeyhole />}</button>; })}</div>}
              <details className="reading-details"><summary><ChevronDown /> {copy.basis}</summary><div><p><b>服务端节气窗口：</b>使用 {annualAccess?.timezone || "北京时间"} 计算；下一节为“{annualAccess?.nextJie || "校验中"}”，当前可读 {annualAccess?.openMonths.length || 0} 卷。</p><p><b>你的排盘信息：</b>日柱 {dayPillar}，用于排盘时刻 {result.correctedTime}。{profile.birthPlace ? `出生地点：${profile.birthPlace}。` : ""}</p></div></details>
              <details className="reading-details"><summary><ChevronDown /> {copy.method}</summary><div><p><b>{copy.source}：</b>{annualMethod.data?.calendarLibrary || "lunar-javascript"}；版本 {annualMethod.data?.version || "校验中"}。</p><p>{annualMethod.data?.annualWindow}</p><p>{annualMethod.data?.contentGeneration}</p><p>{annualMethod.data?.limitation}</p></div></details>
              <details className="archive-details" open={showArchive} onToggle={(event) => setShowArchive((event.currentTarget as HTMLDetailsElement).open)}><summary><ChevronDown /> 私有档案与保存</summary><div className="archive-details-body"><p>{isAuthenticated ? "保存后仅登录账户可见；完整住址仅在主动载入时使用。" : "未登录时不会保存姓名或住址资料。"}</p>{isAuthenticated && (archivesQuery.isLoading ? <p>正在读取私有档案…</p> : archivesQuery.data?.length ? <ul>{archivesQuery.data.map((record) => <li key={record.id}><div><b>{record.label}</b><small>{record.targetYear} 年 · {new Date(record.createdAt).toLocaleDateString("zh-CN")}</small></div><span><button type="button" onClick={() => restoreArchive(record)}>载入</button><button type="button" aria-label={`永久删除 ${record.label}`} onClick={() => removeArchive.mutate({ id: record.id })} disabled={removeArchive.isPending}><Trash2 /></button></span></li>)}</ul> : <p>还没有已保存的阅读。</p>)}</div></details>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
