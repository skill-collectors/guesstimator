import * as pulumi from "@pulumi/pulumi";
import { describe, it, expect, beforeAll } from "vitest";
import * as aws from "@pulumi/aws";
import SvelteApp from "../../lib/SvelteApp";

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
  let theApp: SvelteApp;

  beforeAll(async function () {
    theApp = new SvelteApp("GuesstimatorApp", {
      subDomain: "www",
      apexDomain: "example.com",
      tags: {},
    });
  });

  it("creates an S3 bucket", async () => {
    const bucketName = await new Promise((resolve) => {
      theApp.siteBucket.id.apply((bucketName) => resolve(bucketName));
    });
    expect(bucketName).toBe("GuesstimatorApp-SiteBucketId");
  });

  it("creates a CloudFront Distribution", async () => {
    const distributionId = await new Promise((resolve) => {
      theApp.cdn.id.apply((distributionId) => resolve(distributionId));
    });
    expect(distributionId).toBe("GuesstimatorApp-CdnId");
  });

  it("Creates custom error responses for 400 and 403 errors", async () => {
    const customErrorResponses:
      | aws.types.output.cloudfront.DistributionCustomErrorResponse[]
      | undefined = await new Promise((resolve) => {
      theApp.cdn.customErrorResponses.apply((responses) => resolve(responses));
    });
    expect(customErrorResponses?.map((response) => response.errorCode)).toEqual(
      [400, 403]
    );
  });
});
