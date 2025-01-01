import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	use: {
		headless: true,
		baseURL: 'https://guesstimator-qa.superfun.link',
	},
};
export default config;
