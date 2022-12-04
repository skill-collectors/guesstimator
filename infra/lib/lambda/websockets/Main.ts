import * as pulumi from "@pulumi/pulumi";
import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { DbService } from "../DbService";
import { parseBodyAsJson } from "../rest/RequestWrapper";
import { clientError, notFound, ok } from "../rest/Response";
import { webSocketPublisher } from "./WebSocketHelper";

/**
 * Creates the main Lambda Function for this WebSocket API.
 */
export function createMainWebSocketFunction(
  tableNameOutput: pulumi.Output<string>
) {
  return async function (
    event: APIGatewayProxyWebsocketEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const db = new DbService(tableNameOutput.get());
    const publisher = webSocketPublisher(event);
    console.log(event);
    if (event.requestContext.routeKey === "$connect") {
      console.log(`(${event.requestContext.connectionId}) Connecting `);
      return ok("connected!");
    } else if (event.requestContext.routeKey === "$disconnect") {
      console.log(`(${event.requestContext.connectionId}) Disconnecting`);
      return ok("disconnected!");
    } else {
      const body = parseBodyAsJson(event);
      if (body === null) {
        return clientError("Missing body content");
      } else if (!body.action) {
        return clientError("Missing action");
      } else if (typeof body.data !== "object") {
        return clientError("Missing data");
      }
      switch (body.action) {
        case "subscribe": {
          const roomId = body.data.roomId;
          const roomData = await db.getRoomMetadata(roomId);
          if (roomData === null) {
            return notFound(`No room with ID ${roomId}`);
          }
          console.log(
            `(${event.requestContext.connectionId}) Subscribing  to ${roomId}`
          );
          await db.subscribe(roomId, event.requestContext.connectionId);
          publisher.publishRoomData(await db.getRoom(roomId));
          return ok("subscribe");
        }
        case "join": {
          const body = parseBodyAsJson(event);
          if (body === null) {
            return clientError("Missing body content");
          }
          const { roomId, userKey, username } = body.data;
          const roomData = await db.getRoomMetadata(roomId);
          if (roomData === null) {
            return notFound(`No room with ID ${roomId}`);
          }
          console.log(
            `(${event.requestContext.connectionId}) Joining ${roomId} as ${username}`
          );
          await db.join(roomId, userKey, username);
          publisher.publishRoomData(await db.getRoom(roomId));
          return ok("join");
        }
        case "vote": {
          const body = parseBodyAsJson(event);
          if (body === null) {
            return clientError("Missing body content");
          }
          const { roomId, userKey, vote } = body.data;
          console.log(
            `(${event.requestContext.connectionId}) Voting in ${roomId} for ${vote}`
          );
          await db.vote(roomId, userKey, vote);
          publisher.publishRoomData(await db.getRoom(roomId));
          return ok("vote");
        }
        case "reveal": {
          const body = parseBodyAsJson(event);
          if (body === null) {
            return clientError("Missing body content");
          }
          const { roomId, hostKey } = body.data;
          const roomData = await db.getRoomMetadata(roomId);
          if (roomData === undefined) {
            return notFound(`No room with Id ${roomId}`);
          }
          if (hostKey !== roomData.hostKey) {
            return clientError(`Invalid hostKey ${hostKey} for room ${roomId}`);
          }
          console.log(
            `(${event.requestContext.connectionId}) Revealing cards in ${roomId}`
          );
          await db.setCardsRevealed(roomId, true);
          publisher.publishRoomData(await db.getRoom(roomId));
          return ok("reveal");
        }
        case "reset": {
          const body = parseBodyAsJson(event);
          if (body === null) {
            return clientError("Missing body content");
          }
          const { roomId, hostKey } = body.data;
          const roomData = await db.getRoomMetadata(roomId);
          if (roomData === undefined) {
            return notFound(`No room with Id ${roomId}`);
          }
          if (hostKey !== roomData.hostKey) {
            return clientError(`Invalid hostKey ${hostKey} for room ${roomId}`);
          }
          console.log(
            `(${event.requestContext.connectionId}) Resetting cards in ${roomId}`
          );
          await db.setCardsRevealed(roomId, false);
          publisher.publishRoomData(await db.getRoom(roomId));
          return ok("reset");
        }
        case "$default":
        default: {
          const body = parseBodyAsJson(event);
          if (body) {
            return clientError(`Unknown action: ${body.action}`);
          } else {
            return clientError(`Missing body: ${body.action}`);
          }
        }
      }
    }
  };
}
