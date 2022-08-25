import { describe, it, expect, afterEach, vi } from "vitest";
import * as pulumi from "@pulumi/pulumi";
import createRoom from "../../../../lib/lambda/room/CreateRoom";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("CreateRoom", () => {
  // Mock the Pulumi DynamoDB client SDK
  vi.mock("@pulumi/aws", () => {
    const client = vi.fn();
    client.prototype.put = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(1)),
    }));
    return {
      sdk: {
        DynamoDB: {
          DocumentClient: client,
        },
      },
    };
  });

  // Create the handler
  const tableName = "TableName";
  const tableNameOutput = pulumi.Output.create(tableName);
  vi.spyOn(tableNameOutput, "get").mockImplementation(() => tableName);
  const handler = createRoom(tableNameOutput);

  it("Creates a room in DynamoDB", async () => {
    // Given
    const event: APIGatewayProxyEvent = {
      httpMethod: "GET",
      path: "/rooms/new",
    } as unknown as APIGatewayProxyEvent;

    // When
    const response = await handler(event);

    // Then
    expect(response.statusCode).toBe(200);
  });
});
