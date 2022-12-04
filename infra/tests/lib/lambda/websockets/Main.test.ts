import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  MockedObject,
  vi,
} from "vitest";
import { DbService } from "../../../../lib/lambda/DbService";
import { createMainWebSocketFunction } from "../../../../lib/lambda/websockets/Main";
import { WebSocketPublisher } from "../../../../lib/lambda/websockets/WebSocketHelper";
import { stubEvent, stubWebSocketEvent } from "../Stubs";

describe("WebSocket Main function", () => {
  vi.mock("../../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.getRoomMetadata = vi.fn();
    DbService.prototype.getRoom = vi.fn();
    DbService.prototype.subscribe = vi.fn();
    DbService.prototype.join = vi.fn();
    DbService.prototype.vote = vi.fn();
    DbService.prototype.setCardsRevealed = vi.fn();
    return { DbService };
  });
  vi.mock("../../../../lib/lambda/websockets/WebSocketHelper", () => {
    const WebSocketPublisher = vi.fn();
    WebSocketPublisher.prototype.sendError = vi.fn();
    WebSocketPublisher.prototype.publishRoomData = vi.fn();
    return { WebSocketPublisher };
  });

  let mockDbService: MockedObject<DbService>;
  let mockWebSocketPublisher: MockedObject<WebSocketPublisher>;

  beforeEach(() => {
    mockDbService = vi.mocked(new DbService("TableName"));
    mockWebSocketPublisher = vi.mocked(
      new WebSocketPublisher(stubWebSocketEvent({}))
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
    it("Votes and publishes update", async () => {
      // Given
      const roomId = "roomId";
      const event: APIGatewayProxyWebsocketEventV2 = stubWebSocketEvent({
        requestContext: {
          routeKey: "$default",
          eventType: "MESSAGE",
        },
        body: JSON.stringify({
          action: "vote",
          data: { roomId },
        }),
      });
      mockDbService.getRoomMetadata.mockResolvedValue({ roomId });

      // When
      await main(event);

      // Then
      expect(mockDbService.vote).toHaveBeenCalled();
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
});
