import { ArrowRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import "./ProductPages.css";
import "./LandingPage.css";

export default function LandingPage() {
  return <ProductPage minimalHeader><section className="landing-hero landing-hero--minimal"><div><ServicePill>观历 / 排盘</ServicePill><h1>把时间，<strong>看清楚。</strong></h1><p>输入出生时间和地点，得到四柱。</p><div className="landing-actions"><Link className="primary-cta" href="/chart"><Compass />开始排盘 <ArrowRight /></Link></div><Link className="landing-secondary-link" href="/chart#manual">已排过盘？看年度阅读 <ArrowRight /></Link><p className="landing-quiet-note">按节气把时间排清楚。想停，随时可以。</p></div></section></ProductPage>;
}
