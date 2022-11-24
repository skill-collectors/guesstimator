import * as rest from "$lib/services/rest";

export interface Room {
  roomId: string;
  hostKey: string | undefined;
  validSizes: string;
  isRevealed: boolean;
  users: { username: string; vote: string }[];
}

export async function createRoom(): Promise<Room> {
  return await rest.post("/rooms");
}

export async function getRoom(roomId: string): Promise<Room> {
  return await rest.get(`/rooms/${roomId}`);
}

export async function joinRoom(roomId: string, name: string) {
  return await rest.post(`/rooms/${roomId}/users`, { name });
}

export async function deleteRoom(roomId: string, hostKey: string) {
  await rest.del(`/rooms/${roomId}`, { hostKey });
}

export async function setIsRevealed(
  roomId: string,
  value: boolean,
  hostKey: string
) {
  await rest.put(`/rooms/${roomId}/isRevealed`, { value, hostKey });
}
