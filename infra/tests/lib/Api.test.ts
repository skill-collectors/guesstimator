import * as pulumi from "@pulumi/pulumi";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
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
        value: "API_KEY",
      },
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe("infrastructure", () => {
  let theApi: Api;

  beforeAll(async function () {
    theApi = new Api("AgilePokerDatabase", {
      database: {
        table: {
          arn: pulumi.Output.create("foo"),
          name: pulumi.Output.create("bar"),
        },
      } as unknown as Database,
      apexDomain: "example.com",
      subDomain: "www",
      tags: {},
    });
  });

  beforeEach(() => {
    vi.mock("../../lib/lambda/Router", () => {
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

  it("Creates an API url", async () => {
    expect(theApi.url).toBe("https://www.example.com");
  });

  it("Creates an API key", async () => {
    const apiKey = await new Promise((resolve) => {
      theApi.apiKey.apply((key) => resolve(key));
    });
    expect(apiKey).toBe("API_KEY");
  });
});
