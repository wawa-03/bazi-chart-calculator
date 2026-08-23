import { ArrowRight, BookOpenText, CalendarRange, Compass, LockKeyhole, ScrollText } from "lucide-react";
import { Link } from "wouter";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import "./ProductPages.css";

export default function LandingPage() {
  return <ProductPage><section className="landing-hero"><div><ServicePill>观历 / 2026</ServicePill><h1>先排盘。<strong>再往下看。</strong></h1><p>先看八字。想多看一点，再读年度命书。</p><div className="landing-actions"><Link className="primary-cta" href="/chart"><Compass />开始排盘 <ArrowRight /></Link><Link className="quiet-cta" href="/chart#manual">看年度命书</Link></div><div className="landing-trust"><span>按节气排盘</span><span>校正出生地时间</span><span>资料可删除</span></div></div><figure><img src="/manus-storage/guanli-hero-astronomical-almanac_978f146c.jpg" alt="天文历书与星盘" /><figcaption>先排盘。下一步，由你决定。</figcaption></figure></section><section className="route-grid" aria-label="观历服务路径"><article><div><span>01 / FREE</span><Compass /></div><h2>基础排盘</h2><p>填出生时间和地点，得到四柱。</p><Link href="/chart">开始排盘 <ArrowRight /></Link></article><article><div><span>02 / FREE</span><ScrollText /></div><h2>年度命书</h2><p>看未来月卷和四个主题。</p><Link href="/chart#manual">看年度命书 <ArrowRight /></Link></article><article><div><span>03 / HUMAN</span><BookOpenText /></div><h2>人工深度解读</h2><p>想继续聊，再找人工服务。</p><Link href="/consultation?service=deep_reading">了解人工解读 <ArrowRight /></Link></article></section><section className="landing-note"><CalendarRange /><div><b>不用一次看完。</b><p>排盘和命书免费。人工服务另说。</p></div><LockKeyhole /></section></ProductPage>;
}
