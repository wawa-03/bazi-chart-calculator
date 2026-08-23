import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const homeText = await desktop.locator("main").innerText();
  assert.match(homeText, /先完成排盘/);
  assert.match(homeText, /开始八字排盘/);
  assert.match(homeText, /了解年度阅读/);
  assert.match(homeText, /人工深度解读/);
  const primaryChart = desktop.locator('.landing-actions a[href="/chart"]');
  const annualReading = desktop.locator('a[href="/chart#manual"]');
  const humanService = desktop.locator('.route-grid article:nth-child(3) a[href^="/consultation"]');
  assert.equal(await primaryChart.count(), 1);
  assert.equal(await annualReading.count() >= 1, true);
  assert.equal(await humanService.count(), 1);
  assert.deepEqual(await desktop.locator('.route-grid article h2').allTextContents(), ["基础排盘", "年度命书", "人工深度解读"]);
  assert.equal(await desktop.locator('img[alt="三禺微信好友二维码"]').count(), 0);

  await desktop.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
  const serviceText = await desktop.locator("main").innerText();
  assert.match(serviceText, /完整阅读保持开放/);
  assert.match(serviceText, /网站内不设自动结账/);
  assert.match(serviceText, /了解人工深度解读/);
  assert.doesNotMatch(serviceText, /¥9\.90|US\$9\.90|€9\.90/);
  assert.equal(await desktop.locator('img[alt="三禺微信好友二维码"]').count(), 0);
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
  assert.match(consultationText, /微信服务方：三禺/);
  assert.match(consultationText, /登录后申请/);
  assert.equal(await mobile.locator('a[href="/chart"]').count() >= 1, true);

  console.log("Free shell verification passed: unauthenticated account guidance, login control, free-service disclosure, and mobile consultation entry are available.");
} finally {
  await browser.close();
}
