import { CalendarClock, Mail, MessageCircleMore, QrCode } from "lucide-react";
import { humanContactChannels } from "@/lib/contactChannels";
import "@/pages/ProductPages.css";

export function HumanContactCard({ compact = false }: { compact?: boolean }) {
  const wechat = humanContactChannels.find((channel) => channel.key === "wechat");
  const futureChannels = humanContactChannels.filter((channel) => channel.key !== "wechat");
  if (!wechat?.assetUrl) return null;
  return <section className={`human-contact-card${compact ? " is-compact" : ""}`} id="wechat-contact" aria-labelledby="wechat-contact-title">
    <div className="human-contact-copy"><span><QrCode />DIRECT CONTACT / WECHAT</span><h2 id="wechat-contact-title">扫码联系人工服务方</h2><p>{wechat.description}二维码仅在你主动扫码时由微信处理；不会自动读取、上传或关联你的私有命书、主题笔记与联系方式。</p></div>
    <figure><img src={wechat.assetUrl} alt="三禺微信好友二维码" /><figcaption>微信服务方：三禺</figcaption></figure>
    {!compact && <div className="channel-future-list" aria-label="后续联系渠道"><p>更多渠道将按需开放</p>{futureChannels.map((channel) => { const Icon = channel.key === "email" ? Mail : channel.key === "whatsapp" ? MessageCircleMore : CalendarClock; return <span key={channel.key}><Icon />{channel.title}<small>待配置</small></span>; })}</div>}
  </section>;
}
