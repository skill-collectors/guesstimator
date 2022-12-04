import * as pulumi from "@pulumi/pulumi";
import { describe, expect, it, vi } from "vitest";
import { createMainRestFunction } from "../../../../lib/lambda/rest/Main";
import { stubEvent } from "../Stubs";

describe("Main", () => {
  it("Responsd to health check", async () => {
    // Given
    const tableName = pulumi.Output.create("TableName");
    vi.spyOn(tableName, "get").mockImplementation(() => "TableName");

    const event = stubEvent({ httpMethod: "GET", path: "/status" });
    const main = createMainRestFunction(tableName);

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

    const event = stubEvent({ httpMethod: "GET", path: "/status" });
    const main = createMainRestFunction(tableName);

    // When
    const result = await main(event);

    // Then
    expect(JSON.parse(result.body).errorId).toBeTruthy();
  });
});
