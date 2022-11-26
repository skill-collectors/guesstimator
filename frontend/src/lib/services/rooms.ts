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

export async function getRoom(
  roomId: string,
  userKey: string | null = null
): Promise<Room> {
  if (userKey === null) {
    return await rest.get(`/rooms/${roomId}}`);
  } else {
    return await rest.get(`/rooms/${roomId}?userKey=${userKey}`);
  }
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

export async function vote(roomId: string, userKey: string, vote: string) {
  await rest.post(`/rooms/${roomId}/votes`, { userKey, vote });
}
