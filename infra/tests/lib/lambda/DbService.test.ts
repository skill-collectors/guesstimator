import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
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
          resolve({ roomId: "abc123", validSizes: "1 2 3", isRevealed: false })
        ),
    }));
    client.prototype.delete = vi.fn(() => ({
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
      expect(service.client.get).toHaveBeenCalled();
    });
  });
  describe("deleteRoom", () => {
    it("Deletes a ROOM item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteRoom("abc123");

      // Then
      expect(service.client.delete).toHaveBeenCalled();
    });
  });
});
