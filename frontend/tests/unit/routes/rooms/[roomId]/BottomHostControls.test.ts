import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import BottomHostControls from '$routes/rooms/[roomId]/BottomHostControls.svelte';
import userEvent from '@testing-library/user-event';
import type { Room } from '$lib/services/rooms';

function stubRoom(validSizes = ['1', '2', '3']): Room {
	return {
		validSizes,
	} as Room;
}
describe('BottomBottomHostControls', () => {
	it("Renders 'Delete Room' button", () => {
		// Given
		const roomData = stubRoom();

		// When
		const { getByText } = render(BottomHostControls, { roomData });

		// Then
		expect(() => getByText('Delete Room')).not.toThrow();
	});
	it('Shows a loading spinner if delete is clicked', async () => {
		// Given
		const user = userEvent.setup();
		const roomData = stubRoom();

		// When
		const { getByText, getByTitle } = render(BottomHostControls, { roomData });
		await user.click(getByText('Delete Room'));

		// Then
		expect(() => getByTitle('Loading')).toBeDefined();
	});
	it('Allows editing sizes', async () => {
		// Given
		const user = userEvent.setup();
		const roomData = stubRoom();

		// When
		const { getByText, getByTestId } = render(BottomHostControls, { roomData });
		await user.click(getByText('Edit'));
		await user.type(getByTestId('newSizesInput'), 'XS S M L XL');
		await user.click(getByText('Save'));

		// Then
		expect(() => getByText('Edit')).toBeDefined();
	});
});
