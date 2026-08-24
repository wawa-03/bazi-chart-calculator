export type UserReviewStatus = "pending" | "in_review" | "published";
export type ReviewLocale = "zh-CN" | "zh-TW" | "en";

type ReviewRecord = { reviewStatus: UserReviewStatus } | null | undefined;

export function describeFateReviewStatus(review: ReviewRecord, locale: ReviewLocale) {
  const stage = review?.reviewStatus || "rule_based";
  const copy = locale === "en"
    ? {
      rule_based: ["RULE-BASED READING", "This reading has not been human-reviewed", "After saving, you may choose to submit this archive to an authorized reviewer."],
      pending: ["HUMAN REVIEW", "Human review requested", "Only authorized reviewers can access this archive while the request is pending."],
      in_review: ["HUMAN REVIEW", "A reviewer is reading this chart", "The current chart remains a rule-based reading until a reviewer publishes a conclusion."],
      published: ["HUMAN REVIEW", "Human review published", "The published conclusion is available below and remains a conditional reading."],
    }
    : locale === "zh-TW"
      ? {
        rule_based: ["規則推演", "目前內容尚未人工複核", "儲存後，可由你主動提交給授權命理師複核。"],
        pending: ["人工複核", "已提交人工複核", "等待期間，僅授權命理師可查看此檔案。"],
        in_review: ["人工複核", "命理師正在複核", "結論發布前，頁面仍以規則推演為準。"],
        published: ["人工複核", "人工複核已發布", "下方可查看結論；其仍為條件性命理解讀。"],
      }
      : {
        rule_based: ["规则推演", "当前内容尚未人工复核", "保存后，可由你主动提交给授权命理师复核。"],
        pending: ["人工复核", "已提交人工复核", "等待期间，仅授权命理师可查看此档案。"],
        in_review: ["人工复核", "命理师正在复核", "结论发布前，页面仍以规则推演为准。"],
        published: ["人工复核", "人工复核已发布", "下方可查看结论；其仍为条件性命理解读。"],
      };
  const [kicker, label, description] = copy[stage];
  return { stage, kicker, label, description, canRequest: stage === "rule_based" };
}
