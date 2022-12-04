import ApiGatewayManagementApi = require("aws-sdk/clients/apigatewaymanagementapi");
import { RoomData } from "../DbService";

export function webSocketPublisher(endpoint: string) {
  return {
    publishRoomData(roomData: RoomData | null) {
      if (roomData == null) {
        return;
      }
      console.log(JSON.stringify(roomData));
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
          sendMessage(endpoint, recipient.connectionId, recipientData);
        }
      }
    },
  };
}

function sendMessage(endpoint: string, connectionId: string, message: object) {
  const api = new ApiGatewayManagementApi({
    endpoint,
  });
  console.log(
    JSON.stringify({
      endpoint,
      connectionId,
      message,
    })
  );
  api.postToConnection({
    ConnectionId: connectionId,
    Data: convertToData(message),
  });
}

function convertToData(message: object) {
  const json = JSON.stringify(message);
  return Uint8Array.from(json.split("").map((x) => x.charCodeAt(0)));
}
