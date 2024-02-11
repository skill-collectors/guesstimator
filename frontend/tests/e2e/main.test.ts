import { expect, test, type Browser, type Page } from "@playwright/test";

test("index page has expected h1", async ({ page }) => {
  await page.goto("/");
  expect(await page.textContent("h1")).toBe("The Guesstimator");
});

test("Host workflow", async ({ page, browser }) => {
  await page.goto("/");

  // Wait for the page to finish rendering, otherwise title is not set
  await page.waitForSelector("#createRoomButton");
  expect(await page.title()).toBe("Guesstimator - Home");
  await page.click("#createRoomButton");

  await page.waitForSelector("#hostControls");
  expect(await page.title()).toMatch(/Guesstimator - [A-Z0-9]{6}/);

  await page.getByRole("textbox").fill("host");
  await page.getByText("Join room").click();
  await page.locator("#userControls").getByText("5").click();
  await page.waitForSelector("#userControls");

  // User join
  const userPages = await Promise.all(
    ["user1", "user2", "user3", "user4"].map((username) =>
      joinAs(browser, page.url(), username),
    ),
  );
  userPages.forEach((user) => addVote(user, "8"));

  await page.click("#showCardsButton");
  await page.waitForSelector("#resultsChart");
  await page.click("#hideCardsButton");

  userPages.forEach((user) => user.context().close());

  await page.click("#deleteRoomButton");
});

test("deep links to non-root pages work", async ({ page }) => {
  const response = await page.goto("/style");
  expect(response?.status()).toBe(200);
});

async function joinAs(browser: Browser, roomUrl: string, username: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(roomUrl);
  await page.getByRole("textbox").fill(username);
  await page.getByText("Join room").click();
  await page.locator("#currentVotes").getByText(username).waitFor();
  expect(page.locator("#currentVotes").getByText(username)).toBeVisible();
  return page;
}

async function addVote(page: Page, vote: string) {
  await page.locator("#userControls").getByText(vote).click();
}
