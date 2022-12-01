import * as pulumi from "@pulumi/pulumi";
import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { ok } from "../rest/Response";

/**
 * Creates the main Lambda Function for this WebSocket API.
 */
export function createMainWebSocketFunction(tableName: pulumi.Output<string>) {
  return async function (
    event: APIGatewayProxyWebsocketEventV2
  ): Promise<APIGatewayProxyResultV2> {
    console.log(`Handling WebSocket event with table ${tableName.get()}`);
    switch (event.requestContext.routeKey) {
      case "$connect": {
        console.log(`Connect ${event.requestContext.connectionId}`);
        return ok("connected!");
      }
      case "$disconnect": {
        console.log(`Disconnect ${event.requestContext.connectionId}`);
        return ok("disconnected!");
      }
      case "$default":
      default: {
        console.log("Recieved data with unknown action: ${}");
        return ok("default!");
      }
    }
  };
}
