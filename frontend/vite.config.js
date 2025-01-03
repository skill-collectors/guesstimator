import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	preview: {
		host: 'localhost',
		port: 3001, // Don't conflict with dev server, if running
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: ['./tests/vitest-setup.ts'],
	},
});
