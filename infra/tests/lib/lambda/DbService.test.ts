import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import DbService from "../../../lib/lambda/DbService";

describe("Router", () => {
  let mockDynamoDbClient: DocumentClient;
  beforeEach(() => {
    mockDynamoDbClient = {
      put: vi.fn().mockImplementation(() => ({
        promise: () => new Promise((resolve) => resolve("done")),
      })),
    } as unknown as DocumentClient;
  });
  const tableName = "TableName";

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Puts a ROOM item in the table", async () => {
    // Given
    const service = new DbService(mockDynamoDbClient, tableName);

    // When
    await service.createRoom();

    // Then
    expect(mockDynamoDbClient.put).toHaveBeenCalled();
  });

  it("Generates a room ID", async () => {
    // Given
    const service = new DbService(mockDynamoDbClient, tableName);

    // When
    const result = await service.createRoom();

    // Then
    expect(result).toHaveProperty("roomId");
  });
});
