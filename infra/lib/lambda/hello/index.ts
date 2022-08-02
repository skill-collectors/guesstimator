import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export default function (tableName: pulumi.Output<string>) {
  return async function handleDocument(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    const route = event.pathParameters?.route;
    const body = event.body ? JSON.parse(event.body) : null;

    try {
      const client = new aws.sdk.DynamoDB.DocumentClient();
      await client
        .put({
          TableName: tableName.get(),
          Item: { PK: "hello", roomId: "12345" },
        })
        .promise();

      const result = await client
        .get({
          TableName: tableName.get(),
          Key: { PK: "hello" },
        })
        .promise();

      await client
        .delete({
          TableName: tableName.get(),
          Key: { PK: "hello" },
        })
        .promise();
      return {
        statusCode: 200,
        body: JSON.stringify({
          route,
          item: result.Item,
          affirmation: "Nice job, you've done it! :D",
          requestBodyEcho: body,
        }),
      };
    } catch (err) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };
}
