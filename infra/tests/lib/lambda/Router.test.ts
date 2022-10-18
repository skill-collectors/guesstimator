import { describe, it, expect, vi } from "vitest";
import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createRouter } from "../../../lib/lambda/Router";

describe("Router", () => {
  // Mock the Pulumi DynamoDB client SDK
  vi.mock("../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.createRoom = vi.fn();
    DbService.prototype.getRoom = vi.fn();
    DbService.prototype.deleteRoom = vi.fn();
    return { default: DbService };
  });

  // Create the handler
  const tableName = "TableName";
  const tableNameOutput = pulumi.Output.create(tableName);
  vi.spyOn(tableNameOutput, "get").mockImplementation(() => tableName);
  const router = createRouter(tableNameOutput);

  it("Routes POST /rooms/new", async () => {
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

  it("Routes GET /rooms/{id}", async () => {
    // Given
    const event: APIGatewayProxyEvent = {
      httpMethod: "GET",
      path: "/rooms/abc123",
    } as unknown as APIGatewayProxyEvent;

    // When
    const response = await router(event);

    // Then
    expect(response.statusCode).toBe(200);
  });

  it("Routes DELETE /rooms/{id}", async () => {
    // Given
    const event: APIGatewayProxyEvent = {
      httpMethod: "DELETE",
      path: "/rooms/abc123",
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
    expect(response.headers?.["Access-Control-Allow-Methods"]).toBe(
      "OPTIONS, GET, POST, PUT, DELETE"
    );
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe(
      event.headers.origin
    );
  });
});
