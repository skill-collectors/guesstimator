import type { Room, User } from '$lib/services/rooms';

export enum Operation {
	NOOP = 'NOOP',
	JOIN = 'JOIN',
	LEAVE = 'LEAVE',
	VOTE = 'VOTE',
}

export class PendingOperation {
	private timeToLive;
	operation;
	previousValue;
	pendingValue;

	constructor(operation: Operation, previousValue = '', pendingValue = '', timeToLive = 1) {
		this.operation = operation;
		this.previousValue = previousValue;
		this.pendingValue = pendingValue;
		this.timeToLive = timeToLive;
	}

	reset() {
		this.operation = Operation.NOOP;
		this.previousValue = '';
		this.pendingValue = '';
		this.timeToLive = 0;
	}

	apply(roomData: Room | null) {
		if (roomData !== null && this.timeToLive > 0) {
			const currentUser = roomData.users.find((u) => u.userKey !== undefined);
			if (currentUser) {
				if (this.operation === Operation.JOIN) {
					this.doApply(currentUser, currentUser.username, (u) => (u.username = this.pendingValue));
				}
				if (this.operation === Operation.LEAVE) {
					this.doApply(currentUser, currentUser.username, (u) => (u.username = this.pendingValue));
				}
				if (this.operation === Operation.VOTE) {
					this.doApply(currentUser, currentUser.vote, (u) => (u.vote = this.pendingValue));
				}
			}
		}
		return roomData;
	}

	private doApply(user: User, currentValue: string, transformer: (user: User) => void) {
		if (currentValue === this.pendingValue) {
			// Pending operation was already applied
			this.timeToLive = 0;
		} else {
			console.log(
				`Applying pending ${this.operation.toString()} operation: "${currentValue}" => ${
					this.pendingValue
				} with TTL ${this.timeToLive}`,
			);
			transformer(user);
		}
		this.timeToLive--;
		if (this.timeToLive <= 0) {
			this.reset();
		}
	}
}
