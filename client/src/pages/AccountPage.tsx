import { Archive, BookOpenText, CalendarDays, ChevronRight, Filter, LogIn, LogOut, NotebookPen, Search, ScrollText, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import "./ProductPages.css";
import "./AccountPage.css";

const serviceCopy = { theme_report: "完整主题报告", annual_manual: "年度命书", deep_reading: "人工深度解读", collaboration: "合作或赞助" } as const;
const themeCopy = { relationship: "关系与亲密", career: "事业与路径", finance: "财务与资源", rhythm: "生活节奏" } as const;
const statusCopy = { pending: "已提交", reviewing: "正在查看", contacted: "已联系", scheduled: "已安排", closed: "已结束" } as const;
const progressStages = ["pending", "reviewing", "contacted", "scheduled", "closed"] as const;

export default function AccountPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [noteQuery, setNoteQuery] = useState("");
  const [noteYear, setNoteYear] = useState("all");
  const utils = trpc.useUtils();
  const archives = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated });
  const notes = trpc.themeNotes.listAll.useQuery(undefined, { enabled: isAuthenticated });
  const consultations = trpc.consultations.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 20_000 });
  const adminQueue = trpc.consultations.adminList.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 20_000 });
  const removeConsultation = trpc.consultations.remove.useMutation({ onSuccess: () => utils.consultations.list.invalidate() });
  const updateStatus = trpc.consultations.adminUpdateStatus.useMutation({ onSuccess: () => { utils.consultations.list.invalidate(); utils.consultations.adminList.invalidate(); } });
  const archiveYears = useMemo(() => Array.from(new Set((archives.data || []).map((item) => item.targetYear))).sort((a, b) => b - a), [archives.data]);
  const archiveYearsById = useMemo(() => new Map((archives.data || []).map((item) => [item.id, item.targetYear])), [archives.data]);
  const filteredNotes = useMemo(() => (notes.data || []).filter((note) => {
    const year = archiveYearsById.get(note.archiveId);
    const label = themeCopy[note.themeKey as keyof typeof themeCopy] || "主题回顾";
    return (noteYear === "all" || String(year) === noteYear) && `${label} ${note.content}`.toLocaleLowerCase().includes(noteQuery.trim().toLocaleLowerCase());
  }), [archiveYearsById, noteQuery, noteYear, notes.data]);

  if (loading) return <ProductPage><section className="account-loading">正在确认账户…</section></ProductPage>;
  if (!isAuthenticated) return <ProductPage><section className="account-gate"><ServicePill icon="book">我的观历</ServicePill><h1>登录后看你的内容。</h1><p>排盘不用登录。保存和申请需要登录。</p><button type="button" className="primary-cta" onClick={startLogin}><LogIn />登录</button></section></ProductPage>;

  return (
    <ProductPage>
      <section className="account-hero"><div><ServicePill icon="book">私有账户</ServicePill><h1>{user?.name || "观历用户"}，<strong>你的内容在这里。</strong></h1><p>{user?.email || "未提供邮箱"} · 只有你能看。</p><button type="button" className="quiet-cta account-logout" onClick={() => logout()}><LogOut />退出</button></div><UserRound /></section>
      <section className="account-stat-row"><div><Archive /><span>已保存命书</span><b>{archives.data?.length ?? "—"}</b></div><div><NotebookPen /><span>主题回顾</span><b>{notes.data?.length ?? "—"}</b></div><div><ScrollText /><span>咨询申请</span><b>{consultations.data?.length ?? "—"}</b></div><div><ShieldCheck /><span>权限</span><b>私有</b></div></section>
      <section className="account-grid">
        <article className="account-card"><header><div><span>ARCHIVES</span><h2>已保存命书</h2></div><Link href="/chart#manual">看命书 <ChevronRight /></Link></header>{archives.isLoading ? <p>正在读取…</p> : archives.data?.length ? <ul className="account-list">{archives.data.map((item) => <li key={item.id}><CalendarDays /><div><b>{item.label}</b><small>{item.targetYear} 年 · {new Date(item.createdAt).toLocaleDateString("zh-CN")}</small></div><Link href="/chart#manual">打开 <ChevronRight /></Link></li>)}</ul> : <div className="account-empty"><BookOpenText /><p>还没保存命书。</p><Link href="/chart#manual">开始阅读 <ChevronRight /></Link></div>}</article>
        <article className="account-card"><header><div><span>HUMAN</span><h2>人工服务申请</h2></div><Link href="/consultation">提交申请 <ChevronRight /></Link></header>{consultations.isLoading ? <p>正在读取…</p> : consultations.data?.length ? <ul className="account-list consultation-list">{consultations.data.map((item) => <li key={item.id}><ScrollText /><div><b>{serviceCopy[item.service]}</b><small>更新于 {new Date(item.updatedAt).toLocaleString("zh-CN")} · <em className={`status-${item.status}`}>{statusCopy[item.status]}</em></small><div className="request-progress" aria-label={`当前进度：${statusCopy[item.status]}`}>{progressStages.map((stage) => <i key={stage} className={progressStages.indexOf(stage) <= progressStages.indexOf(item.status as typeof progressStages[number]) ? "is-done" : ""} title={statusCopy[stage]} />)}</div></div><button type="button" onClick={() => removeConsultation.mutate({ id: item.id })} disabled={removeConsultation.isPending} aria-label="删除申请"><Trash2 /></button></li>)}</ul> : <div className="account-empty"><ScrollText /><p>还没有申请。</p><Link href="/consultation">申请人工解读 <ChevronRight /></Link></div>}<p className="request-refresh-note">进度会自动更新。</p></article>
        <article className="account-card"><header><div><span>NOTES</span><h2>主题笔记</h2></div><Link href="/chart#manual">回到命书 <ChevronRight /></Link></header>{notes.isLoading ? <p>正在读取…</p> : notes.data?.length ? <><div className="note-filters"><label><Search /><input value={noteQuery} onChange={(event) => setNoteQuery(event.target.value)} placeholder="搜索笔记" /></label><label><Filter /><select value={noteYear} onChange={(event) => setNoteYear(event.target.value)}><option value="all">全部年份</option>{archiveYears.map((year) => <option key={year} value={year}>{year} 年</option>)}</select></label></div>{filteredNotes.length ? <ul className="account-list">{filteredNotes.map((item) => <li key={item.id}><NotebookPen /><div><b>{themeCopy[item.themeKey as keyof typeof themeCopy] || "主题笔记"}</b><small>{archiveYearsById.get(item.archiveId) || "—"} 年 · {item.content.slice(0, 72)}{item.content.length > 72 ? "…" : ""}</small></div><Link href="/chart#manual">打开 <ChevronRight /></Link></li>)}</ul> : <div className="account-empty"><Search /><p>没有找到笔记。</p></div>}</> : <div className="account-empty"><NotebookPen /><p>还没有笔记。</p><Link href="/chart#manual">写一条笔记 <ChevronRight /></Link></div>}</article>
      </section>
      {user?.role === "admin" && <section className="admin-queue"><header><span>OWNER ONLY</span><h2>咨询申请队列</h2></header>{adminQueue.isLoading ? <p>正在读取…</p> : adminQueue.data?.length ? <div className="admin-request-grid">{adminQueue.data.map((item) => <article key={item.id}><b>#{item.id} · {serviceCopy[item.service]}</b><small>{statusCopy[item.status]} · 更新于 {new Date(item.updatedAt).toLocaleString("zh-CN")}</small><p>{item.request}</p><span>{item.contactMethod}：{item.contactDetail}</span><label className="admin-status-control">更新进度<select value={item.status} onChange={(event) => updateStatus.mutate({ id: item.id, status: event.target.value as keyof typeof statusCopy })} disabled={updateStatus.isPending}>{progressStages.map((stage) => <option key={stage} value={stage}>{statusCopy[stage]}</option>)}</select></label></article>)}</div> : <p>暂无申请。</p>}</section>}
    </ProductPage>
  );
}
