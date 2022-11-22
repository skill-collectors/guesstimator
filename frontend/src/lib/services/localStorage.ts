function roomKey(roomId: string) {
  return `ROOM:${roomId}`;
}

export function storeHostKey(roomId: string, hostKey: string) {
  window.localStorage.setItem(
    `${roomKey(roomId)}:hostKey`,
    JSON.stringify({ hostKey })
  );
}

export function getHostKey(roomId: string) {
  const result = window.localStorage.getItem(`${roomKey(roomId)}:hostKey`);
  if (result === null) {
    return null;
  } else {
    return JSON.parse(result);
  }
}

export function storeUserKey(
  roomId: string,
  userKey: string,
  username: string
) {
  window.localStorage.setItem(
    `${roomKey(roomId)}:userKey`,
    JSON.stringify({ userKey, username })
  );
}

export function getUserKey(roomId: string) {
  const result = window.localStorage.getItem(`${roomKey(roomId)}:userKey`);
  if (result === null) {
    return null;
  } else {
    return JSON.parse(result);
  }
}

export function deleteHostKey(roomId: string) {
  window.localStorage.removeItem(`${roomKey(roomId)}:hostKey`);
}
