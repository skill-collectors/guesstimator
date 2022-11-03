import { expect, test } from "@playwright/test";

test("Renders a 404 page for invalid paths", async ({ page }) => {
  await page.goto("/not-a-real-page");
  expect(await page.textContent("h1")).toBe("Page not found");
});

test("Displays a custom error for an invalid room", async ({ page }) => {
  await page.goto("/rooms/not-a-real-room");
  expect(await page.textContent("h1")).toBe("Couldn't find that room");
});

test("Server error page displays the errorId if provided", async ({ page }) => {
  await page.goto("/errors/server?errorId=123abc");
  expect(await page.textContent("body")).toContain("123abc");
});
