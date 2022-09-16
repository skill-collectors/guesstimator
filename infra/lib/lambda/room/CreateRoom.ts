import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as crypto from "crypto";
import { corsAllowApp } from "../../CorsHeaders";

// Alpha-numeric without similar looking characters like I and l or 0 and O
const VALID_ID_CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_ID_LENGTH = 6;
const HOST_KEY_LENGTH = 4;
function generateId(length: number) {
  let roomId = "";
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, VALID_ID_CHARACTERS.length);
    roomId += VALID_ID_CHARACTERS.charAt(index);
  }
  return roomId;
}

export default function (tableName: pulumi.Output<string>) {
  return async function handleDocument(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    console.log(`Executing ${event.httpMethod}: ${event.path}`);
    try {
      const client = new aws.sdk.DynamoDB.DocumentClient();
      const roomId = generateId(ROOM_ID_LENGTH);
      const hostKey = generateId(HOST_KEY_LENGTH);
      const validSizes = "1 2 3 5 8 13 20 ? ∞";
      const createdOn = new Date().toISOString();
      await client
        .put({
          TableName: tableName.get(),
          Item: {
            PK: `ROOM:${roomId}`,
            hostKey,
            validSizes,
            isRevealed: false,
            createdOn,
            updatedOn: createdOn,
          },
        })
        .promise();
      console.log(`Created room ${roomId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Success",
          roomId,
          hostKey,
          validSizes,
        }),
        headers: {
          ...corsAllowApp(event),
        },
      };
    } catch (err) {
      console.log(`Failed to create new room: ${err}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: err,
        }),
      };
    }
  };
}
