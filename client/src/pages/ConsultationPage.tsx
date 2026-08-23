import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, LockKeyhole, LogIn, ScrollText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { HumanContactCard } from "@/components/HumanContactCard";
import { ProductPage, ServicePill } from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import "./ProductPages.css";
import "./AccountPage.css";

type Service = "theme_report" | "annual_manual" | "deep_reading" | "collaboration";
type ContactMethod = "account_email" | "wechat" | "other";

const serviceOptions: Array<{ value: Service; label: string; detail: string }> = [
  { value: "theme_report", label: "主题报告", detail: "问报告怎么读。" },
  { value: "annual_manual", label: "年度命书", detail: "问月卷和年度阅读。" },
  { value: "deep_reading", label: "人工深度解读", detail: "申请人工继续聊。" },
  { value: "collaboration", label: "合作或赞助", detail: "聊合作或赞助。这里不能付款。" },
];

export default function ConsultationPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const initialService = useMemo(() => (new URLSearchParams(window.location.search).get("service") as Service) || "deep_reading", []);
  const [service, setService] = useState<Service>(serviceOptions.some((item) => item.value === initialService) ? initialService : "deep_reading");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("account_email");
  const [contactDetail, setContactDetail] = useState(user?.email || "");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState("");
  const submit = trpc.consultations.submit.useMutation({
    onSuccess: () => {
      setStatus("已提交。去账户看进度。 ");
      setRequest("");
      utils.consultations.list.invalidate();
    },
    onError: (error) => setStatus(error.message || "没提交上，请再试一次。"),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit.mutate({ service, contactMethod, contactDetail: contactDetail.trim(), request: request.trim() });
  }

  if (loading) return <ProductPage><section className="account-loading">正在确认账户…</section></ProductPage>;
  if (!isAuthenticated) return <ProductPage><section className="account-gate"><ServicePill icon="scroll">人工服务</ServicePill><h1>登录后再联系。</h1><p>申请只给你和服务方看。</p><details className="consult-boundary"><summary><LockKeyhole />服务说明</summary><p>这里不能付款。提交也不代表马上解读。</p></details><HumanContactCard compact /><button type="button" className="primary-cta" onClick={startLogin}><LogIn />登录后申请</button></section></ProductPage>;

  return (
    <ProductPage>
      <section className="consult-layout">
        <div className="consult-copy">
          <ServicePill icon="scroll">人工服务</ServicePill>
          <h1>想深入聊，<strong>就提交申请。</strong></h1>
          <p>这里用来联系服务方。只作参考，不替代专业意见。</p>
          <ul>
            <li><CheckCircle2 />申请只存你的账户</li>
            <li><CheckCircle2 />服务方会查看</li>
            <li><CheckCircle2 />账户可看进度</li>
          </ul>
          <Link href="/account">查看我的申请 <ArrowRight /></Link>
        </div>
        <form className="consult-form" onSubmit={handleSubmit}>
          <header><span>PRIVATE</span><h2>提交申请</h2></header>
          <label>想聊什么
            <select value={service} onChange={(event) => setService(event.target.value as Service)}>
              {serviceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <p className="field-description">{serviceOptions.find((item) => item.value === service)?.detail}</p>
          <label>怎么联系你
            <select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as ContactMethod)}>
              <option value="account_email">账户邮箱</option><option value="wechat">微信</option><option value="other">其他方式</option>
            </select>
          </label>
          <label>{contactMethod === "wechat" ? "微信号" : contactMethod === "account_email" ? "邮箱" : "联系方式"}
            <input value={contactDetail} maxLength={180} required onChange={(event) => setContactDetail(event.target.value)} placeholder={contactMethod === "wechat" ? "填写微信号" : "填写联系方式"} />
          </label>
          <label>想重点聊什么
            <textarea value={request} minLength={10} maxLength={1000} required onChange={(event) => setRequest(event.target.value)} placeholder="例如：想聊今年的事业和关系。" />
          </label>
          <div className="consult-privacy"><ShieldCheck />只有你和服务方能看。不自动带出命书资料。</div>
          {status && <p className="consult-status"><CircleAlert />{status}</p>}
          <button className="primary-cta" type="submit" disabled={submit.isPending}><ScrollText />{submit.isPending ? "正在提交…" : "提交私有申请"}<ArrowRight /></button>
          <details className="consult-boundary"><summary><LockKeyhole />服务说明</summary><p>提交不代表付款，也不代表马上解读。</p></details>
        </form>
      </section>
      <HumanContactCard />
    </ProductPage>
  );
}
