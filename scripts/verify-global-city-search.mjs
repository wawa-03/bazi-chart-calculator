import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:3000";
const captureDir = "/home/ubuntu/global-city-captures";
await mkdir(captureDir, { recursive: true });
const cities = [
  { name: "Beijing", expected: /北京|Beijing/i },
  { name: "London", expected: /London/i },
  { name: "New York", expected: /New York/i },
  { name: "Tokyo", expected: /Tokyo|東京/i },
  { name: "Sydney", expected: /Sydney/i },
];
const corrections = new Map();
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });

try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  for (const city of cities) {
    await page.goto(`${baseUrl}/chart`, { waitUntil: "networkidle" });
    await page.locator("#birth-city").fill(city.name);
    await page.waitForSelector(".city-suggestions", { state: "visible", timeout: 12000 });
    const firstSuggestion = page.locator(".city-suggestions button").filter({ hasText: city.expected }).first();
    assert.equal(await firstSuggestion.count(), 1, `${city.name} should have a matching city suggestion`);
    await firstSuggestion.click();
    await page.waitForSelector(".city-selected", { state: "visible", timeout: 12000 });
    assert.match(await page.locator(".city-selected").innerText(), city.expected);
    assert.match(await page.locator(".city-selected").innerText(), /-?\d+\.\d+°/);

    if (city.name === "London") {
      assert.match(await page.locator(".city-selected").innerText(), /United Kingdom|英国/i);
      await page.screenshot({ path: `${captureDir}/london-selected-mobile.png` });
    }

    await page.locator(".calculate-button").click();
    await page.locator(".chart-loading").waitFor({ state: "hidden", timeout: 2000 });
    await page.waitForSelector(".result-page", { state: "visible", timeout: 8000 });
    assert.equal(await page.locator(".fate-result-overview").isVisible(), true);
    const correctionText = await page.locator(".correction-seal").innerText();
    corrections.set(city.name, correctionText);

    if (city.name === "London") {
      assert.match(correctionText, /Time correction|时间校正|時間校正/);
      assert.match(correctionText, /Local solar time|真太阳时|真太陽時/);
      assert.match(correctionText, /[-−]\d+h/);
      await page.locator("#result").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${captureDir}/london-result-mobile.png` });
    }
  }
  assert.notEqual(corrections.get("London"), corrections.get("Beijing"), "London and Beijing must produce different longitude corrections");
  console.log("Global city verification passed: five cities were selected, coordinates were applied, and each chart was created.");
  await context.close();
} finally {
  await browser.close();
}
