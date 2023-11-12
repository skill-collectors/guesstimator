import { QueryOutput } from "@aws-sdk/client-dynamodb";
import { AWSError, Request } from "aws-sdk";
import { describe, it, expect, vi, afterEach } from "vitest";
import { DbService } from "../../../lib/lambda/DbService";

describe("DbService", () => {
  vi.mock("aws-sdk/clients/dynamodb", () => {
    const client = vi.fn();
    client.prototype.put = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(1)),
    }));
    client.prototype.get = vi.fn(() => ({
      promise: () =>
        new Promise((resolve) =>
          resolve({
            Item: {
              PK: "ROOM:abc",
              SK: "ROOM",
              hostKey: "def",
              validSizes: "1 2 3",
              isRevealed: false,
            },
          }),
        ),
    }));
    client.prototype.query = vi.fn(() => ({
      promise: () =>
        new Promise((resolve) =>
          resolve({
            Items: [
              {
                PK: "ROOM:abc",
                SK: "ROOM",
                hostKey: "def",
                isRevealed: false,
                validSizes: "1 2 3",
              },
              {
                PK: "ROOM:abc",
                SK: "USER:ghi",
                userId: "jkl",
                username: "alice",
                vote: "1",
              },
            ],
          }),
        ),
    }));
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    client.prototype.scan = vi.fn(() => ({
      promise: () =>
        new Promise((resolve) =>
          resolve({
            Items: [
              {
                PK: "ROOM:abc",
                SK: "ROOM",
                hostKey: "def",
                isRevealed: false,
                validSizes: "1 2 3",
                updatedOn: oneMonthAgo.toISOString(),
              },
              {
                PK: "ROOM:abc",
                SK: "USER:ghi",
                userId: "jkl",
                username: "alice",
                vote: "1",
                updatedOn: oneMonthAgo.toISOString(),
              },
            ],
          }),
        ),
    }));
    client.prototype.batchWrite = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(true)),
    }));
    client.prototype.update = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(true)),
    }));
    client.prototype.delete = vi.fn(() => ({
      promise: () => new Promise((resolve) => resolve(true)),
    }));
    return {
      DocumentClient: client,
    };
  });
  const tableName = "TableName";

  afterEach(() => {
    vi.clearAllMocks();
  });

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
      await service.getRoom("abc");

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
  describe("getRoomMetadata", () => {
    it("Just gets the one room metadata item", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.getRoomMetadata("abc");

      // Then
      expect(service.client.get).toHaveBeenCalled();
    });
  });
  describe("subscribe", () => {
    it("Generates a User Key for new users", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      const result = await service.subscribe("abc123", "connectionId");

      // Then
      expect(result).toHaveProperty("userKey");
    });
    it("Updates connection string for existing user", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.subscribe("abc123", "connectionId", "userKey");

      // Then
      expect(service.client.update).toHaveBeenCalled();
    });
  });
  describe("join", () => {
    it("Updates user", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.join("roomId", "userKey", "username");

      // Then
      expect(service.client.update).toHaveBeenCalled();
    });
  });
  describe("reconnect", () => {
    it("Sets the connection Id", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.reconnect("roomId", "userKey", "connectionId");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("connectionId");
    });
  });
  describe("vote", () => {
    it("Updates the database", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.vote("abc", "userKey", "vote");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.UpdateExpression).toContain("vote");
    });
  });
  describe("setCardsRevealed", () => {
    it("Updates the database", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", true);

      // Then
      expect(service.client.batchWrite).toHaveBeenCalled();
    });
    it("Clears votes if isRevealed = false", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", false);

      // Then
      const batchWriteArgs = vi.mocked(service.client.batchWrite).mock.calls[0];
      const userUpdateRequest = batchWriteArgs[0].RequestItems[tableName]
        .map((item) => item.PutRequest?.Item)
        .find((item) => item?.SK.startsWith("USER:"));
      expect(userUpdateRequest?.vote).toBe("");
    });
    it("Does NOT clear votes if isRevealed = true", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", true);

      // Then
      const batchWriteArgs = vi.mocked(service.client.batchWrite).mock.calls[0];
      const userUpdateRequest = batchWriteArgs[0].RequestItems[tableName]
        .map((item) => item.PutRequest?.Item)
        .find((item) => item?.SK.startsWith("USER:"));
      expect(userUpdateRequest?.vote).not.toBe("");
    });
  });
  describe("setValidSizes", () => {
    it("Updates the validSizes field on the ROOM item", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setValidSizes("abc123", "XS S M L XL");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("ROOM");
      expect(params.UpdateExpression).toContain("validSizes");
    });
  });
  describe("leave", () => {
    it("Updates a USER by setting 'username' to ''", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("username");
      expect(params.ExpressionAttributeValues?.[":username"]).toBe("");
    });
    it("Clears the user's vote", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("vote");
      expect(params.ExpressionAttributeValues?.[":vote"]).toBe("");
    });
    it("Does not remove the connectionId", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).not.toContain("REMOVE connectionId");
    });
  });
  describe("kickUser", () => {
    it("Kicks a USER by setting 'username' to ''", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("username");
      expect(params.ExpressionAttributeValues?.[":username"]).toBe("");
    });
    it("Clears the user's vote", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("vote");
      expect(params.ExpressionAttributeValues?.[":vote"]).toBe("");
    });
    it("Removes the connectionId", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const params = vi.mocked(service.client.update).mock.calls[0][0];
      expect(params.Key.SK).toBe("USER:userKey");
      expect(params.UpdateExpression).toContain("REMOVE connectionId");
    });
  });
  describe("deleteUser", () => {
    it("Deletes a USER item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteUser("roomId", "userKey");

      // Then
      expect(service.client.delete).toHaveBeenCalled();
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
  describe("deleteUsersRooms", () => {
    it("Deletes users older than a month ago", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteStaleUsers();

      // Then
      expect(service.client.scan).toHaveBeenCalled();
      expect(service.client.delete).toHaveBeenCalled();
    });
  });
  describe("deleteStaleRooms", () => {
    it("Deletes rooms older than a month ago", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteStaleRooms();

      // Then
      expect(service.client.scan).toHaveBeenCalled();
      expect(service.client.batchWrite).toHaveBeenCalled();
    });
  });
});
