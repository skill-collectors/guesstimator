import { describe, it, expect } from "vitest";
import { corsRules } from "../../../../lib/lambda/rest/CorsPlugin";
import { ok } from "../../../../lib/lambda/rest/Response";
import { stubEvent } from "../Stubs";

describe("CorsPlugin", () => {
  const stubHandler = async () => ok("");
  const corsPlugin = corsRules({
    allowedOrigins: ["http://localhost", "https://guesstimator.superfun.link"],
    allowedHeaders: ["x-api-key"],
    allowedMethods: ["GET", "POST"],
  });
  const corsHandler = corsPlugin.applyTo(stubHandler);

  it("Handles CORS preflight requests", async () => {
    // Given
    const event = stubEvent("OPTIONS", "/", "", {
      Origin: "http://localhost",
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["Access-Control-Allow-Origin"]).toBe(
      event.headers.Origin
    );
  });

  it("Allows expected origins", async () => {
    // Given
    const event = stubEvent("GET", "/", "", {
      Origin: "http://localhost",
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["Access-Control-Allow-Origin"]).toBe(
      event.headers.Origin
    );
  });
  it("Rejects unexpected origins", async () => {
    // Given
    const event = stubEvent("GET", "/", "", {
      Origin: "http://example.com",
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
  });
  it("Allows the specified methods", async () => {
    // Given
    const event = stubEvent("GET", "/", "", {
      Origin: "http://localhost",
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(
      result.multiValueHeaders?.["Access-Control-Allow-Methods"]
    ).toContain("GET");
  });
  it("Allows the specified headers", async () => {
    // Given
    const event = stubEvent("GET", "/", "", {
      Origin: "http://localhost",
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(
      result.multiValueHeaders?.["Access-Control-Allow-Headers"]
    ).toContain("x-api-key");
  });
});
