import { QueryOutput } from "@aws-sdk/client-dynamodb";
import { AWSError, Request } from "aws-sdk";
import { describe, it, expect, vi } from "vitest";
import DbService from "../../../lib/lambda/DbService";

describe("DbService", () => {
  vi.mock("@pulumi/aws", () => {
    const client = vi.fn();
    client.prototype.put = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(1)),
    }));
    client.prototype.get = vi.fn(() => ({
      promise: () =>
        new Promise((resolve) =>
          resolve({
            Item: { roomId: "abc123", validSizes: "1 2 3", isRevealed: false },
          })
        ),
    }));
    client.prototype.query = vi.fn(() => ({
      promise: () =>
        new Promise((resolve) =>
          resolve({
            Items: [{ PK: "ROOM:abc", SK: "ROOM" }],
          })
        ),
    }));
    client.prototype.batchWrite = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(true)),
    }));
    client.prototype.update = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(true)),
    }));
    return {
      sdk: {
        DynamoDB: {
          DocumentClient: client,
        },
      },
    };
  });
  const tableName = "TableName";

  describe("createRoom", () => {
    it("Puts a ROOM item in the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.createRoom();

      // Then
      expect(service.client.put).toHaveBeenCalled();
    });

    it("Generates a room ID", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      const result = await service.createRoom();

      // Then
      expect(result).toHaveProperty("roomId");
    });
  });
  describe("getRoom", () => {
    it("Gets a ROOM item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.getRoom("abc123");

      // Then
      expect(service.client.query).toHaveBeenCalled();
    });
    it("Returns null if the room doesn't exist", async () => {
      // Given
      const service = new DbService(tableName);

      vi.mocked(service.client.query).mockReturnValueOnce({
        promise: vi.fn().mockResolvedValue({
          Items: undefined,
        }),
      } as unknown as Request<QueryOutput, AWSError>);

      // When
      const result = await service.getRoom("abc123");

      // Then
      expect(result).toBeNull();
    });
  });
  describe("addUser", () => {
    it("Generates a User ID", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      const result = await service.addUser("abc123", "Alice");

      // Then
      expect(result).toHaveProperty("userKey");
    });
  });
  describe("setCardsRevealed", () => {
    it("Updates the database", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", true);

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.UpdateExpression).toContain("isRevealed");
      expect(params.UpdateExpression).toContain("updatedOn");
    });
  });
  describe("deleteRoom", () => {
    it("Deletes a ROOM item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteRoom("abc123");

      // Then
      expect(service.client.query).toHaveBeenCalled();
      expect(service.client.batchWrite).toHaveBeenCalled();
    });
  });
});
