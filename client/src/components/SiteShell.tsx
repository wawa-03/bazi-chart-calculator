import { Link, useLocation } from "wouter";
import { BookOpenText, ChevronRight, CircleUserRound, LogIn, LogOut, ScrollText, Sparkles } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import "@/pages/ProductPages.css";

const copy = {
  "zh-CN": { chart: "排盘", manual: "命书", pricing: "服务", consultation: "咨询", account: "账户", login: "登录", logout: "退出", accountHint: "我的档案", footer: "排盘工具。只作参考，不替你做决定。" },
  "zh-TW": { chart: "排盤", manual: "命書", pricing: "服務", consultation: "諮詢", account: "帳戶", login: "登入", logout: "登出", accountHint: "我的檔案", footer: "排盤工具。只作參考，不替你做決定。" },
  en: { chart: "Chart", manual: "Annual", pricing: "Services", consultation: "Contact", account: "Account", login: "Log in", logout: "Log out", accountHint: "My archive", footer: "A charting tool. For reflection, not decisions." },
} as const;

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const { locale, setLocale } = useAppLocale();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location] = useLocation();
  const text = copy[locale];
  const nav = [
    { href: "/chart", label: text.chart },
    { href: "/chart#manual", label: text.manual },
    { href: "/pricing", label: text.pricing },
    { href: "/consultation", label: text.consultation },
  ];

  return <header className={`product-header${minimal ? " is-minimal" : ""}`}>
    <Link className="brand product-brand" href="/" aria-label="观历首页"><img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="Guanli" /><span><b>观历</b><small>BĀZÌ / EPHEMERIS</small></span></Link>
    {!minimal && <nav aria-label="主导航">{nav.map((item) => <a className={location === item.href.split("#")[0] ? "is-active" : ""} href={item.href} key={item.href}>{item.label}<ChevronRight /></a>)}</nav>}
    <div className="product-header-actions">
      <label className="site-locale-control"><span>{locale === "en" ? "Language" : "语言"}</span><select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}><option value="zh-CN">简体中文</option><option value="zh-TW">繁體中文</option><option value="en">English</option></select></label>
      {!loading && (isAuthenticated ? <div className="account-menu"><Link href="/account" title={text.accountHint}><CircleUserRound /><span>{user?.name || text.account}</span></Link><button type="button" onClick={() => logout()} aria-label={text.logout}><LogOut /></button></div> : <button className="header-login" type="button" onClick={startLogin}><LogIn /> {text.login}</button>)}
    </div>
  </header>;
}

export function SiteFooter() {
  const { locale } = useAppLocale();
  return <footer className="product-footer"><div><img src="/manus-storage/guanli-orbit-seal-logo_9c6794f4.png" alt="" /><span>观历 / GUANLI</span></div><p>{copy[locale].footer} 阅读免费；人工服务另行确认。</p></footer>;
}

export function ProductPage({ children, minimalHeader = false }: { children: React.ReactNode; minimalHeader?: boolean }) {
  return <div className="product-shell"><SiteHeader minimal={minimalHeader} /><main>{children}</main><SiteFooter /></div>;
}

export function ServicePill({ icon = "spark", children }: { icon?: "spark" | "scroll" | "book"; children: React.ReactNode }) {
  const Icon = icon === "scroll" ? ScrollText : icon === "book" ? BookOpenText : Sparkles;
  return <span className="service-pill"><Icon />{children}</span>;
}
