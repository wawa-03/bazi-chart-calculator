export const annualMethod = {
  version: "2026.08.23",
  calendarLibrary: "lunar-javascript",
  baziInputs: ["公历出生日期与时间", "出生地经度", "出生地纬度", "性别"],
  baziRules: [
    "以立春作为年柱边界，以节气作为月柱边界",
    "按出生地经度相对东经 120 度作每度 4 分钟的地方时差修正",
    "采用晚子时（23:00 起）换日规则",
  ],
  annualWindow: "服务端以 Asia/Shanghai 当前时刻取得下一节；当年只开放该节对应的未来农历月卷，下一年度开放全年的未来月卷。",
  contentGeneration: "月卷与人生主题正文目前是固定编辑提示；主题对照将排盘中的大运序列与所选年份立春后的流年干支作为阅读索引，不以这些输入生成确定性的未来事件结论。",
  limitation: "不包含均时差、城市行政区推断、流派差异配置、财务建议、医疗建议或个性化的事件预测模型。",
} as const;
