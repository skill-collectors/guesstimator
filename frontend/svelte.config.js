import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import WindiCSS from 'vite-plugin-windicss';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			fallback: "index.html"
		}),
		vite: {
			plugins: [WindiCSS()],
			test: {
				globals: true,
				environment: 'happy-dom',
				include: ['tests/unit/**/*.test.ts']
			}
		}
	}
};

export default config;
