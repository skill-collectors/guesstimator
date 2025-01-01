import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import UnanimousVoteCelebration from '$routes/rooms/[roomId]/UnanimousVoteCelebration.svelte';
import type { Room, User } from '$lib/services/rooms';

function makeRoom(votes: Record<string, string>): Room {
	const users: Array<User> = Object.entries(votes).map((entry) => ({
		userId: entry[0],
		userKey: undefined,
		username: entry[0],
		hasVote: entry[1].length > 0,
		vote: entry[1],
	}));
	return {
		roomId: 'roomId',
		hostKey: undefined,
		validSizes: ['1', '2', '3'],
		isRevealed: false,
		timestamp: new Date().toISOString(),
		users,
	};
}
describe('UnanimousCelebration', () => {
	it('Renders a celebration if everyone agrees', () => {
		const roomData = makeRoom({ user1: '1', user2: '1' });
		const { getByText } = render(UnanimousVoteCelebration, { roomData });

		expect(() => getByText('Everyone agrees!')).not.toThrow();
	});
	it('Does not renders a celebration if nobody agrees', () => {
		const roomData = makeRoom({ user1: '1', user2: '2' });
		const { getByText } = render(UnanimousVoteCelebration, { roomData });

		expect(() => getByText('Everyone agrees!')).toThrow();
	});
	it('Does not renders a celebration if nobody voted', () => {
		const roomData = makeRoom({ user1: '', user2: '' });
		const { getByText } = render(UnanimousVoteCelebration, { roomData });

		expect(() => getByText('Everyone agrees!')).toThrow();
	});
	it('Does not renders a celebration if everyone is confused', () => {
		const roomData = makeRoom({ user1: '?', user2: '?' });
		const { getByText } = render(UnanimousVoteCelebration, { roomData });

		expect(() => getByText('Everyone agrees!')).toThrow();
	});
	it('Does not renders a celebration if everyone is pessimistic', () => {
		const roomData = makeRoom({ user1: '∞', user2: '∞' });
		const { getByText } = render(UnanimousVoteCelebration, { roomData });

		expect(() => getByText('Everyone agrees!')).toThrow();
	});
});
