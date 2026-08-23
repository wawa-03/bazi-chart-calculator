import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const homeText = await desktop.locator("main").innerText();
  assert.match(homeText, /先排盘/);
  assert.match(homeText, /开始排盘/);
  assert.match(homeText, /看年度命书/);
  assert.match(homeText, /人工深度解读/);
  const primaryChart = desktop.locator('.landing-actions a[href="/chart"]');
  const annualReading = desktop.locator('a[href="/chart#manual"]');
  const humanService = desktop.locator('.route-grid article:nth-child(3) a[href^="/consultation"]');
  assert.equal(await primaryChart.count(), 1);
  assert.equal(await annualReading.count() >= 1, true);
  assert.equal(await humanService.count(), 1);
  assert.deepEqual(await desktop.locator('.route-grid article h2').allTextContents(), ["基础排盘", "年度命书", "人工深度解读"]);
  assert.equal(await desktop.locator('img[alt="三禺微信好友二维码"]').count(), 0);

  await desktop.goto(`${baseUrl}/chart`, { waitUntil: "networkidle" });
  const chartRules = desktop.locator(".method-more");
  assert.equal(await chartRules.count(), 1);
  assert.equal(await chartRules.evaluate((element) => element.open), false);
  await chartRules.locator("summary").click();
  assert.equal(await chartRules.evaluate((element) => element.open), true);
  assert.match(await chartRules.innerText(), /按节气换柱|Solar terms/);

  await desktop.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
  const serviceText = await desktop.locator("main").innerText();
  assert.match(serviceText, /先自己看/);
  assert.match(serviceText, /这里不能付款/);
  assert.match(serviceText, /了解人工解读/);
  assert.doesNotMatch(serviceText, /¥9\.90|US\$9\.90|€9\.90/);
  assert.equal(await desktop.locator('img[alt="三禺微信好友二维码"]').count(), 0);
  assert.equal(await desktop.getByRole("button", { name: /Log in|登录/ }).count(), 1);

  await desktop.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
  const accountText = await desktop.locator("main").innerText();
  assert.match(accountText, /登录后看你的内容/);
  assert.match(accountText, /排盘不用登录/);
  assert.equal(await desktop.getByRole("button", { name: /登录/ }).count(), 1);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(`${baseUrl}/consultation`, { waitUntil: "networkidle" });
  const consultationText = await mobile.locator("main").innerText();
  assert.match(consultationText, /人工服务/);
  assert.match(consultationText, /微信服务方：三禺/);
  assert.match(consultationText, /登录后申请/);
  const serviceBoundary = mobile.locator(".consult-boundary");
  assert.equal(await serviceBoundary.count(), 1);
  assert.equal(await serviceBoundary.evaluate((element) => element.open), false);
  await serviceBoundary.locator("summary").click();
  assert.equal(await serviceBoundary.evaluate((element) => element.open), true);
  assert.match(await serviceBoundary.innerText(), /这里不能付款/);
  assert.equal(await mobile.locator('a[href="/chart"]').count() >= 1, true);

  console.log("Free shell verification passed: unauthenticated account guidance, login control, free-service disclosure, and mobile consultation entry are available.");
} finally {
  await browser.close();
}
