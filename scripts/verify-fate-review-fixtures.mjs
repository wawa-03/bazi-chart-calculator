import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const annualWindow = { timezone: "Asia/Shanghai", currentYear: 2026, targetYear: 2026, nextJie: "白露", startMonth: 9, openMonths: [9, 10, 11, 12], nextYearAvailable: true };
const annualMethod = { version: "fixture", calendarLibrary: "lunar-javascript", baziInputs: [], baziRules: [], annualWindow: "fixture", contentGeneration: "fixture", limitation: "fixture" };
const fixtureUser = { id: 701, openId: "review-fixture", name: "复核夹具用户", email: "fixture@example.test", loginMethod: "fixture", languagePreference: "zh-CN", role: "user", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", lastSignedIn: "2026-01-01T00:00:00.000Z" };
const savedArchive = { id: 88, userId: 701, label: "复核夹具命书", birthDatetime: "1990-01-27T00:00", targetYear: 2026, inputJson: "{}", profileJson: "{}", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };

function responseFor(path, review) {
  if (path === "auth.me") return fixtureUser;
  if (path === "fateRules.published" || path === "themeNotes.list" || path === "archives.list") return [];
  if (path === "annual.window") return annualWindow;
  if (path === "annual.method") return annualMethod;
  if (path === "locale.current") return { locale: "zh-CN", source: "fixture" };
  if (path === "archives.save") return savedArchive;
  if (path === "fateReviews.mine") return review;
  if (path === "fateReviews.request") return review;
  return null;
}

async function runFixture(browser, review, expectedLabel, expectsPublished) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.route("**/api/trpc/**", async (route) => {
    const url = new URL(route.request().url());
    const paths = url.pathname.split("/api/trpc/")[1].split(",");
    const body = paths.map((path) => ({ result: { data: { json: responseFor(path, review) } } }));
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto(`${baseUrl}/chart`, { waitUntil: "networkidle" });
  await page.locator(".calculate-button").click();
  await page.waitForSelector("#manual", { state: "visible" });
  await page.locator("#manual").scrollIntoViewIfNeeded();
  await page.locator(".manual-create-button").click();
  await page.waitForSelector(".focus-actions-details", { state: "visible" });
  const moreOptions = page.locator(".focus-actions-details");
  await moreOptions.locator("summary").click();
  await moreOptions.getByRole("button", { name: "保存" }).click();
  const reviewCard = page.locator(".fate-review-request");
  await reviewCard.waitFor({ state: "visible" });
  await page.waitForFunction((label) => document.querySelector(".fate-review-request")?.textContent?.includes(label), expectedLabel);
  assert.match(await reviewCard.innerText(), new RegExp(expectedLabel));
  if (expectsPublished) {
    const published = page.locator(".fate-review-result");
    assert.equal(await published.isVisible(), true);
    assert.match(await published.innerText(), /已发布的复核结论/);
    await published.locator("summary").click();
    assert.match(await published.innerText(), /月令与根气符合复核条件/);
  } else {
    assert.equal(await page.locator(".fate-review-result").count(), 0);
  }
  await context.close();
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
try {
  const common = { id: 201, archiveId: 88, ownerUserId: 701, structureVerdict: "格局待定", congGeVerdict: "undetermined", specialCombinationVerdict: null, rationale: null, displayCopy: null, reviewerId: null, reviewedAt: null, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
  await runFixture(browser, { ...common, reviewStatus: "pending" }, "已提交人工复核", false);
  await runFixture(browser, { ...common, reviewStatus: "in_review" }, "命理师正在复核", false);
  await runFixture(browser, { ...common, reviewStatus: "published", structureVerdict: "已发布的复核结论", rationale: "月令与根气符合复核条件", displayCopy: "这是经人工复核后的条件性说明。", reviewerId: 12, reviewedAt: "2026-08-24T00:00:00.000Z" }, "人工复核已发布", true);
  console.log("Fate-review fixture verification passed: pending, in-review, and published user states render without database writes.");
} finally {
  await browser.close();
}
