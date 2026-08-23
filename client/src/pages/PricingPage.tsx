import { ArrowRight, Check, Compass, ScrollText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import { HumanContactCard } from "@/components/HumanContactCard";
import "./ProductPages.css";

export default function PricingPage() {
  return <ProductPage><section className="page-hero"><ServicePill icon="scroll">服务方式</ServicePill><h1>完整阅读保持开放，<strong>按自己的节奏使用。</strong></h1><p>观历不在网站内对排盘、年度命书、主题阅读或报告导出收费。需要更深入的人工讨论时，可以提交私有咨询申请，由服务方确认安排。</p></section><section className="pricing-grid"><article className="pricing-card free"><span>免费开放</span><h2>基础排盘</h2><p>始终免费</p><ul><li><Check />城市与经纬度输入</li><li><Check />真太阳时、节气、四柱</li><li><Check />PNG 与纯文本排盘导出</li></ul><Link className="quiet-cta" href="/chart"><Compass />开始排盘</Link></article><article className="pricing-card featured"><span>免费开放</span><h2>年度命书与主题报告</h2><p>始终免费</p><ul><li><Check />可读的未来节气月卷</li><li><Check />大运—流年主题对照</li><li><Check />四类人生主题与私有回顾</li><li><Check />完整主题报告导出</li></ul><Link className="primary-cta" href="/chart#manual"><ScrollText />进入年度阅读 <ArrowRight /></Link></article><article className="pricing-card"><span>人工后续讨论</span><h2>深度解读咨询</h2><p>联系后确认</p><ul><li><Check />基于你主动提交的咨询重点</li><li><Check />选择自己的联系方式</li><li><Check />服务方人工后续联系</li></ul><Link className="quiet-cta" href="/consultation?service=deep_reading">提交咨询申请 <ArrowRight /></Link></article></section><HumanContactCard /><section className="payment-boundary"><ShieldCheck /><div><h2>网站内不设自动结账</h2><p>核心工具与阅读内容免费开放。人工咨询、合作或赞助如有后续安排，将由服务方以经确认的合规方式另行沟通；本网站不会嵌入未经批准的付款链接或暗示已可直接购买。</p></div></section></ProductPage>;
}
