import { describe, expect, it } from "vitest";
import { describeFateReviewStatus } from "./fateReviewStatus";

describe("describeFateReviewStatus", () => {
  it("covers rule-based, pending, in-review and published states without treating any as a guaranteed outcome", () => {
    const states = [null, { reviewStatus: "pending" as const }, { reviewStatus: "in_review" as const }, { reviewStatus: "published" as const }].map((review) => describeFateReviewStatus(review, "zh-CN"));

    expect(states.map((item) => item.stage)).toEqual(["rule_based", "pending", "in_review", "published"]);
    expect(states[0]).toMatchObject({ label: "当前内容尚未人工复核", canRequest: true });
    expect(states[1]).toMatchObject({ label: "已提交人工复核", canRequest: false });
    expect(states[2]).toMatchObject({ label: "命理师正在复核", canRequest: false });
    expect(states[3]).toMatchObject({ label: "人工复核已发布", canRequest: false });
    expect(states.every((item) => !item.description.includes("保证"))).toBe(true);
  });
});
