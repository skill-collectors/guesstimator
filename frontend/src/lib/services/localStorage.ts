function roomKey(roomId: string) {
  return `ROOM:${roomId}`;
}

export function storeHostKey(roomId: string, hostKey: string) {
  window.localStorage.setItem(`${roomKey(roomId)}:hostKey`, hostKey);
}

export function getHostKey(roomId: string) {
  return window.localStorage.getItem(`${roomKey(roomId)}:hostKey`);
}

export function storeUserData(
  roomId: string,
  userKey: string,
  username: string
) {
  window.localStorage.setItem(
    `${roomKey(roomId)}:userKey`,
    JSON.stringify({ userKey, username })
  );
}

export function getUserData(roomId: string) {
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
