import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { corsAllowApp } from "../CorsHeaders";
import DbService from "./DbService";

function responseEntity(
  event: APIGatewayProxyEvent,
  statusCode: number,
  body: string
) {
  return {
    statusCode,
    body,
    headers: {
      ...corsAllowApp(event),
    },
  };
}

export function createRouter(tableName: pulumi.Output<string>) {
  return async function handleDocument(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    const { httpMethod, path } = event;
    console.log(`Executing ${httpMethod}: ${path}`);

    const client = new aws.sdk.DynamoDB.DocumentClient();
    const db = new DbService(client, tableName.get());
    try {
      if (httpMethod === "OPTIONS") {
        return responseEntity(event, 200, "");
      } else if (httpMethod === "POST" && path === "/rooms/new") {
        const room = await db.createRoom();
        return responseEntity(event, 200, JSON.stringify(room));
      } else {
        return responseEntity(
          event,
          404,
          JSON.stringify({
            message: `No handler for ${httpMethod}: ${path}`,
          })
        );
      }
    } catch (err) {
      console.log(`FAILED ${httpMethod}: ${path} ==> ${err}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error thrown by handler",
          error: JSON.stringify(err),
        }),
      };
    }
  };
}
