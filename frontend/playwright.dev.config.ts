import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	use: {
		headless: false,
		baseURL: 'https://guesstimator-dev.superfun.link',
	},
};
export default config;
