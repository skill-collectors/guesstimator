import * as pulumi from "@pulumi/pulumi";
import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import DbService from "../DbService";
import { parseBodyAsJson } from "../rest/RequestWrapper";
import { ok } from "../rest/Response";

/**
 * Creates the main Lambda Function for this WebSocket API.
 */
export function createMainWebSocketFunction(
  tableNameOutput: pulumi.Output<string>
) {
  return async function (
    event: APIGatewayProxyWebsocketEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const tableName = tableNameOutput.get();
    console.log(`Handling WebSocket event with table ${tableName}`);
    const db = new DbService(tableName);
    switch (event.requestContext.routeKey) {
      case "$connect": {
        db.connectWebSocket(event.requestContext.connectionId);
        return ok("connected!");
      }
      case "$disconnect": {
        db.disconnectWebSocket(event.requestContext.connectionId);
        return ok("disconnected!");
      }
      case "$default":
      default: {
        const body = parseBodyAsJson(event);
        if (body) {
          console.log(`Recieved data with unknown action: ${body.action}`);
        } else {
          console.log("Missing body on event");
        }
        return ok("default!");
      }
    }
  };
}
