/**
 * 观象历书导出工具：以本地 Canvas 绘制可核对的排盘卡片，避免将出生信息上传到服务端。
 */
import { formatCoordinate, type BaziResult } from "@/lib/bazi";
import type { ManualLocale } from "@/lib/manualLanguage";

const PAPER = "#f5f1e8";
const INK = "#1d2628";
const SOFT_INK = "#66706c";
const LINE = "#d1c7b7";
const CINNABAR = "#b4472d";
const INDIGO = "#2c4650";
const SERIF = '"Noto Serif SC", "Songti SC", SimSun, serif';
const SANS = '"Noto Sans SC", "PingFang SC", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", "Noto Sans Mono CJK SC", monospace';

function safeFilename(text: string) {
  return text.replace(/[\s:/]/g, "-").replace(/-+/g, "-");
}

function formatCorrection(minutes: number) {
  const sign = minutes >= 0 ? "+" : "−";
  const total = Math.round(Math.abs(minutes));
  return `${sign}${Math.floor(total / 60)}时${String(total % 60).padStart(2, "0")}分`;
}

function drawRule(context: CanvasRenderingContext2D, y: number, width: number) {
  context.strokeStyle = LINE;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(88, y);
  context.lineTo(width - 88, y);
  context.stroke();
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = Array.from(text);
  let line = "";
  let row = 0;
  chars.forEach((char) => {
    const probe = line + char;
    if (context.measureText(probe).width > maxWidth && line) {
      context.fillText(line, x, y + row * lineHeight);
      line = char;
      row += 1;
    } else {
      line = probe;
    }
  });
  if (line) context.fillText(line, x, y + row * lineHeight);
  return row + 1;
}

export function formatBaziPlainText(result: BaziResult, _locale: ManualLocale = "zh-CN") {
  const pillarLines = result.pillars.map((pillar) => (
    `${pillar.label}：${pillar.ganzhi}  天干十神：${pillar.stemShiShen}  地支藏干：${pillar.hiddenGan.join("、") || "—"}  纳音：${pillar.naYin}  地势：${pillar.diShi}`
  ));
  const daYun = result.daYun.length
    ? result.daYun.map((item) => `${item.ganzhi}（${item.startAge}–${item.endAge}岁，${item.startYear}起）`).join("；")
    : "—";

  return [
    "观历 · 八字排盘",
    "=".repeat(26),
    `原始北京时间：${result.originalTime}`,
    `用于排盘的时刻：${result.correctedTime}`,
    `出生地坐标：经度 ${formatCoordinate(result.longitude)}°，纬度 ${formatCoordinate(result.latitude)}°`,
    `经度校正：${formatCorrection(result.correctionMinutes)}（真太阳时）`,
    "",
    "四柱",
    ...pillarLines,
    "",
    `节气校验：${result.currentJieQi}（前一节：${result.previousJie}；后一节：${result.nextJie}）`,
    `胎元：${result.taiYuan}；命宫：${result.mingGong}；身宫：${result.shenGong}`,
    `大运方向：${result.direction}；起运：${result.startYunText}；起运日：${result.startYunDate}`,
    `大运序列：${daYun}`,
    "",
    `排盘规则：${result.dayBoundaryNote} 年、月柱以节气时刻界定，月柱按节而非农历月切换。`,
    "资料性工具，仅供历法与文化研究参考。",
  ].join("\n");
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("浏览器未能生成 PNG 图像。"));
    }, "image/png");
  });
}

