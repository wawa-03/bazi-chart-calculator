/**
 * 观象历书设计提醒：以“卷首—侧注—版心”布局呈现，强调历法依据与可追溯性，避免命运承诺式表述。
 */
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Compass,
  Info,
  MapPin,
  Orbit,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CityLocation, CitySearch } from "@/components/CitySearch";
import { BaziInput, BaziResult, calculateBazi } from "@/lib/bazi";

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

function formatCorrection(minutes: number) {
  const sign = minutes >= 0 ? "+" : "−";
  const total = Math.round(Math.abs(minutes));
  return `${sign}${Math.floor(total / 60)}时${String(total % 60).padStart(2, "0")}分`;
}

function ElementDots({ wuxing }: { wuxing: string }) {
  const elements = Array.from(new Set(wuxing.split("").filter((char) => ELEMENT_COLORS[char])));
  return (
    <span className="element-dots" aria-label={`五行：${elements.join("、") || "未标注"}`}>
      {elements.map((element) => (
        <i className={ELEMENT_COLORS[element]} key={element} title={element} />
      ))}
    </span>
  );
}

function PillarCard({ pillar, index }: { pillar: BaziResult["pillars"][number]; index: number }) {
  return (
    <article className="pillar-card" style={{ "--pillar-delay": `${index * 65}ms` } as React.CSSProperties}>
      <div className="pillar-head">
        <span>{pillar.label}</span>
        {pillar.key === "day" ? <em>日主</em> : <ElementDots wuxing={pillar.wuxing} />}
      </div>
      <div className="pillar-glyphs" aria-label={`${pillar.label} ${pillar.ganzhi}`}>
        <strong>{pillar.stem}</strong>
        <span />
        <strong>{pillar.branch}</strong>
      </div>
      <div className="pillar-details">
        <div><span>天干十神</span><b>{pillar.stemShiShen}</b></div>
        <div><span>地支藏干</span><b>{pillar.hiddenGan.join(" · ") || "—"}</b></div>
        <div><span>纳音 / 地势</span><b>{pillar.naYin} · {pillar.diShi}</b></div>
      </div>
    </article>
  );
}

