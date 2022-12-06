function roomKey(roomId: string) {
  return `ROOM:${roomId}`;
}

export function storeHostData(roomId: string, hostKey: string) {
  window.localStorage.setItem(
    `${roomKey(roomId)}:hostKey`,
    JSON.stringify({ hostKey })
  );
}

export function getHostData(roomId: string) {
  const hostDataJson = window.localStorage.getItem(
    `${roomKey(roomId)}:hostKey`
  );
  if (hostDataJson === null) {
    return {};
  } else {
    return JSON.parse(hostDataJson);
  }
}

export function storeUserData(
  roomId: string,
  userKey?: string,
  username?: string
) {
  console.log(`Saving user data for ${roomId}: ${userKey}`);
  window.localStorage.setItem(
    `${roomKey(roomId)}:userData`,
    JSON.stringify({ userKey, username })
  );
}

export function getUserData(roomId: string) {
  const result = window.localStorage.getItem(`${roomKey(roomId)}:userData`);
  if (result === null) {
    console.log(`No user data for ${roomId}`);
    return {};
  } else {
    console.log(`Got user data for ${roomId}: ${result}`);
    return JSON.parse(result);
  }
}

export function clearUserData(roomId: string) {
  window.localStorage.removeItem(`${roomKey(roomId)}:userData`);
}

export function deleteHostKey(roomId: string) {
  window.localStorage.removeItem(`${roomKey(roomId)}:hostKey`);
}
