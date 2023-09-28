import * as pulumi from "@pulumi/pulumi";
import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { DbService } from "../DbService";
import { parseBodyAsJson } from "../rest/RequestWrapper";
import { WebSocketPublisher } from "./WebSocketHelper";

/**
 * Creates the main Lambda Function for this WebSocket API.
 */
export function createMainWebSocketFunction(
  tableNameOutput: pulumi.Output<string>,
) {
  return async function (
    event: APIGatewayProxyWebsocketEventV2,
  ): Promise<APIGatewayProxyStructuredResultV2> {
    const db = new DbService(tableNameOutput.get());
    const publisher = new WebSocketPublisher(event);

    /**
     * Just a helper method to ensure that publishing room data happens the same
     * way every time and includes a step to kick inactive users.
     */
    async function publishRoomData(roomId: string) {
      const publishRoomDataResult = await publisher.publishRoomData(
        await db.getRoom(roomId),
      );
      if (publishRoomDataResult.goneUserKeys.length > 0) {
        for (const userKey of publishRoomDataResult.goneUserKeys) {
          console.log(`Removing gone user ${userKey} from room ${roomId}`);
          await db.kickUser(roomId, userKey);
        }
        // Republish without kicked users
        await publisher.publishRoomData(await db.getRoom(roomId));
      }
    }

    console.log(event);
    if (event.requestContext.routeKey === "$connect") {
      console.log(`(${event.requestContext.connectionId}) Connecting `);
    } else if (event.requestContext.routeKey === "$disconnect") {
      console.log(`(${event.requestContext.connectionId}) Disconnecting`);
    } else {
      const body = parseBodyAsJson(event);
      if (body === null || body === undefined) {
        await publisher.sendError(
          event.requestContext.connectionId,
          400,
          "Missing body content",
        );
      } else if (!body.action) {
        await publisher.sendError(
          event.requestContext.connectionId,
          400,
          "Missing body.action",
        );
      } else if (body.action === "ping") {
        const roomId = body.data.roomId;
        const roomData = await db.getRoom(roomId);
        const user = roomData?.users.find(
          (u) => u.userKey === body.data.userKey,
        );
        if (user && user.userKey) {
          db.reconnect(roomId, user.userKey, event.requestContext.connectionId);
        }
        await publisher.sendMessage(event.requestContext.connectionId, {
          status: 200,
          data: {
            type: "PONG",
          },
        });
      } else if (typeof body.data !== "object") {
        await publisher.sendError(
          event.requestContext.connectionId,
          400,
          "Missing body.data",
        );
      } else {
        const roomId = body.data.roomId;
        const roomData = await db.getRoomMetadata(roomId);
        if (roomData === undefined) {
          await publisher.sendError(
            event.requestContext.connectionId,
            404,
            `No room with ID ${roomId}`,
          );
        } else {
          switch (body.action) {
            case "subscribe": {
              console.log(
                `(${event.requestContext.connectionId}) Subscribing  to ${roomId}`,
              );
              await db.subscribe(
                roomId,
                event.requestContext.connectionId,
                body.data.userKey,
              );
              await publishRoomData(roomId);
              break;
            }
            case "join": {
              const { roomId, userKey, username } = body.data;
              console.log(
                `(${event.requestContext.connectionId}) Joining ${roomId} as ${username}`,
              );
              await db.join(roomId, userKey, username);
              await publishRoomData(roomId);
              break;
            }
            case "vote": {
              const { roomId, userKey, vote } = body.data;
              const validSizes = roomData.validSizes.split(" ");
              if (!validSizes.includes(vote) && vote !== "") {
                await publisher.sendError(
                  event.requestContext.connectionId,
                  400,
                  `Invalid vote: ${vote}. Valid values: ${validSizes}`,
                );
                break;
              }
              console.log(
                `(${event.requestContext.connectionId}) Voting in ${roomId} for ${vote}`,
              );
              await db.vote(roomId, userKey, vote);
              await publishRoomData(roomId);
              break;
            }
            case "reveal": {
              const { roomId, hostKey } = body.data;
              if (hostKey !== roomData.hostKey) {
                await publisher.sendError(
                  event.requestContext.connectionId,
                  403,
                  `Invalid hostKey ${hostKey} for room ${roomId}`,
                );
                break;
              }
              console.log(
                `(${event.requestContext.connectionId}) Revealing cards in ${roomId}`,
              );
              await db.setCardsRevealed(roomId, true);
              await publishRoomData(roomId);
              break;
            }
            case "reset": {
              const { roomId, hostKey } = body.data;
              if (hostKey !== roomData.hostKey) {
                await publisher.sendError(
                  event.requestContext.connectionId,
                  403,
                  `Invalid hostKey ${hostKey} for room ${roomId}`,
                );
                break;
              }
              console.log(
                `(${event.requestContext.connectionId}) Resetting cards in ${roomId}`,
              );
              await db.setCardsRevealed(roomId, false);
              await publishRoomData(roomId);
              break;
            }
            case "setValidSizes": {
              const { roomId, hostKey, newSizes } = body.data;
              if (hostKey !== roomData.hostKey) {
                await publisher.sendError(
                  event.requestContext.connectionId,
                  403,
                  `Invalid hostKey ${hostKey} for room ${roomId}`,
                );
                break;
              }
              console.log(
                `(${event.requestContext.connectionId}) Updating sizes in ${roomId} to ${newSizes}`,
              );
              await db.setValidSizes(roomId, newSizes);
              await db.setCardsRevealed(roomId, false);
              await publishRoomData(roomId);
              break;
            }
            case "leave": {
              const { roomId, userKey } = body.data;
              console.log(
                `(${event.requestContext.connectionId}) Leaving room ${roomId}`,
              );
              await db.leave(roomId, userKey);
              await publishRoomData(roomId);
              break;
            }
            default: {
              await publisher.sendError(
                event.requestContext.connectionId,
                400,
                `Invalid action ${body.action}`,
              );
              break;
            }
          }
        }
      }
    }
    return {
      statusCode: 200,
    };
  };
}
