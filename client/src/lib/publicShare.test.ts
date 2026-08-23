import { describe, expect, it } from "vitest";
import { buildPublicSharePayload } from "./publicShare";

describe("buildPublicSharePayload", () => {
  it("only creates a public landing-page share payload without chart or profile data", () => {
    const payload = buildPublicSharePayload("zh-CN", "https://guanli.example/");
    expect(payload).toEqual({
      title: "观历 · 八字与节气阅读",
      text: "分享一个免费的八字排盘与节气年度阅读工具。",
      url: "https://guanli.example/",
    });
    expect(JSON.stringify(payload)).not.toMatch(/经度|纬度|出生|王二小|日柱/);
  });
});
