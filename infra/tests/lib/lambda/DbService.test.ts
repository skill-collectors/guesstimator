import { describe, it, expect, vi, afterEach, SpyInstance } from "vitest";
import { DbService } from "../../../lib/lambda/DbService";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

describe("DbService", () => {
  vi.mock("@aws-sdk/client-dynamodb", () => {
    return {
      DynamoDBClient: vi.fn(),
    };
  });
  vi.mock("@aws-sdk/lib-dynamodb", async () => {
    const mockClient = {
      send: vi.fn((command) => {
        if (command instanceof PutCommand) {
          return new Promise((resolve) => resolve(1));
        }
        if (command instanceof GetCommand) {
          return new Promise((resolve) =>
            resolve({
              Item: {
                PK: "ROOM:abc",
                SK: "ROOM",
                hostKey: "def",
                validSizes: "1 2 3",
                isRevealed: false,
              },
            }),
          );
        }
        if (command instanceof QueryCommand) {
          return new Promise((resolve) =>
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
          );
        }
        if (command instanceof ScanCommand) {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return new Promise((resolve) =>
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
          );
        }
        if (command instanceof BatchWriteCommand) {
          return new Promise((resolve) => resolve(true));
        }
        if (command instanceof UpdateCommand) {
          return new Promise((resolve) => resolve(true));
        }
        if (command instanceof DeleteCommand) {
          return new Promise((resolve) => resolve(true));
        }
        throw Error(`Unimplemented command type ${typeof command}`);
      }),
    };

    const actual = await vi.importActual("@aws-sdk/lib-dynamodb");
    const mockedSDK = {
      ...(actual as Record<string, unknown>),
      DynamoDBDocumentClient: {
        from: vi.fn(() => mockClient),
      },
    };
    return mockedSDK;
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
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        PutCommand,
      );
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
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        QueryCommand,
      );
    });
    it("Returns null if the room doesn't exist", async () => {
      // Given
      const service = new DbService(tableName);

      vi.mocked(
        // We have to cast this because 'send' is overloaded and TypeScript keeps thinking
        // it's the version that returns 'void'
        service.client.send as unknown as SpyInstance,
      ).mockResolvedValueOnce({
        Items: undefined,
      });

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
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        GetCommand,
      );
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
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        UpdateCommand,
      );
    });
  });
  describe("join", () => {
    it("Updates user", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.join("roomId", "userKey", "username");

      // Then
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        UpdateCommand,
      );
    });
  });
  describe("reconnect", () => {
    it("Sets the connection Id", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.reconnect("roomId", "userKey", "connectionId");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain("connectionId");
    });
  });
  describe("vote", () => {
    it("Updates the database", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.vote("abc", "userKey", "vote");

      // Then
      const command = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(command.input.UpdateExpression).toContain("vote");
    });
  });
  describe("setCardsRevealed", () => {
    it("Updates the database", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", true);

      // Then
      expect(vi.mocked(service.client.send).mock.calls[1][0]).toBeInstanceOf(
        BatchWriteCommand,
      );
    });
    it("Clears votes if isRevealed = false", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", false);

      // Then
      const batchWriteCommand = vi.mocked(service.client.send).mock.calls[1][0];
      const userUpdateRequest = (
        batchWriteCommand.input as BatchWriteCommandInput
      ).RequestItems?.[tableName]?.find(
        (requestItem) => requestItem?.PutRequest?.Item?.SK?.startsWith("USER:"),
      );
      expect(userUpdateRequest?.PutRequest?.Item?.vote).toBe("");
    });
    it("Does NOT clear votes if isRevealed = true", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setCardsRevealed("abc123", true);

      // Then
      const batchWriteCommand = vi.mocked(service.client.send).mock.calls[0][0];
      const userUpdateRequest = (
        batchWriteCommand.input as BatchWriteCommandInput
      ).RequestItems?.[tableName]?.find(
        (requestItem) => requestItem?.PutRequest?.Item?.SK?.startsWith("USER:"),
      );
      expect(userUpdateRequest?.PutRequest?.Item?.vote).not.toBe("");
    });
  });
  describe("setValidSizes", () => {
    it("Updates the validSizes field on the ROOM item", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.setValidSizes("abc123", "XS S M L XL");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("ROOM");
      expect(updateCommand.input.UpdateExpression).toContain("validSizes");
    });
  });
  describe("leave", () => {
    it("Updates a USER by setting 'username' to ''", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain("username");
      expect(updateCommand.input.ExpressionAttributeValues?.[":username"]).toBe(
        "",
      );
    });
    it("Clears the user's vote", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain("vote");
      expect(updateCommand.input.ExpressionAttributeValues?.[":vote"]).toBe("");
    });
    it("Does not remove the connectionId", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.leave("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).not.toContain(
        "REMOVE connectionId",
      );
    });
  });
  describe("kickUser", () => {
    it("Kicks a USER by setting 'username' to ''", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain("username");
      expect(updateCommand.input.ExpressionAttributeValues?.[":username"]).toBe(
        "",
      );
    });
    it("Clears the user's vote", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain("vote");
      expect(updateCommand.input.ExpressionAttributeValues?.[":vote"]).toBe("");
    });
    it("Removes the connectionId", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.kickUser("roomId", "userKey");

      // Then
      const updateCommand = vi.mocked(service.client.send).mock
        .calls[0][0] as UpdateCommand;
      expect(updateCommand.input.Key?.SK).toBe("USER:userKey");
      expect(updateCommand.input.UpdateExpression).toContain(
        "REMOVE connectionId",
      );
    });
  });
  describe("deleteUser", () => {
    it("Deletes a USER item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteUser("roomId", "userKey");

      // Then
      expect(vi.mocked(service.client.send).mock.calls[0][0]).toBeInstanceOf(
        DeleteCommand,
      );
    });
  });
  describe("deleteRoom", () => {
    it("Deletes a ROOM item from the table", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteRoom("abc123");

      // Then
      expect(vi.mocked(service.client.send).mock.calls[1][0]).toBeInstanceOf(
        BatchWriteCommand,
      );
    });
  });
  describe("deleteUsersRooms", () => {
    it("Deletes users older than a month ago", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteStaleUsers();

      // Then
      expect(vi.mocked(service.client.send).mock.calls[1][0]).toBeInstanceOf(
        DeleteCommand,
      );
    });
  });
  describe("deleteStaleRooms", () => {
    it("Deletes rooms older than a month ago", async () => {
      // Given
      const service = new DbService(tableName);

      // When
      await service.deleteStaleRooms();

      // Then
      expect(vi.mocked(service.client.send).mock.calls[2][0]).toBeInstanceOf(
        BatchWriteCommand,
      );
    });
  });
});