export default function Home() {
  const [input, setInput] = useState<BaziInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<BaziResult>(() => calculateBazi(DEFAULT_INPUT));
  const [error, setError] = useState("");
  const correctionPreview = useMemo(() => (Number(input.longitude) - 120) * 4, [input.longitude]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setResult(calculateBazi({ ...input, longitude: Number(input.longitude) }));
      setError("");
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
    } catch (calculationError) {
      setError(calculationError instanceof Error ? calculationError.message : "无法完成本次推算，请核对输入。");
    }
  }

  function restoreExample() {
    setInput(DEFAULT_INPUT);
    setResult(calculateBazi(DEFAULT_INPUT));
    setError("");
  }

  function handleCitySelect(location: CityLocation) {
    setInput((current) => ({ ...current, longitude: location.longitude, latitude: location.latitude }));
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="观历八字排盘工具首页">
          <img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="观历星历印记" />
          <span><b>观历</b><small>BĀZÌ / EPHEMERIS</small></span>
        </a>
        <nav aria-label="页面导航">
          <a href="#calculator">起盘 <ChevronRight /></a>
          <a href="#method">依据 <ChevronRight /></a>
        </nav>
        <div className="local-status"><i /> 浏览器本地推算</div>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><Orbit /> OBSERVATION / 01</div>
            <h1 id="hero-title">让出生时刻<br />回到它的<strong>天文位置</strong>。</h1>
            <p>以节气为月界，以立春为岁首；将出生地经度折算为真太阳时后，输出可核对的四柱与基础历法信息。</p>
            <div className="hero-notes">
              <span><b>24</b> 节气分界</span>
              <span><b>120°E</b> 标准经线</span>
              <span><b>23:00</b> 晚子时换日</span>
            </div>
          </div>
          <figure className="hero-figure">
            <img src="/manus-storage/guanli-hero-astronomical-almanac_978f146c.jpg" alt="打开的天文历书、星盘与经纬刻度" />
            <figcaption><span>历法工作台</span><i /> 请先核对时间与经度</figcaption>
          </figure>
        </section>

        <section className="workspace" aria-label="八字排盘工作区">
          <aside className="input-sheet" id="calculator">
            <div className="sheet-kicker"><span>01</span> 输入侧注</div>
            <div className="sheet-title-row">
              <h2>校对出生条件</h2>
              <Compass />
            </div>
            <p className="sheet-intro">请填写按北京时间记录的公历时刻。经度仅作此版本的<strong>地方时差</strong>修正。</p>

            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="datetime">公历出生日期与时间</label>
              <div className="field-with-icon">
                <CalendarDays />
                <input
                  id="datetime"
                  type="datetime-local"
                  value={input.datetime}
                  onChange={(event) => setInput((current) => ({ ...current, datetime: event.target.value }))}
                  required
                />
              </div>

              <CitySearch onSelect={handleCitySelect} />

              <div className="field-head">
                <label className="field-label" htmlFor="longitude">出生地经度</label>
                <span>东经（°E）</span>
              </div>
              <div className="field-with-icon">
                <MapPin />
                <input
                  id="longitude"
                  type="number"
                  min="73"
                  max="136"
                  step="0.0001"
                  value={input.longitude}
                  onChange={(event) => setInput((current) => ({ ...current, longitude: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="field-head latitude-head">
                <label className="field-label" htmlFor="latitude">出生地纬度</label>
                <span>北纬（°N）</span>
              </div>
              <div className="field-with-icon">
                <Compass />
                <input
                  id="latitude"
                  type="number"
                  min="3"
                  max="54"
                  step="0.0001"
                  value={input.latitude}
                  onChange={(event) => setInput((current) => ({ ...current, latitude: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="formula-preview">
                <span>地方时差</span>
                <b>{formatCorrection(correctionPreview)}</b>
                <small>({Number(input.longitude || 0).toFixed(4)}° − 120°) × 4 分/度</small>
              </div>

              <fieldset className="gender-fieldset">
                <legend>性别（用于大运方向）</legend>
                <div className="gender-options">
                  <label className={input.gender === "male" ? "selected" : ""}>
                    <input type="radio" name="gender" value="male" checked={input.gender === "male"} onChange={() => setInput((current) => ({ ...current, gender: "male" }))} />
                    男
                  </label>
                  <label className={input.gender === "female" ? "selected" : ""}>
                    <input type="radio" name="gender" value="female" checked={input.gender === "female"} onChange={() => setInput((current) => ({ ...current, gender: "female" }))} />
                    女
                  </label>
                </div>
              </fieldset>

              {error && <p className="form-error" role="alert">{error}</p>}
              <Button className="calculate-button" type="submit"><Sparkles /> 推算四柱 <ArrowDownRight /></Button>
            </form>
            <button className="example-button" type="button" onClick={restoreExample}><RotateCcw /> 恢复示例：1990.01.27 北京</button>

            <div className="input-footnote"><Info /> 本工具不保存输入信息；结果仅供历法与文化研究参考。</div>
          </aside>

          <section className="result-page" id="result" aria-labelledby="result-title">
            <header className="result-header">
              <div>
                <div className="sheet-kicker"><span>02</span> 四柱版心</div>
                <h2 id="result-title">乾支排布 <small>八字</small></h2>
              </div>
              <div className="correction-seal">
                <span>经度校正</span>
                <b>{formatCorrection(result.correctionMinutes)}</b>
                <small>真太阳时</small>
              </div>
            </header>

            <div className="time-ledger">
              <div><span>原始北京时间</span><b>{result.originalTime}</b></div>
              <ArrowUpRight />
              <div><span>用于排盘的时刻</span><b>{result.correctedTime}</b></div>
              <em>经度 {result.longitude.toFixed(4)}°E · 纬度 {result.latitude.toFixed(4)}°N</em>
            </div>

            <div className="pillars-grid">
              {result.pillars.map((pillar, index) => <PillarCard key={pillar.key} pillar={pillar} index={index} />)}
            </div>

            <div className="result-caption">
              <span className="seal-stamp">已校</span>
              <p><b>排盘规则：</b>{result.dayBoundaryNote} 年、月柱由内置历法的节气时刻界定；月柱按节而非农历月切换。</p>
            </div>

            <div className="detail-grid">
              <article className="detail-card solar-card">
                <div className="detail-top"><span>节气校验</span><BookOpenText /></div>
                <strong>{result.currentJieQi}</strong>
                <p>前一节：{result.previousJie}<i /> 后一节：{result.nextJie}</p>
              </article>
              <article className="detail-card">
                <div className="detail-top"><span>附加信息</span><span className="small-mark">A</span></div>
                <dl>
                  <div><dt>胎元</dt><dd>{result.taiYuan}</dd></div>
                  <div><dt>命宫</dt><dd>{result.mingGong}</dd></div>
                  <div><dt>身宫</dt><dd>{result.shenGong}</dd></div>
                </dl>
              </article>
              <article className="detail-card direction-card">
                <div className="detail-top"><span>大运方向</span><span className="small-mark">B</span></div>
                <strong>{result.direction}</strong>
                <p>起运：{result.startYunText}<br />起运日：{result.startYunDate}</p>
              </article>
            </div>

            {result.daYun.length > 0 && (
              <section className="fortune-section" aria-labelledby="fortune-title">
                <div className="fortune-heading"><h3 id="fortune-title">大运序列</h3><span>按性别与年干阴阳推演</span></div>
                <div className="fortune-strip">
                  {result.daYun.map((item) => <div key={`${item.ganzhi}-${item.startYear}`}><b>{item.ganzhi}</b><span>{item.startAge}–{item.endAge} 岁</span><small>{item.startYear} 起</small></div>)}
                </div>
              </section>
            )}
          </section>
        </section>

        <section className="method-section" id="method" aria-labelledby="method-title">
          <div className="method-visual">
            <img src="/manus-storage/guanli-solar-term-diagram_55fe852a.jpg" alt="日行黄道与节气刻度的科学图谱插画" />
            <span>节气为界 / Solar terms</span>
          </div>
          <div className="method-copy">
            <div className="eyebrow"><BookOpenText /> METHOD / 03</div>
            <h2 id="method-title">不是“农历生日”，<br />而是<strong>时刻与节气</strong>。</h2>
            <div className="method-list">
              <div><span>01</span><p><b>真太阳时修正</b>：以 120°E 为基准，按经度差每度 4 分钟折算地方时差。</p></div>
              <div><span>02</span><p><b>立春与节令</b>：年柱以立春为分界；月柱随十二节转换，而非随农历初一转换。</p></div>
              <div><span>03</span><p><b>晚子时处理</b>：当前版本以 23:00 作为换日边界；流派差异应在正式使用前另行核对。</p></div>
            </div>
            <a className="reference-link" href="https://github.com/6tail/lunar-javascript" target="_blank" rel="noreferrer">查看所用历法库说明 <ArrowUpRight /></a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div><img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="" /><span>观历 · 一个可核对的四柱排盘界面</span></div>
        <p>资料性工具，不构成命理解读、医疗、法律、投资或人生决策建议。</p>
      </footer>
    </div>
  );
}
