import type { Config } from 'tailwindcss';
import tailwindcssAnimated from 'tailwindcss-animated';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// For 'Everyone agreed!' text
			keyframes: {
				'rainbow-animation': {
					'0%': { color: 'red' },
					'14%': { color: 'orange' },
					'28%': { color: 'yellow' },
					'42%': { color: 'green' },
					'57%': { color: 'blue' },
					'71%': { color: 'indigo' },
					'85%': { color: 'violet' },
					'100%': { color: 'red' },
				},
			},
			animation: {
				rainbow: 'rainbow-animation 4s infinite',
			},
		},
	},
	plugins: [tailwindcssAnimated],
} satisfies Config;
