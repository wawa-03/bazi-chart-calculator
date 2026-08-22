export const annualMethod = {
  version: "2026.08.22",
  calendarLibrary: "lunar-javascript",
  baziInputs: ["公历出生日期与时间", "出生地经度", "出生地纬度", "性别"],
  baziRules: [
    "以立春作为年柱边界，以节气作为月柱边界",
    "按出生地经度相对东经 120 度作每度 4 分钟的地方时差修正",
    "采用晚子时（23:00 起）换日规则",
  ],
  annualWindow: "服务端以 Asia/Shanghai 当前时刻取得下一节；当年只开放该节对应的未来农历月卷，下一年度开放全年的未来月卷。",
  contentGeneration: "月卷正文目前是按农历月组织的固定编辑提示；正式阅读只把日柱、校正后时刻和下一节作为个人阅读坐标，不以这些输入生成确定性的未来事件结论。",
  limitation: "不包含均时差、城市行政区推断、流派差异配置或个性化的事件预测模型。",
} as const;
