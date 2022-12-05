import * as pulumi from "@pulumi/pulumi";
import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { describe, it, expect, beforeAll, vi } from "vitest";
import Database from "../../lib/Database";
import WebSocketApi from "../../lib/WebSocketApi";

pulumi.runtime.setMocks({
  newResource: function (args: pulumi.runtime.MockResourceArgs): {
    id: string;
    // This is the declared type upstream: https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/runtime/#Mocks-newResource
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: Record<string, any>;
  } {
    return {
      id: `${args.name}Id`,
      state: {
        invokeUrl: "wss://example.com",
      },
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe("infrastructure", () => {
  beforeAll(async function () {
    vi.mock("../../lib/lambda/websockets/Main", () => {
      const mockHandler = function () {
        return async function (
          event: APIGatewayProxyWebsocketEventV2
        ): Promise<APIGatewayProxyResultV2> {
          console.log(JSON.stringify(event));
          return {
            statusCode: 200,
            body: "Test",
          };
        };
      };
      return { createMainWebSocketFunction: mockHandler };
    });
  });

  function buildApi() {
    return new WebSocketApi("GuesstimatorWebSocketApi", {
      database: {
        table: {
          arn: pulumi.Output.create("tableArn"),
          name: pulumi.Output.create("tableName"),
        },
      } as unknown as Database,
    });
  }

  it("Exports an invoke url", async () => {
    const api = buildApi();
    const invokeUrl = await new Promise((resolve) => {
      api.invokeUrl.apply((url) => resolve(url));
    });
    expect(invokeUrl).toBe("wss://example.com");
  });
});
