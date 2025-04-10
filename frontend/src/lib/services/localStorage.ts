function roomKey(roomId: string) {
	return `ROOM:${roomId}`;
}

export function storeHostData(roomId: string, hostKey: string) {
	window.localStorage.setItem(`${roomKey(roomId)}:hostKey`, JSON.stringify({ hostKey }));
}

export function getHostData(roomId: string) {
	const hostDataJson = window.localStorage.getItem(`${roomKey(roomId)}:hostKey`);
	if (hostDataJson === null) {
		return {};
	} else {
		return JSON.parse(hostDataJson);
	}
}

export function storeUserData(roomId: string, userKey?: string, username?: string) {
	console.log(`Storing local user data for ${roomId}: ${userKey}`);
	window.localStorage.setItem(
		`${roomKey(roomId)}:userData`,
		JSON.stringify({ userKey, username, updatedOn: new Date().toISOString() }),
	);
}

export function getUserData(roomId: string) {
	const result = window.localStorage.getItem(`${roomKey(roomId)}:userData`);
	if (result === null) {
		console.log(`No user data for ${roomId}`);
		return {};
	} else {
		const parsed = JSON.parse(result);
		console.log(`Loaded local user data for ${roomId}`, parsed);
		return parsed;
	}
}

export function clearUserData(roomId: string) {
	window.localStorage.removeItem(`${roomKey(roomId)}:userData`);
}

export function deleteHostKey(roomId: string) {
	window.localStorage.removeItem(`${roomKey(roomId)}:hostKey`);
}
