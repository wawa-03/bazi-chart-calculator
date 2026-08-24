import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/chart", { waitUntil: "domcontentloaded" });
  await page.locator(".site-locale-control select").selectOption("zh-CN");
  assert.equal(await page.locator("#manual").isVisible(), false);
  await page.locator(".calculate-button").click();
  await page.waitForSelector("#manual", { state: "visible", timeout: 10000 });
  await page.locator("#manual").scrollIntoViewIfNeeded();
  await page.locator(".manual-create-button").click({ timeout: 10000 });
  await page.waitForSelector(".theme-pause-card", { timeout: 10000 });

  assert.equal(await page.locator(".month-first-picker").isVisible(), true);
  assert.ok(await page.locator(".month-first-picker .future-month-picker button.is-active").count() === 1);
  assert.match(await page.locator(".focus-reading-card").innerText(), /命理判读，不保证事件结果/);
  assert.match(await page.locator(".focus-reading-card").innerText(), /流月/);
  assert.match(await page.locator(".focus-reading-card").innerText(), /命局/);
  assert.match(await page.locator(".focus-reading-card").innerText(), /行运/);
  assert.match(await page.locator(".focus-reading-card").innerText(), /医疗、法律、投资或重大人生决策/);
  const contrast = page.locator(".fortune-contrast-details");
  const moreOptions = page.locator(".focus-actions-details");
  assert.equal(await contrast.evaluate((element) => element.open), false);
  assert.equal(await moreOptions.evaluate((element) => element.open), false);
  await contrast.locator(":scope > summary").click();
  assert.equal(await contrast.evaluate((element) => element.open), true);
  assert.match(await page.locator("#fortune-contrast-title").innerText(), /大运与流年对照/);
  await moreOptions.locator("summary").click();
  assert.equal(await moreOptions.evaluate((element) => element.open), true);
  assert.match(await page.locator(".theme-pause-card").innerText(), /现在不用给自己一个答案/);
  assert.equal(await page.getByRole("link", { name: "回到排盘" }).getAttribute("href"), "#calculator");
  assert.equal(await page.locator("#life-themes").isVisible(), false);
  await page.getByRole("button", { name: "打开主题" }).click();
  await page.waitForSelector("#life-themes", { state: "visible", timeout: 10000 });
  await page.getByRole("button", { name: "先停在这里" }).click();
  assert.equal(await page.locator("#life-themes").isVisible(), false);
  assert.equal(await page.locator(".theme-pause-card").isVisible(), true);
  await page.getByRole("link", { name: "回到排盘" }).click();
  await page.waitForURL(/#calculator$/);
  assert.match(await page.locator("#life-themes").innerText(), /关系与婚姻/);
  assert.match(await page.locator("#life-themes").innerText(), /事业与职分/);
  assert.match(await page.locator("#life-themes").innerText(), /财运与财星/);
  assert.match(await page.locator("#life-themes").innerText(), /五行与调候/);
  assert.equal(await page.locator(".annual-upgrade-gate").count(), 0);
  assert.equal(await page.locator(".focus-consult-link").getAttribute("href"), "/consultation?service=deep_reading");
  assert.ok(await page.getByRole("button", { name: /分享观历/ }).count() >= 1);
  assert.equal(await page.locator(".manual-reading img[alt='三禺微信好友二维码']").count(), 0);
  console.log("Free full-reading verification passed: future volume derives a flowing month from the natal chart and Da Yun, reveals four fate domains, and keeps the human-discussion entry without a purchase gate.");
  await context.close();
} finally {
  await browser.close();
}
