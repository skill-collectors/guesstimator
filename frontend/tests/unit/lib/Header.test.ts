import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Header from '$lib/Header.svelte';

describe('Header', () => {
	it('Should say "Welcome to SvelteKit"', () => {
		const { getByText } = render(Header);

		expect(() => getByText(/welcome to sveltekit/i)).not.toThrow();
	});
});
