import type { Room, User } from '$lib/services/rooms';
import { Operation, PendingOperation } from '$routes/rooms/[roomId]/PendingOperation';
import { describe, expect, it } from 'vitest';

function stubRoom(user: Partial<User>) {
	return {
		users: [user],
	} as unknown as Room;
}

describe('PendingOperation', () => {
	it('Applies pending vote to room data if server returns data early', () => {
		// Given
		const roomData = stubRoom({
			userKey: 'abc123',
			vote: '',
		});
		const pendingOperation = new PendingOperation(Operation.VOTE, '', '1');

		// When
		const result = pendingOperation.apply(roomData);

		// Then
		expect(result?.users[0].vote).toBe('1');
	});
	it('Applies only once when time-to-live is 1', () => {
		// Given
		const roomData = stubRoom({
			userKey: 'abc123',
			vote: '',
		});
		const pendingOperation = new PendingOperation(Operation.VOTE, '', '1', 1);

		// When
		pendingOperation.apply(roomData);

		// Then
		expect(pendingOperation.operation).toBe(Operation.NOOP);
	});
	it('Applies twice when time-to-live is 2', () => {
		// Given
		const roomData = stubRoom({
			userKey: 'abc123',
			vote: '',
		});
		const pendingOperation = new PendingOperation(Operation.VOTE, '', '1', 2);

		// When
		pendingOperation.apply(roomData);
		const opAfterFirstApply = pendingOperation.operation;
		roomData.users[0].vote = pendingOperation.previousValue; // reset
		pendingOperation.apply(roomData);
		const opAfterSecondApply = pendingOperation.operation;

		// Then
		expect(opAfterFirstApply).not.toBe(Operation.NOOP);
		expect(opAfterSecondApply).toBe(Operation.NOOP);
	});

	it('Does nothing if operation is NOOP', () => {
		// Given
		const roomData = stubRoom({
			userKey: 'abc123',
			username: 'username',
			vote: '1',
		});
		const pendingOperation = new PendingOperation(Operation.NOOP);

		// When
		const result = pendingOperation.apply(roomData);

		// Then
		expect(result?.users[0].vote).toBe(roomData.users[0].vote);
		expect(result?.users[0].username).toBe(roomData.users[0].username);
	});

	it('Does nothing if time-to-live is zero', () => {
		// Given
		const roomData = stubRoom({
			userKey: 'abc123',
			username: 'username',
			vote: '1',
		});
		const pendingOperation = new PendingOperation(Operation.VOTE, '1', '2', 0);

		// When
		const result = pendingOperation.apply(roomData);

		// Then
		expect(result?.users[0].vote).toBe(roomData.users[0].vote);
		expect(result?.users[0].username).toBe(roomData.users[0].username);
	});
});
