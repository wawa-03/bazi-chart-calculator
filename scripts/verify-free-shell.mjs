import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const homeText = await desktop.locator("main").innerText();
  assert.match(homeText, /把时间，/);
  assert.match(homeText, /看清楚/);
  assert.match(homeText, /输入出生时间和地点/);
  assert.match(homeText, /开始排盘/);
  assert.match(homeText, /已排过盘？看年度阅读/);
  assert.match(homeText, /按节气把时间排清楚。想停，随时可以/);
  assert.doesNotMatch(homeText, /命运，\s*已经选好|答案，从这一刻清楚/);
  const desktopTitle = desktop.locator(".landing-hero h1");
  const desktopTitleBox = await desktopTitle.boundingBox();
  const desktopPrimaryBox = await desktop.locator('.landing-actions a[href="/chart"]').boundingBox();
  assert.equal(await desktopTitle.isVisible(), true);
  assert.ok(desktopTitleBox && desktopTitleBox.y >= 0 && desktopTitleBox.y + desktopTitleBox.height <= 720);
  assert.ok(desktopPrimaryBox && desktopPrimaryBox.y >= 0 && desktopPrimaryBox.y + desktopPrimaryBox.height <= 720);
  const primaryChart = desktop.locator('.landing-actions a[href="/chart"]');
  const annualReading = desktop.locator('.landing-secondary-link[href="/chart#manual"]');
  assert.equal(await primaryChart.count(), 1);
  assert.equal(await annualReading.count(), 1);
  assert.equal(await desktop.locator('.product-header nav').count(), 0);
  assert.equal(await desktop.locator('.route-grid, .landing-note, .landing-hero figure').count(), 0);
  await primaryChart.hover();
  await desktop.waitForTimeout(200);
  assert.notEqual(await primaryChart.evaluate((element) => getComputedStyle(element).transform), "none");
  assert.notEqual(await primaryChart.locator("svg:last-child").evaluate((element) => getComputedStyle(element).transform), "none");
  const primaryPosition = await primaryChart.boundingBox();
  const annualPosition = await annualReading.boundingBox();
  assert.ok(primaryPosition && annualPosition && primaryPosition.y < annualPosition.y);
  assert.equal(await desktop.locator('img[alt="三禺微信好友二维码"]').count(), 0);

  await desktop.goto(`${baseUrl}/chart`, { waitUntil: "networkidle" });
  assert.equal(await desktop.locator('img[alt="Solar-term diagram"]').count(), 1);
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
  await mobile.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const mobileTitle = mobile.locator(".landing-hero h1");
  const mobileTitleBox = await mobileTitle.boundingBox();
  const mobilePrimaryBox = await mobile.locator('.landing-actions a[href="/chart"]').boundingBox();
  assert.equal(await mobileTitle.isVisible(), true);
  assert.match(await mobileTitle.innerText(), /把时间，\s*看清楚/);
  assert.ok(mobileTitleBox && mobileTitleBox.y >= 0 && mobileTitleBox.y + mobileTitleBox.height <= 812);
  assert.ok(mobilePrimaryBox && mobilePrimaryBox.y >= 0 && mobilePrimaryBox.y + mobilePrimaryBox.height <= 812);
  assert.ok(mobilePrimaryBox);
  await mobile.mouse.move(mobilePrimaryBox.x + mobilePrimaryBox.width / 2, mobilePrimaryBox.y + mobilePrimaryBox.height / 2);
  await mobile.mouse.down();
  await mobile.waitForTimeout(100);
  assert.notEqual(await mobile.locator('.landing-actions a[href="/chart"]').evaluate((element) => getComputedStyle(element).transform), "none");
  await mobile.mouse.up();

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
