import { expect, test } from "@playwright/test";

test("index page has expected h1", async ({ page }) => {
  await page.goto("/");
  expect(await page.textContent("h1")).toBe("The Guesstimator");
});

test("Host workflow", async ({ page }) => {
  await page.goto("/");

  // Wait for the page to finish rendering, otherwise title is not set
  await page.waitForSelector("#createRoomButton");
  expect(await page.title()).toBe("Guesstimator - Home");
  await page.click("#createRoomButton");

  await page.click("#showCardsButton");
  await page.click("#hideCardsButton");

  expect(await page.title()).toMatch(/Guesstimator - [A-Z0-9]{6}/);
  await page.click("#deleteRoomButton");
});

test("deep links to non-root pages work", async ({ page }) => {
  const response = await page.goto("/style");
  expect(response?.status()).toBe(200);
});
