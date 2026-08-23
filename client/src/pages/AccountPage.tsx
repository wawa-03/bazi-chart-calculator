import { Archive, BookOpenText, CalendarDays, ChevronRight, LogIn, LogOut, NotebookPen, ScrollText, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import "./ProductPages.css";
import "./AccountPage.css";

const statusCopy = { pending: "等待联系", contacted: "已联系", closed: "已关闭" } as const;
const serviceCopy = { theme_report: "完整主题报告", annual_manual: "年度命书", deep_reading: "人工深度解读", collaboration: "合作或赞助" } as const;
const themeCopy = { relationship: "关系与亲密", career: "事业与路径", finance: "财务与资源", rhythm: "生活节奏" } as const;

export default function AccountPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const archives = trpc.archives.list.useQuery(undefined, { enabled: isAuthenticated });
  const notes = trpc.themeNotes.listAll.useQuery(undefined, { enabled: isAuthenticated });
  const consultations = trpc.consultations.list.useQuery(undefined, { enabled: isAuthenticated });
  const adminQueue = trpc.consultations.adminList.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const removeConsultation = trpc.consultations.remove.useMutation({ onSuccess: () => utils.consultations.list.invalidate() });

  if (loading) return <ProductPage><section className="account-loading">正在确认账户…</section></ProductPage>;
  if (!isAuthenticated) return <ProductPage><section className="account-gate"><ServicePill icon="book">我的观历</ServicePill><h1>登录后，查看自己的命书与申请。</h1><p>基础排盘无需登录；保存命书、主题笔记、完整主题报告与人工深度解读申请仅在登录后为你私有保存。</p><button type="button" className="primary-cta" onClick={startLogin}><LogIn />登录或创建账户</button></section></ProductPage>;

  return (
    <ProductPage>
      <section className="account-hero"><div><ServicePill icon="book">私有账户</ServicePill><h1>{user?.name || "观历用户"}，<strong>你的阅读都在这里。</strong></h1><p>{user?.email || "当前账户未提供邮箱"} · 保存内容仅对当前登录账户可见。</p><button type="button" className="quiet-cta account-logout" onClick={() => logout()}><LogOut />退出登录</button></div><UserRound /></section>
      <section className="account-stat-row"><div><Archive /><span>已保存命书</span><b>{archives.data?.length ?? "—"}</b></div><div><NotebookPen /><span>主题回顾</span><b>{notes.data?.length ?? "—"}</b></div><div><ScrollText /><span>咨询申请</span><b>{consultations.data?.length ?? "—"}</b></div><div><ShieldCheck /><span>权限</span><b>私有</b></div></section>
      <section className="account-grid">
        <article className="account-card"><header><div><span>PRIVATE ARCHIVES</span><h2>已保存命书</h2></div><Link href="/chart#manual">进入命书 <ChevronRight /></Link></header>{archives.isLoading ? <p>正在读取…</p> : archives.data?.length ? <ul className="account-list">{archives.data.map((item) => <li key={item.id}><CalendarDays /><div><b>{item.label}</b><small>{item.targetYear} 年 · {new Date(item.createdAt).toLocaleDateString("zh-CN")}</small></div><Link href="/chart#manual">查看 <ChevronRight /></Link></li>)}</ul> : <div className="account-empty"><BookOpenText /><p>尚未保存命书。完成未来月卷阅读后，可将它保存为仅自己可见的档案。</p><Link href="/chart#manual">开始第一卷 <ChevronRight /></Link></div>}</article>
        <article className="account-card"><header><div><span>HUMAN READING</span><h2>人工深度解读申请</h2></div><Link href="/consultation">提交申请 <ChevronRight /></Link></header>{consultations.isLoading ? <p>正在读取…</p> : consultations.data?.length ? <ul className="account-list consultation-list">{consultations.data.map((item) => <li key={item.id}><ScrollText /><div><b>{serviceCopy[item.service]}</b><small>{new Date(item.createdAt).toLocaleDateString("zh-CN")} · <em className={`status-${item.status}`}>{statusCopy[item.status]}</em></small></div><button type="button" onClick={() => removeConsultation.mutate({ id: item.id })} disabled={removeConsultation.isPending} aria-label="删除申请"><Trash2 /></button></li>)}</ul> : <div className="account-empty"><ScrollText /><p>尚未提交咨询申请。服务方会在你选择的渠道联系你安排后续。</p><Link href="/consultation">申请人工解读 <ChevronRight /></Link></div>}</article>
        <article className="account-card"><header><div><span>PRIVATE REFLECTIONS</span><h2>主题回顾笔记</h2></div><Link href="/chart#manual">回到命书 <ChevronRight /></Link></header>{notes.isLoading ? <p>正在读取…</p> : notes.data?.length ? <ul className="account-list">{notes.data.map((item) => <li key={item.id}><NotebookPen /><div><b>{themeCopy[item.themeKey as keyof typeof themeCopy] || "主题回顾"}</b><small>关联命书 #{item.archiveId} · {new Date(item.updatedAt).toLocaleDateString("zh-CN")}</small></div><Link href="/chart#manual">查看 <ChevronRight /></Link></li>)}</ul> : <div className="account-empty"><NotebookPen /><p>还没有主题回顾笔记。进入年度命书的主题卡片后，可为已保存命书写下仅自己可见的回顾。</p><Link href="/chart#manual">进入主题阅读 <ChevronRight /></Link></div>}</article>
      </section>
      {user?.role === "admin" && <section className="admin-queue"><header><span>OWNER ONLY</span><h2>咨询申请队列</h2></header>{adminQueue.isLoading ? <p>正在读取…</p> : adminQueue.data?.length ? <div className="admin-request-grid">{adminQueue.data.map((item) => <article key={item.id}><b>#{item.id} · {serviceCopy[item.service]}</b><small>{item.status} · {new Date(item.createdAt).toLocaleString("zh-CN")}</small><p>{item.request}</p><span>{item.contactMethod}：{item.contactDetail}</span></article>)}</div> : <p>暂无申请。</p>}</section>}
    </ProductPage>
  );
}
