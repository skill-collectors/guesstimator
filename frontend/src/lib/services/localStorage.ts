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
  window.localStorage.setItem(
    `${roomKey(roomId)}:userKey`,
    JSON.stringify({ userKey, username })
  );
}

export function getUserData(roomId: string) {
  const result = window.localStorage.getItem(`${roomKey(roomId)}:userKey`);
  if (result === null) {
    return {};
  } else {
    return JSON.parse(result);
  }
}

export function deleteHostKey(roomId: string) {
  window.localStorage.removeItem(`${roomKey(roomId)}:hostKey`);
}
