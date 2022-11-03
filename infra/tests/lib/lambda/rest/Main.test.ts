import * as pulumi from "@pulumi/pulumi";
import { describe, expect, it, vi } from "vitest";
import { createRouter } from "../../../../lib/lambda/rest/Main";
import { stubEvent } from "../Stubs";

describe("Main", () => {
  it("Responsd to health check", async () => {
    // Given
    const tableName = pulumi.Output.create("TableName");
    vi.spyOn(tableName, "get").mockImplementation(() => "TableName");

    const event = stubEvent("GET", "/status");
    const main = createRouter(tableName);

    // When
    const result = await main(event);

    // Then
    expect(JSON.parse(result.body).status).toBe("UP");
  });
  it("Generates and returns an errorId on unexpected Errors", async () => {
    // Given
    const tableName = pulumi.Output.create("TableName");
    vi.spyOn(tableName, "get").mockImplementation(() => {
      throw new Error("Boom!");
    });

    const event = stubEvent("GET", "/status");
    const main = createRouter(tableName);

    // When
    const result = await main(event);

    // Then
    expect(JSON.parse(result.body).errorId).toBeTruthy();
  });
});
