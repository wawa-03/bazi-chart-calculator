import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:3000/";
const longitude = "116.407396123456";
const latitude = "39.904201987654";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await desktop.addInitScript(() => {
    class AutocompleteService {
      getPlacePredictions(_request, callback) {
        callback([{ place_id: "beijing-test", description: "北京市", structured_formatting: { main_text: "北京", secondary_text: "中国" } }], "OK");
      }
    }
    class PlacesService {
      getDetails(_request, callback) {
        callback({ name: "北京", formatted_address: "北京市", geometry: { location: { lat: () => 39.904201987654, lng: () => 116.407396123456 } } }, "OK");
      }
    }
    class Map {}
    window.google = { maps: { Map, places: { AutocompleteService, PlacesService, PlacesServiceStatus: { OK: "OK" } } } };
  });
  await desktop.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
  const page = await desktop.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const locales = [
    { value: "zh-CN", nav: "起盘", form: "校对出生条件", result: "乾支排布", city: "出生城市", annual: "不必一次看完" },
    { value: "zh-TW", nav: "起盤", form: "校對出生條件", result: "干支排布", city: "出生城市", annual: "不必一次看完" },
    { value: "en", nav: "Chart", form: "Check birth details", result: "Pillar layout", city: "Birth city", annual: "You do not need to read it all at once" },
  ];

  for (const expected of locales) {
    await page.locator(".site-locale-control select").selectOption(expected.value);
    await page.waitForTimeout(100);
    assert.match(await page.locator(".masthead nav").innerText(), new RegExp(expected.nav));
    assert.match(await page.locator(".sheet-title-row h2").innerText(), new RegExp(expected.form));
    assert.match(await page.locator("#result-title").innerText(), new RegExp(expected.result));
    assert.equal(await page.locator("label[for='birth-city']").innerText(), expected.city);
    assert.match(await page.locator(".manual-intro").innerText(), new RegExp(expected.annual));
  }

  await page.locator(".site-locale-control select").selectOption("en");
  await page.locator("#birth-city").fill("北京");
  await page.locator(".city-suggestions button").first().click({ timeout: 10000 });
  await page.waitForSelector(".city-selected", { timeout: 10000 });
  assert.equal(await page.locator("#longitude").inputValue(), longitude);
  assert.equal(await page.locator("#latitude").inputValue(), latitude);
  await page.locator("#longitude").fill(longitude);
  await page.locator("#latitude").fill(latitude);
  await page.getByRole("button", { name: "Calculate Four Pillars" }).click();
  await page.waitForSelector("#result .coordinate-display");
  const coordinateText = await page.locator("#result .coordinate-display").innerText();
  assert.match(coordinateText, new RegExp(longitude));
  assert.match(coordinateText, new RegExp(latitude));

  await page.getByRole("button", { name: "Copy plain text" }).click();
  await page.waitForTimeout(80);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(copied, new RegExp(longitude));
  assert.match(copied, new RegExp(latitude));

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG chart" }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.png$/);
  await download.saveAs("/tmp/guanli-high-precision.png");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  for (const expected of locales) {
    await mobilePage.locator(".site-locale-control select").selectOption(expected.value);
    await mobilePage.waitForTimeout(100);
    assert.equal(await mobilePage.locator(".site-locale-control select").inputValue(), expected.value);
    assert.match(await mobilePage.locator(".masthead nav").innerText(), new RegExp(expected.nav));
    assert.match(await mobilePage.locator(".sheet-title-row h2").innerText(), new RegExp(expected.form));
    assert.match(await mobilePage.locator("#result-title").innerText(), new RegExp(expected.result));
    assert.equal(await mobilePage.locator("label[for='birth-city']").innerText(), expected.city);
    assert.match(await mobilePage.locator(".manual-intro").innerText(), new RegExp(expected.annual));
  }
  await mobile.close();

  console.log("E2E verification passed: global locale switching and high-precision coordinate export flow.");
} finally {
  await browser.close();
}
