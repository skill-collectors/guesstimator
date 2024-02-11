import { expect, test, type Browser, type Page } from "@playwright/test";

test("index page has expected h1", async ({ page }) => {
  await page.goto("/");
  expect(await page.textContent("h1")).toBe("The Guesstimator");
});

test("Basic workflow", async ({ page, browser }) => {
  await page.goto("/");

  // Wait for the page to finish rendering, otherwise title is not set
  await page.waitForSelector("#createRoomButton");
  expect(await page.title()).toBe("Guesstimator - Home");
  await page.click("#createRoomButton");

  await page.waitForSelector("#hostControls");
  expect(await page.title()).toMatch(/Guesstimator - [A-Z0-9]{6}/);

  // Users join
  const users = await Promise.all(
    ["user1", "user2", "user3", "user4"].map((username) =>
      addUser(browser, page.url(), username),
    ),
  );

  // Users vote
  await Promise.allSettled(
    users.map((user) => {
      const possibleVotes = ["1", "2", "3", "5", "8", "13", "20"];
      const randomIndex = Math.floor(Math.random() * possibleVotes.length);
      const vote = possibleVotes[randomIndex];
      return addVote(user, vote);
    }),
  );

  // Host joins and votes
  await page.getByRole("textbox").fill("host");
  await page.getByText("Join room").click();
  await page.locator("#userControls").getByText("5").click();
  await page.getByTestId("host-card").getByText("!").waitFor();

  await page.click("#showCardsButton");
  await page.waitForSelector("#resultsChart");
  await page.click("#hideCardsButton");

  users.forEach(async (user) => await user.page.context().close());

  await page.click("#deleteRoomButton");
});

test("deep links to non-root pages work", async ({ page }) => {
  const response = await page.goto("/style");
  expect(response?.status()).toBe(200);
});

async function addUser(browser: Browser, roomUrl: string, username: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(roomUrl);
  await page.getByRole("textbox").fill(username);
  await page.getByText("Join room").click();
  await page.getByTestId(`${username}-card`).waitFor();
  console.log(`${username} joined the room`);
  return { page, username };
}

async function addVote(user: { page: Page; username: string }, vote: string) {
  await user.page.locator("#userControls").getByText(vote).click();
  await user.page.getByTestId(`${user.username}-card`).getByText("!").waitFor();
}
