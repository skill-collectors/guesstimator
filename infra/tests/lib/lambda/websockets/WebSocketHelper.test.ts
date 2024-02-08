import { afterEach, describe, it, vi, expect } from "vitest";
import { stubWebSocketEvent } from "../Stubs";
import {
  WebSocketMessage,
  WebSocketPublisher,
} from "../../../../lib/lambda/websockets/WebSocketHelper";
import {
  ApiGatewayManagementApi,
  GoneException,
} from "@aws-sdk/client-apigatewaymanagementapi";

describe("WebSocket Main function", () => {
  vi.mock("@aws-sdk/client-apigatewaymanagementapi", async () => {
    const actual = await vi.importActual(
      "@aws-sdk/client-apigatewaymanagementapi",
    );
    const ApiGatewayManagementApi = vi.fn();
    ApiGatewayManagementApi.prototype.postToConnection = vi.fn();
    return {
      ...actual,
      ApiGatewayManagementApi,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("WebSocketPublisher", () => {
    describe("sendMessage", () => {
      it("Handles GoneException", async () => {
        // Given
        const event = stubWebSocketEvent({});
        const helper = new WebSocketPublisher(event);
        const connectionId = "connectionId";
        const webSocketMessage: WebSocketMessage = {
          status: 200,
        };
        vi.mocked(
          ApiGatewayManagementApi.prototype.postToConnection,
        ).mockRejectedValue(
          new GoneException({
            $metadata: {
              httpStatusCode: 410,
              requestId: "xxx-xxx-xxx-xxx-xxx",
              attempts: 1,
              totalRetryDelay: 0,
            },
            message: "UnknownError",
          }),
        );

        // Then
        expect(() =>
          helper.sendMessage(connectionId, webSocketMessage),
        ).rejects.toThrow(connectionId);
      });
    });
  });
});
