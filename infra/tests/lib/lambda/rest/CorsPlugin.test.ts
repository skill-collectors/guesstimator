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
    const event = stubEvent({
      httpMethod: "OPTIONS",
      headers: {
        origin: "http://localhost",
      },
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["access-control-allow-origin"]).toBe(
      event.headers.origin
    );
  });

  it("Allows expected origins", async () => {
    // Given
    const event = stubEvent({
      httpMethod: "GET",
      headers: {
        origin: "http://localhost",
      },
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["access-control-allow-origin"]).toBe(
      event.headers.origin
    );
  });
  it("Rejects unexpected origins", async () => {
    // Given
    const event = stubEvent({
      httpMethod: "GET",
      headers: {
        origin: "http://example.com",
      },
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(result.headers?.["access-control-allow-origin"]).toBeUndefined();
  });
  it("Allows the specified methods", async () => {
    // Given
    const event = stubEvent({
      httpMethod: "GET",
      headers: {
        origin: "http://localhost",
      },
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(
      result.multiValueHeaders?.["access-control-allow-methods"]
    ).toContain("GET");
  });
  it("Allows the specified headers", async () => {
    // Given
    const event = stubEvent({
      httpMethod: "GET",
      headers: {
        origin: "http://localhost",
      },
    });

    // When
    const result = await corsHandler(event);

    // Then
    expect(
      result.multiValueHeaders?.["access-control-allow-headers"]
    ).toContain("x-api-key");
  });
});
