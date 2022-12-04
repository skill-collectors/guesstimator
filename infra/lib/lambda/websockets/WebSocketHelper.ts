import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { RoomData } from "../DbService";

function sendMessage(connectionId: string, message: object) {
  const api = new ApiGatewayManagementApi({
    endpoint: process.env.ENDPOINT,
  });
  api.postToConnection({
    ConnectionId: connectionId,
    Data: convertToData(message),
  });
}

export function publishRoomData(roomData: RoomData | null) {
  if (roomData == null) {
    return;
  }
  for (const recipient of roomData.users) {
    if (recipient.connectionId !== undefined) {
      // parse/stringify to make a deep copy
      const recipientData: RoomData = JSON.parse(JSON.stringify(roomData));
      // Remove hostKey
      delete recipientData.hostKey;
      for (const user of recipientData.users) {
        if (user.connectionId !== recipient.connectionId) {
          // remove sensitive data for other users
          delete user.connectionId;
          delete user.userKey;
          if (!recipientData.isRevealed) {
            // hide votes if not revealed
            user.vote = "";
          }
        }
      }
      sendMessage(recipient.connectionId, recipientData);
    }
  }
}

function convertToData(message: object) {
  const json = JSON.stringify(message);
  return Uint8Array.from(json.split("").map((x) => x.charCodeAt(0)));
}
