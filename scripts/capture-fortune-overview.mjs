import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const outputDir = "/home/ubuntu/fortune-overview-captures";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
try {
  for (const [label, viewport] of [["desktop", { width: 1280, height: 900 }], ["mobile", { width: 375, height: 812 }]]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/chart", { waitUntil: "networkidle" });
    await page.locator(".calculate-button").click();
    await page.locator(".chart-loading").waitFor({ state: "hidden", timeout: 2000 });
    await page.locator(".result-fortune-overview").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${outputDir}/${label}.png` });
    await context.close();
  }
  console.log(`Saved fortune overview captures to ${outputDir}`);
} finally {
  await browser.close();
}
