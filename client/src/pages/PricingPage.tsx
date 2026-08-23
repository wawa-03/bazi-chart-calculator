import { ArrowRight, Check, Compass, ScrollText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import "./ProductPages.css";

export default function PricingPage() {
  return <ProductPage><section className="page-hero"><ServicePill icon="scroll">怎么使用</ServicePill><h1>先自己看。<strong>需要再找人。</strong></h1><p>排盘、命书和报告都免费。</p></section><section className="pricing-grid"><article className="pricing-card free"><span>免费</span><h2>基础排盘</h2><p>一直免费</p><ul><li><Check />城市和经纬度</li><li><Check />真太阳时与四柱</li><li><Check />下载排盘</li></ul><Link className="quiet-cta" href="/chart"><Compass />开始排盘</Link></article><article className="pricing-card featured"><span>免费</span><h2>年度命书</h2><p>一直免费</p><ul><li><Check />未来月卷</li><li><Check />大运和流年</li><li><Check />四个主题</li><li><Check />导出报告</li></ul><Link className="primary-cta" href="/chart#manual"><ScrollText />看年度命书 <ArrowRight /></Link></article><article className="pricing-card"><span>人工服务</span><h2>人工深度解读</h2><p>先了解，再联系。</p><ul><li><Check />说清你想聊什么</li><li><Check />私下提交申请</li><li><Check />确认后再安排</li></ul><Link className="quiet-cta" href="/consultation?service=deep_reading">了解人工解读 <ArrowRight /></Link></article></section><section className="payment-boundary"><ShieldCheck /><div><h2>这里不能付款</h2><p>人工服务、合作和赞助，联系后再确认。</p></div></section></ProductPage>;
}
