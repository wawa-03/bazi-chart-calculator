import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await desktop.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
  const serviceText = await desktop.locator("main").innerText();
  assert.match(serviceText, /完整阅读保持开放/);
  assert.match(serviceText, /网站内不设自动结账/);
  assert.doesNotMatch(serviceText, /¥9\.90|US\$9\.90|€9\.90/);
  assert.equal(await desktop.getByRole("button", { name: /Log in|登录/ }).count(), 1);

  await desktop.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
  const accountText = await desktop.locator("main").innerText();
  assert.match(accountText, /登录后，查看自己的命书与申请/);
  assert.match(accountText, /主题笔记/);
  assert.equal(await desktop.getByRole("button", { name: /登录或创建账户/ }).count(), 1);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(`${baseUrl}/consultation`, { waitUntil: "networkidle" });
  const consultationText = await mobile.locator("main").innerText();
  assert.match(consultationText, /人工解读.*合作联系/);
  assert.match(consultationText, /登录后申请/);
  assert.equal(await mobile.locator('a[href="/chart"]').count() >= 1, true);

  console.log("Free shell verification passed: unauthenticated account guidance, login control, free-service disclosure, and mobile consultation entry are available.");
} finally {
  await browser.close();
}
