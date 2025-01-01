import { render } from '@testing-library/svelte';
import RoomHeader from '$routes/rooms/[roomId]/RoomHeader.svelte';
import { describe, it, expect } from 'vitest';

describe('RoomHeader', () => {
	it('Displays the room URL', () => {
		// Given
		const url = new URL('https://example.com');

		// When
		const { getByRole } = render(RoomHeader, { url });

		// Then
		console.log(url.hostname);
		const el = getByRole('banner');
		expect(el.innerHTML).toContain(url.toString());
	});
});
