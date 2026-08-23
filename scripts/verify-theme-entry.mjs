import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/chart", { waitUntil: "domcontentloaded" });
  await page.locator(".site-locale-control select").selectOption("zh-CN");
  await page.locator("#manual").scrollIntoViewIfNeeded();
  await page.locator(".manual-create-button").click({ timeout: 10000 });
  await page.waitForSelector("#life-themes", { timeout: 10000 });

  assert.match(await page.locator(".focus-reading-card").innerText(), /文化研究阅读提示/);
  assert.match(await page.locator("#fortune-contrast-title").innerText(), /大运与流年对照/);
  assert.match(await page.locator("#life-themes").innerText(), /关系与亲密/);
  assert.match(await page.locator("#life-themes").innerText(), /事业与路径/);
  assert.match(await page.locator("#life-themes").innerText(), /财务与资源/);
  assert.match(await page.locator("#life-themes").innerText(), /生活节奏/);
  assert.equal(await page.locator(".annual-upgrade-gate").count(), 0);
  assert.equal(await page.locator(".focus-consult-link").getAttribute("href"), "/consultation#wechat-contact");
  assert.ok(await page.getByRole("button", { name: /分享观历/ }).count() >= 1);
  assert.equal(await page.locator(".manual-reading img[alt='三禺微信好友二维码']").count(), 1);
  console.log("Free full-reading verification passed: future volume reveals Da Yun/flow-year contrast, all four life themes, and a human-discussion entry without a purchase gate.");
  await context.close();
} finally {
  await browser.close();
}
