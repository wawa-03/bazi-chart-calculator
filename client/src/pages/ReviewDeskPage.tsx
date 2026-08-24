import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { BookCheck, FilePenLine, History, LogIn, Save, Send, ShieldAlert, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import "./ReviewDeskPage.css";

type ReviewStatus = "pending" | "in_review" | "published";
type CongGeVerdict = "undetermined" | "none" | "cong_strong" | "cong_weak" | "other";

const reviewStatusCopy: Record<ReviewStatus, string> = { pending: "待复核", in_review: "复核中", published: "已发布" };
const congCopy: Record<CongGeVerdict, string> = { undetermined: "未定", none: "不取从格", cong_strong: "从强", cong_weak: "从弱", other: "其他从格" };

function parseJson(value: string) {
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function revisionSummary(value: string) {
  const snapshot = parseJson(value);
  const status = reviewStatusCopy[snapshot.reviewStatus as ReviewStatus] || "未定";
  const structure = String(snapshot.structureVerdict || "未填写格局");
  const cong = congCopy[snapshot.congGeVerdict as CongGeVerdict] || "未定";
  return `${status} · ${structure} · ${cong}`;
}

export default function ReviewDeskPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const isReviewer = user?.role === "admin" || user?.role === "astrologer";
  const utils = trpc.useUtils();
  const reviewList = trpc.fateReviews.reviewerList.useQuery(undefined, { enabled: isAuthenticated && isReviewer });
  const ruleList = trpc.fateRules.reviewerList.useQuery(undefined, { enabled: isAuthenticated && isReviewer });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(() => (reviewList.data || []).find((item) => item.review.id === selectedId) || reviewList.data?.[0], [reviewList.data, selectedId]);
  const historyInput = useMemo(() => ({ reviewId: selected?.review.id ?? 0 }), [selected?.review.id]);
  const reviewHistory = trpc.fateReviews.reviewerHistory.useQuery(historyInput, { enabled: isAuthenticated && isReviewer && selected !== undefined });
  const [reviewDraft, setReviewDraft] = useState({ reviewStatus: "pending" as ReviewStatus, structureVerdict: "", congGeVerdict: "undetermined" as CongGeVerdict, specialCombinationVerdict: "", rationale: "", displayCopy: "" });
  const [ruleDraft, setRuleDraft] = useState({ ruleKey: "", title: "", body: "" });
  const saveReview = trpc.fateReviews.reviewerSave.useMutation({ onSuccess: () => { utils.fateReviews.reviewerList.invalidate(); utils.fateReviews.reviewerHistory.invalidate(); } });
  const createRule = trpc.fateRules.reviewerCreateDraft.useMutation({ onSuccess: () => { utils.fateRules.reviewerList.invalidate(); setRuleDraft({ ruleKey: "", title: "", body: "" }); } });
  const publishRule = trpc.fateRules.reviewerPublish.useMutation({ onSuccess: () => { utils.fateRules.reviewerList.invalidate(); utils.fateRules.published.invalidate(); } });

  useEffect(() => {
    if (!selected) return;
    const review = selected.review;
    setReviewDraft({ reviewStatus: review.reviewStatus, structureVerdict: review.structureVerdict || "", congGeVerdict: review.congGeVerdict, specialCombinationVerdict: review.specialCombinationVerdict || "", rationale: review.rationale || "", displayCopy: review.displayCopy || "" });
  }, [selected?.review.id]);

  if (loading) return <main className="review-gate">正在确认权限…</main>;
  if (!isAuthenticated) return <main className="review-gate"><LogIn /><h1>登录后进入工作台。</h1><p>此处只供获得授权的命理师使用。</p><button type="button" onClick={startLogin}>登录</button></main>;
  if (!isReviewer) return <main className="review-gate"><ShieldAlert /><h1>暂未获得命理师权限。</h1><p>你的账户仍可正常使用排盘与年度命书。</p><Link href="/account">回到我的账户</Link></main>;

  const profile = parseJson(selected?.archive.profileJson || "{}");
  const input = parseJson(selected?.archive.inputJson || "{}");
  return <DashboardLayout><div className="review-desk">
    <header className="review-desk-hero"><div><span>REVIEW DESK</span><h1>命理师复核工作台</h1><p>仅查看用户<b>主动提交</b>的命书；保存结论会留下复核状态与编辑人。</p></div><BookCheck /></header>
    <section className="review-desk-grid">
      <aside className="review-inbox"><header><span>SUBMITTED</span><h2>待处理命局</h2></header>{reviewList.isLoading ? <p>正在读取…</p> : reviewList.data?.length ? <div>{reviewList.data.map((item) => <button key={item.review.id} type="button" className={selected?.review.id === item.review.id ? "is-active" : ""} onClick={() => setSelectedId(item.review.id)}><b>#{item.review.id} · {item.archive.label}</b><small>{item.archive.targetYear} 年 · {reviewStatusCopy[item.review.reviewStatus]}</small><em>{new Date(item.review.updatedAt).toLocaleDateString("zh-CN")}</em></button>)}</div> : <p>暂无主动提交的复核申请。</p>}</aside>
      <section className="review-editor">{selected ? <><header><div><span>PRIVATE SUBMISSION</span><h2>{selected.archive.label}</h2><p>{String(profile.birthPlace || "未填出生地")} · {String(input.datetime || selected.archive.birthDatetime)} · 目标 {selected.archive.targetYear} 年</p></div><small>仅用于本次复核</small></header><div className="review-fields"><label>复核状态<select value={reviewDraft.reviewStatus} onChange={(event) => setReviewDraft((current) => ({ ...current, reviewStatus: event.target.value as ReviewStatus }))}>{Object.entries(reviewStatusCopy).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label><label>格局判断<input value={reviewDraft.structureVerdict} maxLength={160} placeholder="例如：官杀当令，身弱取印比" onChange={(event) => setReviewDraft((current) => ({ ...current, structureVerdict: event.target.value }))} /></label><label>从格复核<select value={reviewDraft.congGeVerdict} onChange={(event) => setReviewDraft((current) => ({ ...current, congGeVerdict: event.target.value as CongGeVerdict }))}>{Object.entries(congCopy).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label><label className="wide">特殊合化／条件<textarea value={reviewDraft.specialCombinationVerdict} maxLength={2400} placeholder="记录是否具备月令、根气与全局条件；未满足时说明原因。" onChange={(event) => setReviewDraft((current) => ({ ...current, specialCombinationVerdict: event.target.value }))} /></label><label className="wide">复核依据<textarea value={reviewDraft.rationale} maxLength={4000} placeholder="按月令、旺衰、用忌、合冲、行运逐条记录。" onChange={(event) => setReviewDraft((current) => ({ ...current, rationale: event.target.value }))} /></label><label className="wide">用户可见补充文案<textarea value={reviewDraft.displayCopy} maxLength={2400} placeholder="写给该用户的条件性命理说明；不承诺具体事件。" onChange={(event) => setReviewDraft((current) => ({ ...current, displayCopy: event.target.value }))} /></label></div><button className="review-save" type="button" disabled={saveReview.isPending} onClick={() => saveReview.mutate({ id: selected.review.id, ...reviewDraft })}><Save />{saveReview.isPending ? "正在保存…" : "保存复核"}</button></> : <div className="review-empty"><Sparkles /><p>选择一份用户主动提交的命局开始复核。</p></div>}</section>
    </section>
    {selected && <section className="review-audit"><header><div><span>EDIT AUDIT</span><h2>人工复核编辑记录</h2><p>每次保存均保留编辑人、时间以及修改前后摘要；此记录不向用户公开。</p></div><History /></header>{reviewHistory.isLoading ? <p>正在读取记录…</p> : reviewHistory.data?.length ? <div>{reviewHistory.data.map((revision) => <article key={revision.id}><span>编辑人 #{revision.editorId} · {new Date(revision.createdAt).toLocaleString("zh-CN")}</span><p><b>修改前</b>{revisionSummary(revision.beforeJson)}</p><p><b>修改后</b>{revisionSummary(revision.afterJson)}</p></article>)}</div> : <p>尚未保存过复核编辑。</p>}</section>}
    <section className="rule-studio"><header><div><span>RULE COPY VERSIONING</span><h2>规则与文案校订</h2><p>每次提交都会新建版本；发布新版本会归档同一规则键的旧发布版。</p></div><FilePenLine /></header><div className="rule-studio-grid"><form onSubmit={(event) => { event.preventDefault(); createRule.mutate(ruleDraft); }}><label>规则键<input required value={ruleDraft.ruleKey} pattern="[a-z0-9_-]+" placeholder="special-combination" onChange={(event) => setRuleDraft((current) => ({ ...current, ruleKey: event.target.value }))} /></label><label>标题<input required value={ruleDraft.title} maxLength={120} placeholder="特殊合化的复核条件" onChange={(event) => setRuleDraft((current) => ({ ...current, title: event.target.value }))} /></label><label>文案<textarea required value={ruleDraft.body} minLength={10} maxLength={4000} placeholder="说明该规则适用条件、例外和用户界面用语。" onChange={(event) => setRuleDraft((current) => ({ ...current, body: event.target.value }))} /></label><button type="submit" disabled={createRule.isPending}><Send />{createRule.isPending ? "正在创建…" : "新建草稿版本"}</button></form><div className="rule-history">{ruleList.isLoading ? <p>正在读取版本…</p> : ruleList.data?.length ? ruleList.data.map((rule) => <article key={rule.id}><span>{rule.ruleKey} · v{rule.version}</span><b>{rule.title}</b><p>{rule.body}</p><small>{rule.status === "published" ? "已发布" : rule.status === "draft" ? "草稿" : "已归档"} · {new Date(rule.updatedAt).toLocaleString("zh-CN")}</small>{rule.status !== "published" && <button type="button" disabled={publishRule.isPending} onClick={() => publishRule.mutate({ id: rule.id })}>发布此版本</button>}</article>) : <p>还没有规则版本。</p>}</div></div></section>
  </div></DashboardLayout>;
}
