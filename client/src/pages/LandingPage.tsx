import { ArrowRight, BookOpenText, CalendarRange, Compass, LockKeyhole, ScrollText } from "lucide-react";
import { Link } from "wouter";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import "./ProductPages.css";
import "./LandingPage.css";

export default function LandingPage() {
  return <ProductPage><section className="landing-hero"><div><ServicePill>观历 / 2026</ServicePill><h1>把时间，<strong>看清楚。</strong></h1><p>先核对出生时间和地点。再看你想看的部分。</p><div className="landing-actions"><Link className="primary-cta" href="/chart"><Compass />开始排盘 <ArrowRight /></Link><Link className="quiet-cta" href="/chart#manual">看年度命书</Link></div><div className="landing-trust"><span>按节气排盘</span><span>校正出生地时间</span><span>资料可删除</span></div></div><figure><img src="/manus-storage/guanli-solar-term-diagram_55fe852a.jpg" alt="节气与历法示意" /><figcaption>先核对。再决定怎么看。</figcaption></figure></section><section className="route-grid" aria-label="观历服务路径"><article><div><span>01 / FREE</span><Compass /></div><h2>基础排盘</h2><p>填出生时间和地点，得到四柱。</p><Link href="/chart">开始排盘 <ArrowRight /></Link></article><article><div><span>02 / FREE</span><ScrollText /></div><h2>年度命书</h2><p>按自己的节奏看月卷和主题。</p><Link href="/chart#manual">看年度命书 <ArrowRight /></Link></article><article><div><span>03 / HUMAN</span><BookOpenText /></div><h2>人工深度解读</h2><p>需要时，再找人工服务。</p><Link href="/consultation?service=deep_reading">了解人工解读 <ArrowRight /></Link></article></section><section className="landing-note"><CalendarRange /><div><b>想停，就停在这里。</b><p>排盘和命书免费。人工服务另说。</p></div><LockKeyhole /></section></ProductPage>;
}
