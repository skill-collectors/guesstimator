import type { Room } from "$lib/services/rooms";

function roomKey(roomId: string) {
  return `ROOM:${roomId}`;
}

export function storeRoom(roomData: Room) {
  window.localStorage.setItem(
    roomKey(roomData.roomId),
    JSON.stringify(roomData)
  );
}

export function getRoom(roomId: string): Room | null {
  const roomJson = window.localStorage.getItem(roomKey(roomId));
  if (roomJson === null) {
    return null;
  }
  return JSON.parse(roomJson);
}

export function deleteRoom(roomId: string) {
  window.localStorage.removeItem(roomKey(roomId));
}