export async function downloadBaziPng(result: BaziResult, _locale: ManualLocale = "zh-CN") {
  const width = 1600;
  const height = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器不支持 PNG 卡片生成。");

  context.fillStyle = PAPER;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 0.035;
  context.strokeStyle = INDIGO;
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x - 120, height);
    context.stroke();
  }
  context.globalAlpha = 1;

  context.fillStyle = CINNABAR;
  context.font = `500 20px ${MONO}`;
  context.fillText("OBSERVATION / EPHEMERIS", 88, 88);
  context.fillStyle = INK;
  context.font = `800 70px ${SERIF}`;
  context.fillText("观历 · 八字排盘", 88, 166);
  context.fillStyle = SOFT_INK;
  context.font = `500 22px ${MONO}`;
  context.fillText("以节气为月界 · 经度折算真太阳时", 90, 208);

  context.save();
  context.translate(1420, 118);
  context.rotate(0.035);
  context.strokeStyle = CINNABAR;
  context.lineWidth = 2;
  context.strokeRect(-88, -48, 176, 96);
  context.fillStyle = CINNABAR;
  context.font = `500 17px ${MONO}`;
  context.textAlign = "center";
  context.fillText("经度校正", 0, -14);
  context.font = `800 30px ${SERIF}`;
  context.fillText(formatCorrection(result.correctionMinutes), 0, 19);
  context.font = `500 15px ${MONO}`;
  context.fillText("真太阳时", 0, 39);
  context.restore();

  drawRule(context, 255, width);
  context.fillStyle = SOFT_INK;
  context.font = `500 16px ${MONO}`;
  context.fillText("原始北京时间", 88, 295);
  context.fillText("用于排盘的时刻", 555, 295);
  context.fillText("出生地坐标", 1055, 295);
  context.fillStyle = INK;
  context.font = `600 24px ${MONO}`;
  context.fillText(result.originalTime, 88, 329);
  context.fillText(result.correctedTime, 555, 329);
  context.fillText(`${formatCoordinate(result.longitude)}° · ${formatCoordinate(result.latitude)}°`, 1055, 329);
  drawRule(context, 360, width);

  const startX = 88;
  const cardY = 406;
  const cardWidth = (width - 176) / 4;
  result.pillars.forEach((pillar, index) => {
    const x = startX + index * cardWidth;
    context.strokeStyle = index === 0 ? INDIGO : LINE;
    context.lineWidth = index === 0 ? 3 : 2;
    context.strokeRect(x, cardY, cardWidth, 420);
    context.fillStyle = SOFT_INK;
    context.font = `500 17px ${MONO}`;
    context.fillText(pillar.label, x + 25, cardY + 35);
    if (pillar.key === "day") {
      context.fillStyle = CINNABAR;
      context.textAlign = "right";
      context.fillText("日主", x + cardWidth - 25, cardY + 35);
      context.textAlign = "left";
    }
    context.fillStyle = INK;
    context.font = `800 112px ${SERIF}`;
    context.textAlign = "center";
    context.fillText(pillar.stem, x + cardWidth / 2, cardY + 168);
    context.strokeStyle = CINNABAR;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x + cardWidth / 2 - 16, cardY + 196);
    context.lineTo(x + cardWidth / 2 + 16, cardY + 196);
    context.stroke();
    context.fillStyle = INK;
    context.fillText(pillar.branch, x + cardWidth / 2, cardY + 315);
    context.textAlign = "left";
    context.fillStyle = SOFT_INK;
    context.font = `500 14px ${MONO}`;
    context.fillText("天干十神", x + 25, cardY + 350);
    context.fillText("地支藏干", x + 25, cardY + 380);
    context.fillText("纳音 / 地势", x + 25, cardY + 410);
    context.fillStyle = INK;
    context.font = `600 17px ${SANS}`;
    context.fillText(pillar.stemShiShen, x + 110, cardY + 350);
    context.fillText(pillar.hiddenGan.join(" · ") || "—", x + 110, cardY + 380);
    context.fillText(`${pillar.naYin} · ${pillar.diShi}`, x + 110, cardY + 410);
  });

  drawRule(context, 878, width);
  context.fillStyle = CINNABAR;
  context.font = `700 17px ${MONO}`;
  context.fillText("节气校验", 88, 920);
  context.fillStyle = INK;
  context.font = `800 34px ${SERIF}`;
  context.fillText(result.currentJieQi, 88, 965);
  context.fillStyle = SOFT_INK;
  context.font = `500 17px ${SANS}`;
  context.fillText(`前一节：${result.previousJie}    后一节：${result.nextJie}`, 238, 957);
  context.fillText(`胎元：${result.taiYuan}    命宫：${result.mingGong}    身宫：${result.shenGong}`, 88, 1008);
  context.fillText(`大运方向：${result.direction}    起运：${result.startYunText}    起运日：${result.startYunDate}`, 88, 1043);
  drawRule(context, 1095, width);
  context.fillStyle = SOFT_INK;
  context.font = `500 16px ${SANS}`;
  drawWrappedText(context, `排盘规则：${result.dayBoundaryNote} 年、月柱以节气时刻界定，月柱按节而非农历月切换。`, 88, 1135, 1160, 29);
  context.fillStyle = CINNABAR;
  context.font = `500 15px ${MONO}`;
  context.fillText("观历 · BĀZÌ / EPHEMERIS · 浏览器本地生成", 88, 1222);
  context.fillStyle = SOFT_INK;
  context.textAlign = "right";
  context.fillText("资料性工具，仅供历法与文化研究参考", width - 88, 1222);
  context.textAlign = "left";

  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `观历-八字排盘-${safeFilename(result.originalTime)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function copyBaziPlainText(result: BaziResult, locale: ManualLocale = "zh-CN") {
  const text = formatBaziPlainText(result, locale);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("当前浏览器无法复制纯文本，请手动选择后复制。");
}
