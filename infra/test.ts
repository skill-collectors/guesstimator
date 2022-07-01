import * as pulumi from "@pulumi/pulumi";
import { describe, it, expect, beforeAll } from "vitest";
import * as aws from "@pulumi/aws";

pulumi.runtime.setMocks({
  newResource: function (args: pulumi.runtime.MockResourceArgs): {
    id: string;
    // This is the declared type upstream: https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/runtime/#Mocks-newResource
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: Record<string, any>;
  } {
    return {
      id: `${args.name}_id`,
      state: args.inputs,
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe("infrastructure", () => {
  let infra: typeof import("./index");

  beforeAll(async function () {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import("./index");
  });

  it("creates an S3 bucket", async () => {
    const bucketName = await new Promise((resolve) => {
      infra?.bucketName?.apply((bucketName) => resolve(bucketName));
    });
    expect(bucketName).toBe("siteBucket_id");
  });
  it("creates a CloudFront Distribution", async () => {
    const distributionId = await new Promise((resolve) => {
      infra?.distributionId?.apply((distributionId) => resolve(distributionId));
    });
    expect(distributionId).toBe("cdn_id");
  });
  it("Creates custom error responses for 400 and 403 errors", async () => {
    const customErrorResponses:
      | aws.types.output.cloudfront.DistributionCustomErrorResponse[]
      | undefined = await new Promise((resolve) => {
      infra?.cdn?.customErrorResponses.apply((responses) => resolve(responses));
    });
    expect(customErrorResponses?.map((response) => response.errorCode)).toEqual(
      [400, 403]
    );
  });

  it("Creates a DynamoDB table", async () => {
    const tableId = await new Promise((resolve) => {
      infra?.dbTable?.id.apply((id) => resolve(id));
    });
    expect(tableId).toBe("table_id");
  });
});
