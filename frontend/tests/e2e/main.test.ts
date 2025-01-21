import { expect, test, type Browser, type Page, type Locator } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	expect(await page.textContent('h1')).toBe('The Guesstimator');
});

test('Basic workflow', async ({ page, browser }) => {
	await page.goto('/');

	// Wait for the page to finish rendering, otherwise title is not set
	await page.waitForSelector('#createRoomButton');
	expect(await page.title()).toBe('Guesstimator - Home');

	// Host creates room
	await page.click('#createRoomButton');
	await page.waitForSelector('#hostControls');
	expect(await page.title()).toMatch(/Guesstimator - [A-Z0-9]{6}/);

	// Users join
	const users = await Promise.all(
		['user1', 'user2', 'user3', 'user4'].map((username) => addUser(browser, page.url(), username)),
	);

	// Users vote
	for (const user of users) {
		const possibleVotes = ['1', '2', '3', '5', '8', '13', '20'];
		const randomIndex = Math.floor(Math.random() * possibleVotes.length);
		const vote = possibleVotes[randomIndex];
		await addVote(user, vote);
	}

	// Host joins and votes
	console.log('Host is joining');
	await page.getByRole('textbox').fill('host');
	await page.getByText('Join room').click();
	console.log('Host is voting');
	await page.locator('#userControls').getByText('5').click();
	await page.getByTestId('host-card').getByText('!').waitFor();

	// Host reveals cards
	console.log('Revealing cards');
	await page.click('#showCardsButton');
	await page.waitForSelector('#resultsChart');

	// Host resets the cards
	console.log('Hiding cards');
	await page.click('#hideCardsButton');

	users.forEach(async (user) => {
		console.log(`${user.username} is leaving`);
		return await user.page.context().close();
	});

	console.log('Host is deleting the room');
	await page.click('#deleteRoomButton');
	console.log('Done!');
});

test('deep links to non-root pages work', async ({ page }) => {
	const response = await page.goto('/style');
	expect(response?.status()).toBe(200);
});

async function addUser(browser: Browser, roomUrl: string, username: string) {
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto(roomUrl);
	await page.getByRole('textbox').fill(username);
	await page.getByText('Join room').click();
	const cardLocator = page.getByTestId(`${username}-card`);
	cardLocator.waitFor();
	expect(cardLocator).toHaveCount(1);
	console.log(`${username} joined the room`);
	return { page, username, cardLocator };
}

async function addVote(user: { page: Page; username: string; cardLocator: Locator }, vote: string) {
	console.log(`${user.username} is looking for ${vote} in #userControls`);
	await user.page.locator('#userControls').waitFor({ state: 'visible' });
	await user.page.locator('#userControls').getByText(vote, { exact: true }).click();
	console.log(`${user.username} is waiting for vote to register`);
	await user.cardLocator.getByText('!').waitFor();
	console.log(`${user.username} voted for ${vote}`);
}
