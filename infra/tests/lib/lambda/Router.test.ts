import { describe, it, expect, vi } from "vitest";
import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createRouter } from "../../../lib/lambda/Router";

describe("Router", () => {
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
  const router = createRouter(tableNameOutput);

  it("Routes GET /rooms/new", async () => {
    // Given
    const event: APIGatewayProxyEvent = {
      httpMethod: "POST",
      path: "/rooms/new",
    } as unknown as APIGatewayProxyEvent;

    // When
    const response = await router(event);

    // Then
    expect(response.statusCode).toBe(200);
  });

  it("Includes CORS headers", async () => {
    // Given
    const event: APIGatewayProxyEvent = {
      httpMethod: "POST",
      path: "/rooms/new",
      headers: {
        origin: "http://localhost:5173",
      },
    } as unknown as APIGatewayProxyEvent;

    // When
    const response = await router(event);

    // Then
    expect(response.headers?.["Access-Control-Allow-Methods"]).toBe("POST");
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe(
      event.headers.origin
    );
  });
});
