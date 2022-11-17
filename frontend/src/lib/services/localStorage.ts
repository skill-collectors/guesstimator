function roomKey(roomId: string) {
  return `ROOM:${roomId}`;
}

export function storeHostKey(roomId: string, hostKey: string) {
  window.localStorage.setItem(`${roomKey(roomId)}:hostKey`, hostKey);
}

export function getHostKey(roomId: string) {
  const hostKey = window.localStorage.getItem(`${roomKey(roomId)}:hostKey`);
  if (hostKey === null) {
    return null;
  }
  return hostKey;
}

export function deleteHostKey(roomId: string) {
  window.localStorage.removeItem(`${roomKey(roomId)}:hostKey`);
}
