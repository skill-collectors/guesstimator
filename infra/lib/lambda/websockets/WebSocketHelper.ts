import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import ApiGatewayManagementApi = require("aws-sdk/clients/apigatewaymanagementapi");
import { RoomData } from "../DbService";

export function webSocketPublisher(event: APIGatewayProxyWebsocketEventV2) {
  const { domainName, stage } = event.requestContext;
  const endpoint = `https://${domainName}/${stage}/`;
  return {
    async publishRoomData(roomData: RoomData | null) {
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
          await sendMessage(endpoint, recipient.connectionId, recipientData);
        }
      }
    },
  };
}

async function sendMessage(
  endpoint: string,
  connectionId: string,
  message: object
) {
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
  try {
    await api
      .postToConnection({
        ConnectionId: connectionId,
        Data: convertToData(message),
      })
      .promise();
  } catch (err) {
    console.log(JSON.stringify(err));
  }
}

function convertToData(message: object) {
  const json = JSON.stringify(message);
  return Uint8Array.from(json.split("").map((x) => x.charCodeAt(0)));
}
