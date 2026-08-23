export type ContactChannel = {
  key: "wechat" | "email" | "whatsapp" | "booking";
  title: string;
  description: string;
  active: boolean;
  href?: string;
  assetUrl?: string;
};

/** Add a real href and switch active to true when each future channel is ready. */
export const humanContactChannels: ContactChannel[] = [
  {
    key: "wechat",
    title: "微信扫码联系",
    description: "扫描二维码，添加「三禺」为好友后说明来自观历。",
    active: true,
    assetUrl: "/manus-storage/guanli-wechat-san-yu-qr_7769c3e9.jpg",
  },
  { key: "email", title: "服务邮箱", description: "待配置公开服务邮箱。", active: false },
  { key: "whatsapp", title: "WhatsApp", description: "待配置公开 WhatsApp 联系链接。", active: false },
  { key: "booking", title: "预约页面", description: "待配置人工讨论预约链接。", active: false },
];
