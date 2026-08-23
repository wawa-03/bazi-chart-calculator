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
  { value: "theme_report", label: "完整主题报告", detail: "围绕主题报告、阅读索引与回顾方式的问题。" },
  { value: "annual_manual", label: "年度命书", detail: "围绕未来月卷、年度阅读与档案的问题。" },
  { value: "deep_reading", label: "人工深度解读", detail: "由服务方联系你安排人工深度解读的后续方式。" },
  { value: "collaboration", label: "合作或赞助", detail: "用于文化内容合作、品牌赞助或其他站外支持方式的初步沟通；本网站不在此页面收款。" },
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
      setStatus("申请已私有保存，并已通知服务方查看。账户中心会每 20 秒刷新一次处理进度；请留意你填写的联系方式。");
      setRequest("");
      utils.consultations.list.invalidate();
    },
    onError: (error) => setStatus(error.message || "申请未能提交，请稍后重试。"),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit.mutate({ service, contactMethod, contactDetail: contactDetail.trim(), request: request.trim() });
  }

  if (loading) return <ProductPage><section className="account-loading">正在确认账户…</section></ProductPage>;
  if (!isAuthenticated) return <ProductPage><section className="account-gate"><ServicePill icon="scroll">人工解读 / 合作联系</ServicePill><h1>先登录，再提交私有联系申请。</h1><p>你的联系方式、申请内容与可选命书关联只对当前账户和服务方可见；提交后会由人工跟进，不会即时自动生成结论或触发付款。</p><HumanContactCard compact /><button type="button" className="primary-cta" onClick={startLogin}><LogIn />登录后申请</button></section></ProductPage>;

  return (
    <ProductPage>
      <section className="consult-layout">
        <div className="consult-copy">
          <ServicePill icon="scroll">人工深度解读 / 合作联系</ServicePill>
          <h1>把需要深入讨论的部分，交给<strong>人工后续跟进。</strong></h1>
          <p>这是联系服务方的私有申请渠道，可用于人工深度解读、文化合作或赞助沟通。它不替代医疗、法律、投资、保险或其他专业意见；也不承诺针对未来事件作确定判断。</p>
          <ul>
            <li><CheckCircle2 />申请将保存至你的私有账户</li>
            <li><CheckCircle2 />服务方收到运营提醒后查看详情</li>
            <li><CheckCircle2 />账户中心每 20 秒刷新一次可见进度</li>
          </ul>
          <Link href="/account">查看我的申请 <ArrowRight /></Link>
          <HumanContactCard compact />
        </div>
        <form className="consult-form" onSubmit={handleSubmit}>
          <header><span>REQUEST / PRIVATE</span><h2>提交申请</h2></header>
          <label>你想联系的事项
            <select value={service} onChange={(event) => setService(event.target.value as Service)}>
              {serviceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <p className="field-description">{serviceOptions.find((item) => item.value === service)?.detail}</p>
          <label>希望的联系方式
            <select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as ContactMethod)}>
              <option value="account_email">账户邮箱</option><option value="wechat">微信</option><option value="other">其他方式</option>
            </select>
          </label>
          <label>{contactMethod === "wechat" ? "微信号" : contactMethod === "account_email" ? "邮箱" : "联系方式"}
            <input value={contactDetail} maxLength={180} required onChange={(event) => setContactDetail(event.target.value)} placeholder={contactMethod === "wechat" ? "填写用于后续联系的微信号" : "填写可联系到你的方式"} />
          </label>
          <label>你希望重点讨论什么？
            <textarea value={request} minLength={10} maxLength={1000} required onChange={(event) => setRequest(event.target.value)} placeholder="例如：我想围绕今年的事业与关系主题，进一步梳理自己正在面对的选择与节奏。" />
          </label>
          <div className="consult-privacy"><ShieldCheck />仅服务方与当前账户可见；不自动附带现居详细地址或未主动选择的命书资料。</div>
          {status && <p className="consult-status"><CircleAlert />{status}</p>}
          <button className="primary-cta" type="submit" disabled={submit.isPending}><ScrollText />{submit.isPending ? "正在提交…" : "提交私有申请"}<ArrowRight /></button>
          <p className="consult-boundary"><LockKeyhole />提交申请不等于购买、捐赠或即时解读；如需合作、赞助或人工服务，具体方式由服务方在联系后以合规渠道另行确认。</p>
        </form>
      </section>
    </ProductPage>
  );
}
