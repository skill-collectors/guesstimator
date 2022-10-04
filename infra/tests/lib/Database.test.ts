import * as pulumi from "@pulumi/pulumi";
import { describe, it, expect, beforeAll } from "vitest";
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
      state: args.inputs,
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe("infrastructure", () => {
  let theDb: Database;

  beforeAll(async function () {
    theDb = new Database("AgilePokerDatabase", { tags: {} });
  });

  it("Creates a DynamoDB table", async () => {
    const tableId = await new Promise((resolve) => {
      theDb.table.id.apply((id) => resolve(id));
    });
    expect(tableId).toBe("AgilePokerDatabase-TableId");
  });
});
