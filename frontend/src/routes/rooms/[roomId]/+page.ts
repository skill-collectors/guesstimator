import type { LoadEvent } from "@sveltejs/kit";
import { get } from "$lib/services/rest";

export async function load(ctx: LoadEvent) {
  console.log("Running load function");
  const roomId = ctx.params.roomId;
  const roomData = await get(`/rooms/${roomId}`);
  console.log(`Got roomData: ${JSON.stringify(roomData)}`);
  return { roomData };
}
