/**
 * 观象历书设计提醒：以“卷首—侧注—版心”布局呈现，强调历法依据与可追溯性，避免命运承诺式表述。
 */
import { FormEvent, useCallback, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Copy,
  Download,
  Info,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Share2,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { AnnualManual } from "@/components/AnnualManual";
import { CityLocation, CitySearch } from "@/components/CitySearch";
import { BaziInput, BaziResult, calculateBazi, formatCoordinate } from "@/lib/bazi";
import { copyBaziPlainText, downloadBaziPng } from "@/lib/baziExport";
import { sharePublicPage } from "@/lib/publicShare";
import { deriveFortuneContrast } from "@/lib/fortuneContrast";
import { deriveLifeThemes } from "@/lib/lifeThemes";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { siteCopy } from "@/lib/siteCopy";
import { SiteFooter, SiteHeader } from "@/components/SiteShell";
import "./CoreFlow.css";

const DEFAULT_INPUT: BaziInput = {
  datetime: "1990-01-27T00:00",
  longitude: 116.4074,
  latitude: 39.9042,
  gender: "male",
};

const ELEMENT_COLORS: Record<string, string> = {
  木: "element-wood",
  火: "element-fire",
  土: "element-earth",
  金: "element-metal",
  水: "element-water",
};

function formatCorrection(minutes: number, locale: "zh-CN" | "zh-TW" | "en") {
  const sign = minutes >= 0 ? "+" : "−";
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return locale === "en" ? `${sign}${hours}h ${remainder}m` : `${sign}${hours}时${remainder}分`;
}

function ElementDots({ wuxing }: { wuxing: string }) {
  const elements = Array.from(new Set(wuxing.split("").filter((char) => ELEMENT_COLORS[char])));
  return (
    <span className="element-dots" aria-label={`五行：${elements.join("、") || "—"}`}>
      {elements.map((element) => <i className={ELEMENT_COLORS[element]} key={element} title={element} />)}
    </span>
  );
}

function PillarCard({ pillar, index, labels }: { pillar: BaziResult["pillars"][number]; index: number; labels: typeof siteCopy["zh-CN"]["result"] }) {
  return (
    <article className="pillar-card" style={{ "--pillar-delay": `${index * 65}ms` } as React.CSSProperties}>
      <div className="pillar-head">
        <span>{labels.localPillars[pillar.key]}</span>
        {pillar.key === "day" ? <em>{labels.dayMaster}</em> : <ElementDots wuxing={pillar.wuxing} />}
      </div>
      <div className="pillar-glyphs" aria-label={`${labels.localPillars[pillar.key]} ${pillar.ganzhi}`}>
        <strong>{pillar.stem}</strong><span /><strong>{pillar.branch}</strong>
      </div>
      <div className="pillar-details">
        <div><span>{labels.stemDeity}</span><b>{pillar.stemShiShen}</b></div>
        <div><span>{labels.hiddenStems}</span><b>{pillar.hiddenGan.join(" · ") || "—"}</b></div>
        <div><span>{labels.naYinState}</span><b>{pillar.naYin} · {pillar.diShi}</b></div>
      </div>
    </article>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { locale } = useAppLocale();
  const copy = siteCopy[locale];
  const [input, setInput] = useState<BaziInput>(DEFAULT_INPUT);
  const [longitudeText, setLongitudeText] = useState(() => formatCoordinate(DEFAULT_INPUT.longitude));
  const [latitudeText, setLatitudeText] = useState(() => formatCoordinate(DEFAULT_INPUT.latitude));
  const [result, setResult] = useState<BaziResult>(() => calculateBazi(DEFAULT_INPUT));
  const [formError, setFormError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const correctionPreview = useMemo(() => (Number(longitudeText) - 120) * 4, [longitudeText]);
  const resultYear = useMemo(() => new Date().getFullYear(), []);
  const resultContrast = useMemo(() => deriveFortuneContrast(result, resultYear, locale), [locale, result, resultYear]);
  const resultThemes = useMemo(() => deriveLifeThemes(result, locale), [locale, result]);
  const financeCue = resultThemes.find((theme) => theme.key === "finance");

  function parseDraftInput(): BaziInput {
    const longitude = Number(longitudeText.trim());
    const latitude = Number(latitudeText.trim());
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) throw new Error(copy.form.error);
    return { ...input, longitude, latitude };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextInput = parseDraftInput();
      const nextResult = calculateBazi(nextInput);
      setIsCalculating(true);
      setFormError("");
      window.setTimeout(() => {
        setInput(nextInput);
        setResult(nextResult);
        setHasCalculated(true);
        setIsCalculating(false);
        window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
      }, 240);
    } catch (calculationError) {
      setFormError(calculationError instanceof Error ? calculationError.message : copy.form.error);
    }
  }

  function restoreExample() {
    setInput(DEFAULT_INPUT);
    setLongitudeText(formatCoordinate(DEFAULT_INPUT.longitude));
    setLatitudeText(formatCoordinate(DEFAULT_INPUT.latitude));
    setResult(calculateBazi(DEFAULT_INPUT));
    setHasCalculated(true);
    setFormError("");
  }

  function handleCitySelect(location: CityLocation) {
    setInput((current) => ({ ...current, longitude: location.longitude, latitude: location.latitude }));
    setLongitudeText(formatCoordinate(location.longitude));
    setLatitudeText(formatCoordinate(location.latitude));
    setFormError("");
  }

  const restoreSavedChart = useCallback((savedInput: BaziInput) => {
    try {
      setInput(savedInput);
      setLongitudeText(formatCoordinate(savedInput.longitude));
      setLatitudeText(formatCoordinate(savedInput.latitude));
      setResult(calculateBazi(savedInput));
      setHasCalculated(true);
      setFormError("");
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
    } catch (calculationError) {
      setFormError(calculationError instanceof Error ? calculationError.message : copy.form.error);
    }
  }, [copy.form.error]);

  async function handlePngExport() {
    setIsExporting(true);
    setExportStatus("");
    try {
      await downloadBaziPng(result, locale);
      setExportStatus(locale === "en" ? "The PNG chart download has started." : locale === "zh-TW" ? "PNG 排盤卡已開始下載。" : "PNG 排盘卡片已开始下载。");
    } catch (exportError) {
      setExportStatus(exportError instanceof Error ? exportError.message : copy.form.error);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleTextCopy() {
    setIsCopying(true);
    setExportStatus(locale === "en" ? "Copying plain-text chart…" : locale === "zh-TW" ? "正在複製純文字排盤…" : "正在复制纯文本排盘…");
    try {
      await copyBaziPlainText(result, locale);
      setExportStatus(copy.result.copied);
    } catch (copyError) {
      setExportStatus(copyError instanceof Error ? copyError.message : copy.form.error);
    } finally {
      setIsCopying(false);
    }
  }

  async function handlePublicShare() {
    setIsSharing(true);
    try {
      const outcome = await sharePublicPage(locale, `${window.location.origin}/`);
      setExportStatus(outcome === "copied" ? (locale === "en" ? "Public link copied." : locale === "zh-TW" ? "公開連結已複製。" : "公开链接已复制。") : outcome === "unsupported" ? (locale === "en" ? "Sharing is unavailable in this browser." : locale === "zh-TW" ? "此瀏覽器不支援分享。" : "当前浏览器不支持分享。") : (locale === "en" ? "Shared." : locale === "zh-TW" ? "已分享。" : "已分享。"));
    } catch {
      setExportStatus(locale === "en" ? "Sharing was cancelled." : locale === "zh-TW" ? "已取消分享。" : "已取消分享。");
    } finally {
      setIsSharing(false);
    }
  }

  const coordinateLabel = copy.result.coordinates.replace("{longitude}", formatCoordinate(result.longitude)).replace("{latitude}", formatCoordinate(result.latitude));

  return (
    <div className={`app-shell${hasCalculated ? " has-calculated" : " is-awaiting-chart"}`}>
      <SiteHeader />

      {isCalculating && <div className="chart-loading" role="status" aria-live="polite"><div><LoaderCircle /><b>{locale === "en" ? "Making your chart" : locale === "zh-TW" ? "正在排盤" : "正在排盘"}</b><span>{locale === "en" ? "Checking time and solar terms" : locale === "zh-TW" ? "正在核對時間和節氣" : "正在核对时间和节气"}</span></div></div>}

      <main id="top">
        <section className="workspace" aria-label="Bazi calculator">
          <aside className="input-sheet" id="calculator">
            <div className="sheet-kicker"><span>01</span> {copy.form.kicker}</div>
            <div className="sheet-title-row"><h2>{copy.form.title}</h2><Compass /></div>
            <p className="sheet-intro">{copy.form.body}</p>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="datetime">{copy.form.datetime}</label>
              <div className="field-with-icon"><CalendarDays /><input id="datetime" type="datetime-local" value={input.datetime} onChange={(event) => setInput((current) => ({ ...current, datetime: event.target.value }))} required /></div>
              <CitySearch onSelect={handleCitySelect} />
              <fieldset className="gender-fieldset"><legend>{copy.form.gender}</legend><div className="gender-options"><label className={input.gender === "male" ? "selected" : ""}><input type="radio" name="gender" value="male" checked={input.gender === "male"} onChange={() => setInput((current) => ({ ...current, gender: "male" }))} />{copy.form.male}</label><label className={input.gender === "female" ? "selected" : ""}><input type="radio" name="gender" value="female" checked={input.gender === "female"} onChange={() => setInput((current) => ({ ...current, gender: "female" }))} />{copy.form.female}</label></div></fieldset>
              <details className="input-details"><summary><ChevronDown /> {locale === "en" ? "Add precise location" : locale === "zh-TW" ? "補充精確位置" : "补充精确位置"}</summary><div><div className="field-head"><label className="field-label" htmlFor="longitude">{copy.form.longitude}</label><span>{copy.form.longitudeHint}</span></div><div className="field-with-icon"><MapPin /><input id="longitude" type="number" min="-180" max="180" step="any" inputMode="decimal" value={longitudeText} onChange={(event) => setLongitudeText(event.target.value)} required /></div><div className="field-head latitude-head"><label className="field-label" htmlFor="latitude">{copy.form.latitude}</label><span>{copy.form.latitudeHint}</span></div><div className="field-with-icon"><Compass /><input id="latitude" type="number" min="-90" max="90" step="any" inputMode="decimal" value={latitudeText} onChange={(event) => setLatitudeText(event.target.value)} required /></div><p className="coordinate-precision-note"><Info /> {copy.form.precision}</p><div className="formula-preview"><span>{copy.form.correction}</span><b>{formatCorrection(correctionPreview, locale)}</b><small>({formatCoordinate(Number(longitudeText || 0))}° − 120°) × 4 min/°</small></div><button className="example-button" type="button" onClick={restoreExample}><RotateCcw /> {copy.form.example}</button></div></details>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <Button className="calculate-button" type="submit"><Sparkles /> {copy.form.calculate} <ArrowDownRight /></Button>
            </form>
            <div className="input-footnote"><Info /> {copy.form.privacy}</div>
          </aside>

          <section className="result-page" id="result" aria-labelledby="result-title">
            <header className="result-header"><div><div className="sheet-kicker"><span>02</span> {copy.result.kicker}</div><h2 id="result-title">{copy.result.title} <small>{copy.result.subtitle}</small></h2></div><div className="correction-seal"><span>{copy.result.correction}</span><b>{formatCorrection(result.correctionMinutes, locale)}</b><small>{copy.result.correctedSolarTime}</small></div></header>
            <div className="pillars-grid">{result.pillars.map((pillar, index) => <PillarCard key={pillar.key} pillar={pillar} index={index} labels={copy.result} />)}</div>
            <div className="result-caption"><span className="seal-stamp">{locale === "en" ? "CHECKED" : "已校"}</span><p><b>{copy.result.rule}</b></p></div>
            <section className="result-fortune-overview" aria-labelledby="fortune-overview-title"><header><span>{locale === "en" ? "DA YUN / DIRECTIONS" : locale === "zh-TW" ? "大運 / 四個方向" : "大运 / 四个方向"}</span><h3 id="fortune-overview-title">{locale === "en" ? "What to watch in this decade" : locale === "zh-TW" ? "這十年，先看什麼" : "这十年，先看什么"}</h3><p>{locale === "en" ? "Use this as a reading index, not a fixed verdict." : locale === "zh-TW" ? "這是閱讀索引，不是定論。" : "这是阅读索引，不是定论。"}</p></header><div className="fortune-decade-card"><div><span>{locale === "en" ? "CURRENT DA YUN" : locale === "zh-TW" ? "目前大運" : "当前大运"}</span><b>{resultContrast.activeDaYun?.ganzhi || "—"}</b><small>{resultContrast.activeDaYun ? `${resultContrast.activeDaYun.startYear}–${Number(resultContrast.activeDaYun.startYear) + 9}` : resultContrast.focus}</small></div><div><span>{locale === "en" ? "DIRECTION" : locale === "zh-TW" ? "走向" : "走向"}</span><b>{result.direction}</b><small>{locale === "en" ? `Starts ${result.startYunText}` : locale === "zh-TW" ? `${result.startYunText} 起運` : `${result.startYunText} 起运`}</small></div><p>{resultContrast.focus} {resultContrast.boundary}</p></div><div className="fortune-direction-grid">{resultThemes.map((theme) => <details key={theme.key} className={`fortune-direction-card is-${theme.key}`}><summary><span>{theme.label}</span><b>{theme.title}</b><small>{theme.focus}</small><ChevronDown /></summary><div><p>{theme.question}</p><p><b>{locale === "en" ? "Try: " : locale === "zh-TW" ? "可以先：" : "可以先："}</b>{theme.action}</p><small>{theme.evidence} {theme.boundary}</small></div></details>)}</div><a className="result-annual-cta" href="#manual"><BookOpenText /><span><small>{locale === "en" ? "NEXT" : locale === "zh-TW" ? "下一步" : "下一步"}</small><b>{locale === "en" ? "Read this year or next year by month" : locale === "zh-TW" ? "按月份看今年或明年的命書" : "按月份看今年或明年的命书"}</b><em>{locale === "en" ? "This year opens from the next solar term. Next year becomes available after June." : locale === "zh-TW" ? "今年從下一節氣起開放；明年於六月後可讀。" : "今年从下一节气起开放；明年于六月后可读。"}</em></span><ChevronRight /></a></section>
            <details className="result-details"><summary><ChevronDown /> {locale === "en" ? "See chart details and export" : locale === "zh-TW" ? "查看排盤細節與匯出" : "查看排盘细节与导出"}</summary><div><div className="time-ledger"><div><span>{copy.result.originalTime}</span><b>{result.originalTime}</b></div><ArrowUpRight /><div><span>{copy.result.chartTime}</span><b>{result.correctedTime}</b></div><em className="coordinate-display">{coordinateLabel}</em></div><div className="detail-grid"><article className="detail-card solar-card"><div className="detail-top"><span>{locale === "en" ? "Solar-term record" : locale === "zh-TW" ? "節氣記錄" : "节气记录"}</span><BookOpenText /></div><strong>{result.currentJieQi}</strong><p>{copy.result.previous}：{result.previousJie}<i /> {copy.result.next}：{result.nextJie}</p></article><article className="detail-card"><div className="detail-top"><span>{copy.result.additional}</span><span className="small-mark">A</span></div><dl><div><dt>{copy.result.fetalOrigin}</dt><dd>{result.taiYuan}</dd></div><div><dt>{copy.result.lifePalace}</dt><dd>{result.mingGong}</dd></div><div><dt>{copy.result.bodyPalace}</dt><dd>{result.shenGong}</dd></div></dl></article><article className="detail-card direction-card"><div className="detail-top"><span>{copy.result.direction}</span><span className="small-mark">B</span></div><strong>{result.direction}</strong><p>{copy.result.start}：{result.startYunText}<br />{copy.result.start}：{result.startYunDate}</p></article></div>{result.daYun.length > 0 && <section className="fortune-section" aria-labelledby="fortune-title"><div className="fortune-heading"><h3 id="fortune-title">{copy.result.fortuneDirection}</h3><span>{copy.result.fortuneHint}</span></div><div className="fortune-strip">{result.daYun.map((item) => <div key={`${item.ganzhi}-${item.startYear}`}><b>{item.ganzhi}</b><span>{item.startAge}–{item.endAge} {copy.result.year}</span><small>{item.startYear} {copy.result.start}</small></div>)}</div></section>}<section className="export-panel" aria-label={copy.result.exportKicker}><div className="export-panel-copy"><span>{copy.result.exportKicker}</span><p>{copy.result.exportBody}</p><small>{locale === "en" ? "Sharing only sends the public Guanli link—never your chart, birth details, or saved notes." : locale === "zh-TW" ? "分享只會傳送公開觀曆連結，不包含排盤、出生資料或私人筆記。" : "分享只会发送公开观历链接，不包含排盘、出生资料或私有笔记。"}</small></div><div className="export-actions"><Button className="export-png-button" type="button" onClick={handlePngExport} disabled={isExporting}>{isExporting ? <LoaderCircle className="export-spin" /> : <Download />}{isExporting ? copy.result.generating : copy.result.download}</Button><button className="copy-text-button" type="button" onClick={handleTextCopy} disabled={isCopying}>{isCopying ? <LoaderCircle className="export-spin" /> : exportStatus.includes("copied") || exportStatus.includes("已复制") || exportStatus.includes("已複製") ? <Check /> : <Copy />}{isCopying ? copy.result.copying : copy.result.copy}</button><button className="copy-text-button share-public-button" type="button" onClick={handlePublicShare} disabled={isSharing}><Share2 />{isSharing ? "…" : locale === "en" ? "Share Guanli" : locale === "zh-TW" ? "分享觀曆" : "分享观历"}</button></div><p className="export-status" aria-live="polite">{exportStatus}</p></section></div></details>
          </section>
        </section>

        <AnnualManual result={result} input={input} isAuthenticated={isAuthenticated} onRestoreChart={restoreSavedChart} />
        <section className="method-section method-summary-section" id="method" aria-labelledby="method-title"><div className="method-copy method-summary"><div className="eyebrow"><BookOpenText /> {copy.method.kicker}</div><h2 id="method-title">{copy.method.titleBefore.split("\n").map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}<strong>{copy.method.titleAccent}</strong>{locale === "en" ? "." : "。"}</h2><p> {locale === "en" ? "Check the rules when you need them." : "需要时，再看具体规则。"}</p><details className="method-more"><summary><ChevronRight /> {locale === "en" ? "View chart rules" : "查看排盘规则"}</summary><div className="method-list"><div><span>01</span><p><b>{copy.method.firstTitle}</b>：{copy.method.firstBody}</p></div><div><span>02</span><p><b>{copy.method.secondTitle}</b>：{copy.method.secondBody}</p></div><div><span>03</span><p><b>{copy.method.thirdTitle}</b>：{copy.method.thirdBody}</p></div></div><a className="reference-link" href="https://github.com/6tail/lunar-javascript" target="_blank" rel="noreferrer">{copy.method.link} <ArrowUpRight /></a></details></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
