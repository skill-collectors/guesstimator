import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { describe, it, expect, beforeAll, vi } from "vitest";
import Api from "../../lib/Api";
import Database from "../../lib/Database";

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
        url: "https://raw.apigatewayurl.com",
        value: "API_KEY", // for the key
      },
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe("infrastructure", () => {
  beforeAll(async function () {
    vi.mock("../../lib/lambda/Main", () => {
      const mockHandler = function () {
        return async function handleDocument(
          event: APIGatewayProxyEvent
        ): Promise<APIGatewayProxyResult> {
          console.log(JSON.stringify(event));
          return {
            statusCode: 200,
            body: "Test",
          };
        };
      };
      return { createRouter: mockHandler };
    });
  });

  function buildApi(
    apexDomain: string | null = "example.com",
    subDomain = "www"
  ) {
    return new Api("GuesstimatorApi", {
      database: {
        table: {
          arn: pulumi.Output.create("tableArn"),
          name: pulumi.Output.create("tableName"),
        },
      } as unknown as Database,
      apexDomain,
      subDomain,
    });
  }

  it("Creates an API url", async () => {
    const api = buildApi();
    const apiUrl = await new Promise((resolve) => {
      api.url.apply((url) => resolve(url));
    });
    expect(apiUrl).toBe("https://www.example.com");
  });
  it("Skips base path mapping if apexDomain is null", async () => {
    const api = buildApi(null);
    const apiUrl = await new Promise((resolve) => {
      api.url.apply((url) => resolve(url));
    });
    expect(apiUrl).toBe("https://raw.apigatewayurl.com");
  });

  it("Creates an API key", async () => {
    const api = buildApi();
    const apiKey = await new Promise((resolve) => {
      api.apiKey.apply((key) => resolve(key));
    });
    expect(apiKey).toBe("API_KEY");
  });
});
