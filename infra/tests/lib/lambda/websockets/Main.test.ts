import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockedObject,
  vi,
} from "vitest";
import { DbService } from "../../../../lib/lambda/DbService";
import { createMainWebSocketFunction } from "../../../../lib/lambda/websockets/Main";
import { WebSocketPublisher } from "../../../../lib/lambda/websockets/WebSocketHelper";
import { stubWebSocketEvent } from "../Stubs";
import { fail } from "assert";

describe("WebSocket Main function", () => {
  vi.mock("../../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.getRoomMetadata = vi.fn();
    DbService.prototype.getRoom = vi.fn();
    DbService.prototype.subscribe = vi.fn();
    DbService.prototype.join = vi.fn();
    DbService.prototype.vote = vi.fn();
    DbService.prototype.setCardsRevealed = vi.fn();
    DbService.prototype.setValidSizes = vi.fn();
    DbService.prototype.kickUser = vi.fn();
    DbService.prototype.leave = vi.fn();
    DbService.prototype.reconnect = vi.fn();
    return { DbService };
  });
  vi.mock("../../../../lib/lambda/websockets/WebSocketHelper", () => {
    const WebSocketPublisher = vi.fn();
    WebSocketPublisher.prototype.sendError = vi.fn();
    WebSocketPublisher.prototype.publishRoomData = vi.fn();
    WebSocketPublisher.prototype.sendMessage = vi.fn();
    return { WebSocketPublisher };
  });

  let mockDbService: MockedObject<DbService>;
  let mockWebSocketPublisher: MockedObject<WebSocketPublisher>;

  beforeEach(() => {
    mockDbService = vi.mocked(new DbService("TableName"));
    mockWebSocketPublisher = vi.mocked(
      new WebSocketPublisher(stubWebSocketEvent({})),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const tableNameOutput = pulumi.Output.create("tableName");
  vi.spyOn(tableNameOutput, "get").mockImplementation(() => "TableName");
  const main = createMainWebSocketFunction(tableNameOutput);

  it("Handles connections", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$connect",
        eventType: "CONNECT",
      },
    });

    // When
    const result = await main(event);

    // Then
    expect(result.statusCode).toBe(200);
  });
  it("Handles disconnections", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$disconnect",
        eventType: "DISCONNECT",
      },
    });

    // When
    const result = await main(event);

    // Then
    expect(result.statusCode).toBe(200);
  });
  it("Fails if message with no body", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$default",
        eventType: "MESSAGE",
      },
    });

    // When
    await main(event);

    // Then
    expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(400);
  });
  it("Fails if no body.action value", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$default",
        eventType: "MESSAGE",
      },
      body: JSON.stringify({ data: "some data" }),
    });

    // When
    await main(event);

    // Then
    expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(400);
  });
  it("Fails if no body.data value", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$default",
        eventType: "MESSAGE",
      },
      body: JSON.stringify({ action: "some action" }),
    });

    // When
    await main(event);

    // Then
    expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(400);
  });
  it("Fails if no room found", async () => {
    // Given
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$default",
        eventType: "MESSAGE",
      },
      body: JSON.stringify({ action: "any", data: {} }),
    });

    // When
    await main(event);

    // Then
    expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(404);
  });
  it("Fails on unknown action", async () => {
    // Given
    const roomId = "roomId";
    const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
      requestContext: {
        routeKey: "$default",
        eventType: "MESSAGE",
      },
      body: JSON.stringify({ action: "WRONG", data: {} }),
    });
    mockDbService.getRoomMetadata.mockResolvedValue({ roomId });

    // When
    await main(event);

    // Then
    expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(400);
  });

  describe("ping", () => {
    it("Responds with 'pong'", async () => {
      // Given
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "ping",
          data: {},
        }),
      });

      // When
      const response = await main(event);

      // Then
      console.log(response);
      const message = mockWebSocketPublisher.sendMessage.mock.calls[0][1];
      if (message.data !== undefined && "type" in message.data) {
        expect(message.data.type).toEqual("PONG");
      } else {
        fail("Missing 'message.data.type' in PONG response");
      }
    });
    it("Reconnects user if possible", async () => {
      // Given
      const userKey = "abc123";

      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "ping",
          data: {
            userKey,
          },
        }),
      });
      mockDbService.getRoom.mockResolvedValue({
        roomId: "roomId",
        validSizes: ["1"],
        isRevealed: false,
        users: [{ userKey, userId: "123abc", hasVote: false }],
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.reconnect).toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    it("Subscribes and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "subscribe",
          data: { roomId },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId });
      mockWebSocketPublisher.publishRoomData.mockResolvedValue({
        goneUserKeys: [],
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.subscribe).toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("join", () => {
    it("Joins and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "join",
          data: { roomId },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId });

      // When
      await main(event);

      // Then
      expect(mockDbService.join).toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("vote", () => {
    it("Rejects invalid sizes", async () => {
      // Given
      const roomId = "roomId";
      const vote = "a";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "vote",
          data: { roomId, vote },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({
        roomId,
        validSizes: "1 2 3",
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.vote).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.sendError).toHaveBeenCalled();
    });
    it("Votes and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const vote = "1";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "vote",
          data: { roomId, vote },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({
        roomId,
        validSizes: "1 2 3",
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.vote).toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("setValidSizes", () => {
    it("Rejects invalid hostKey", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "setValidSizes",
          data: { roomId, hostKey: "WRONG" },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({
        roomId,
        hostKey: "hostKey",
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.setValidSizes).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(403);
    });
    it("Updates sizes, resets, and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const hostKey = "hostKey";
      const validSizes = "XS S M L XL";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "setValidSizes",
          data: { roomId, hostKey, validSizes },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId, hostKey });

      // When
      await main(event);

      // Then
      expect(mockDbService.setValidSizes).toHaveBeenCalled();
      expect(mockDbService.setCardsRevealed).toHaveBeenCalled();
      expect(mockDbService.setCardsRevealed.mock.calls[0][1]).toBe(false);
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("reveal", () => {
    it("Rejects invalid hostKey", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "reveal",
          data: { roomId, hostKey: "WRONG" },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({
        roomId,
        hostKey: "hostKey",
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.setCardsRevealed).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(403);
    });
    it("Reveals and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const hostKey = "hostKey";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "reveal",
          data: { roomId, hostKey },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId, hostKey });

      // When
      await main(event);

      // Then
      expect(mockDbService.setCardsRevealed).toHaveBeenCalled();
      expect(mockDbService.setCardsRevealed.mock.calls[0][1]).toBe(true);
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("reset", () => {
    it("Rejects invalid hostKey", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "reset",
          data: { roomId, hostKey: "WRONG" },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({
        roomId,
        hostKey: "hostKey",
      });

      // When
      await main(event);

      // Then
      expect(mockDbService.setCardsRevealed).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.publishRoomData).not.toHaveBeenCalled();
      expect(mockWebSocketPublisher.sendError.mock.calls[0][1]).toBe(403);
    });
    it("Resets and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const hostKey = "hostKey";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "reset",
          data: { roomId, hostKey },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId, hostKey });

      // When
      await main(event);

      // Then
      expect(mockDbService.setCardsRevealed).toHaveBeenCalled();
      expect(mockDbService.setCardsRevealed.mock.calls[0][1]).toBe(false);
      expect(mockWebSocketPublisher.publishRoomData).toHaveBeenCalled();
    });
  });
  describe("leave", () => {
    it("Calls leave to remove the user", async () => {
      // Given
      const roomId = "roomId";
      const userKey = "userKey";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "leave",
          data: { roomId, userKey },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId });

      // When
      await main(event);

      // Then
      expect(mockDbService.leave).toHaveBeenCalled();
    });
  });
});
