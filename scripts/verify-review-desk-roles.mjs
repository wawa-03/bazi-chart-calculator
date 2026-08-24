import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";

function userFor(role) {
  if (!role) return null;
  return { id: 801, openId: `role-${role}`, name: "权限夹具", email: "fixture@example.test", loginMethod: "fixture", languagePreference: "zh-CN", role, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", lastSignedIn: "2026-01-01T00:00:00.000Z" };
}

async function verifyRole(browser, role, expected) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.route("**/api/trpc/**", async (route) => {
    const url = new URL(route.request().url());
    const paths = url.pathname.split("/api/trpc/")[1].split(",");
    const payload = paths.map((path) => {
      if (path === "auth.me") return { result: { data: { json: userFor(role) } } };
      if (path === "fateReviews.reviewerList" || path === "fateRules.reviewerList") return { result: { data: { json: [] } } };
      return { result: { data: { json: null } } };
    });
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(payload) });
  });
  await page.goto(`${baseUrl}/review-desk`, { waitUntil: "networkidle" });
  const content = await page.locator("#root").innerText();
  assert.match(content, expected);
  if (role === "astrologer") {
    assert.equal(await page.locator(".review-inbox, .review-editor, .rule-studio").count(), 3);
    assert.match(content, /命理师复核工作台/);
  } else {
    assert.equal(await page.locator(".review-inbox, .review-editor, .rule-studio").count(), 0);
  }
  await context.close();
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
try {
  await verifyRole(browser, null, /登录后进入工作台/);
  await verifyRole(browser, "user", /暂未获得命理师权限/);
  await verifyRole(browser, "astrologer", /命理师复核工作台/);
  console.log("Review-desk role verification passed: signed-out, ordinary user, and astrologer states are isolated.");
} finally {
  await browser.close();
}
