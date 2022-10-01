import * as crypto from "crypto";

// Alpha-numeric without similar looking characters like I and l or 0 and O
const VALID_ID_CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateId(length: number) {
  let id = "";
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, VALID_ID_CHARACTERS.length);
    id += VALID_ID_CHARACTERS.charAt(index);
  }
  return id;
}
