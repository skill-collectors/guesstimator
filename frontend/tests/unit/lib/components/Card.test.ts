import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Card from '$lib/components/Card.svelte';

describe('Card', () => {
	it('Should display only the username when hidden with no value', () => {
		const username = 'test-user';

		const { getByText } = render(Card, { username, hasValue: false });

		expect(() => getByText(username)).not.toThrow();
		expect(() => getByText(/!/)).toThrow();
	});
	it('Should display exclamation point if hidden with value', () => {
		const username = 'test-user';

		const { getByText } = render(Card, { username, hasValue: true });

		expect(() => getByText(/!/)).not.toThrow();
	});
	it('Should display the value if revealed with value', () => {
		const username = 'test-user';
		const value = '8';

		const { getByText } = render(Card, { username, isRevealed: true, value });

		expect(() => getByText(value)).not.toThrow();
	});
	it('Should display question mark if revealed with no value', () => {
		const username = 'test-user';

		const { getByText } = render(Card, { username, isRevealed: true });

		expect(() => getByText(/\?/)).not.toThrow();
	});
});
