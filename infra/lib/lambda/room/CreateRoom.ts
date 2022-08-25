import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as crypto from "crypto";

// Alpha-numeric without similar looking characters like I and l or 0 and O
const validRoomIdCharacters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const roomIdLength = 6;
function generateRoomId() {
  let roomId = "";
  for (let i = 0; i < roomIdLength; i++) {
    const index = crypto.randomInt(0, validRoomIdCharacters.length);
    roomId += validRoomIdCharacters.charAt(index);
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
      const roomId = generateRoomId();
      await client
        .put({
          TableName: tableName.get(),
          Item: { PK: "hello", roomId },
        })
        .promise();
      console.log(`Created room ${roomId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Success",
          roomId,
        }),
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
