import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import ApiGatewayManagementApi = require("aws-sdk/clients/apigatewaymanagementapi");
import { RoomData } from "../DbService";
import { ConnectionGoneError } from "./ConnectionGoneError";

export class PublishRoomDataResult {
  goneUserKeys;

  constructor(goneUserKeys: string[]) {
    this.goneUserKeys = goneUserKeys;
  }
}

export class WebSocketPublisher {
  endpoint;

  constructor(event: APIGatewayProxyWebsocketEventV2) {
    const { domainName, stage } = event.requestContext;
    this.endpoint = `https://${domainName}/${stage}/`;
  }

  async sendError(connectionId: string, status: number, message: string) {
    await this.sendMessage(connectionId, {
      status,
      error: message,
    });
  }

  async publishRoomData(
    roomData: RoomData | null,
  ): Promise<PublishRoomDataResult> {
    if (roomData == null) {
      return new PublishRoomDataResult([]);
    }
    console.log(`Sending roomData to all users: ${JSON.stringify(roomData)}`);
    const sendMessageResults: Promise<void>[] = [];
    roomData.users = roomData.users.filter(
      (user) => user.connectionId !== undefined,
    );
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
        sendMessageResults.push(
          this.sendMessage(recipient.connectionId, {
            status: 200,
            data: recipientData,
          }),
        );
      }
    }
    const promiseResults = await Promise.allSettled(sendMessageResults);
    const goneUserKeys: string[] = [];
    for (const result of promiseResults) {
      if (result.status === "rejected") {
        if (result.reason instanceof ConnectionGoneError) {
          const goneUser = roomData.users.find(
            (user) => user.connectionId === result.reason.connectionId,
          );
          if (goneUser?.userKey) {
            goneUserKeys.push(goneUser.userKey);
          }
        } else {
          // Hopefully this never happens
          console.log(
            `Unknown failure sending message: ${
              result.reason
            }: ${JSON.stringify(result.reason)}`,
          );
        }
      }
    }
    return new PublishRoomDataResult(goneUserKeys);
  }

  async sendMessage(connectionId: string, message: object) {
    const api = new ApiGatewayManagementApi({
      endpoint: this.endpoint,
    });
    console.log(
      `Sending message: ${JSON.stringify({
        endpoint: this.endpoint,
        connectionId,
        message,
      })}`,
    );
    try {
      await api
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(message),
        })
        .promise();
    } catch (err) {
      console.log(JSON.stringify(err));
      if (
        typeof err === "object" &&
        err !== null &&
        "statusCode" in err &&
        err.statusCode == 410
      ) {
        console.log(`Failed to send message: ${connectionId} is gone.`);
        throw new ConnectionGoneError(connectionId);
      } else {
        throw err;
      }
    }
  }
}
