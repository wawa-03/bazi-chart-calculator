import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const outputDir = "/home/ubuntu/core-flow-captures";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/chart", { waitUntil: "networkidle" });
  await page.locator(".site-locale-control select").selectOption("zh-CN");
  await page.screenshot({ path: `${outputDir}/01-before-submit.png` });

  await page.locator(".calculate-button").click();
  await page.locator(".chart-loading").waitFor({ state: "hidden", timeout: 2000 });
  await page.waitForSelector(".result-reading-bridge", { state: "visible" });
  await page.locator("#result").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${outputDir}/02-result-priority.png` });

  await page.locator('.result-reading-bridge a[href="#manual"]').click();
  await page.locator("#manual").scrollIntoViewIfNeeded();
  await page.locator(".manual-create-button").click();
  await page.waitForSelector(".month-first-picker", { state: "visible" });
  await page.locator("#manual-reading").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${outputDir}/03-month-first.png` });
  console.log(`Saved mobile reading-order captures to ${outputDir}`);
  await context.close();
} finally {
  await browser.close();
}
