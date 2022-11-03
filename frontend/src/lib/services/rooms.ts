import * as rest from "$lib/services/rest";

export interface Room {
  roomId: string;
  hostKey: string | undefined;
  validSizes: string;
  isRevealed: boolean;
}

export async function createRoom(): Promise<Room> {
  return await rest.post("/rooms");
}

export async function getRoom(roomId: string): Promise<Room> {
  return await rest.get(`/rooms/${roomId}`);
}

export async function deleteRoom(roomId: string) {
  await rest.del(`/rooms/${roomId}`);
}
