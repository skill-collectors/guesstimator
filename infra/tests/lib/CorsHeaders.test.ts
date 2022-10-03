import { describe, it, expect } from "vitest";
import { APIGatewayProxyEvent } from "aws-lambda";
import { corsAllowApp } from "../../lib/CorsHeaders";

describe("CorsHeaders", () => {
  function eventForOrigin(origin: string): APIGatewayProxyEvent {
    return {
      httpMethod: "POST",
      path: "/some/url",
      headers: {
        origin,
      },
    } as unknown as APIGatewayProxyEvent;
  }

  it("allows prod", async () => {
    // Given
    const event = eventForOrigin("https://agile-poker-prod.superfun.link");

    // When
    const headers = corsAllowApp(event);

    // Then
    expect(headers["Access-Control-Allow-Methods"]).toBe(
      "OPTIONS, GET, POST, PUT, DELETE"
    );
    expect(headers["Access-Control-Allow-Origin"]).toBe(event.headers.origin);
  });
  it("allows localhost", async () => {
    // Given
    const event = eventForOrigin("http://localhost:5173");

    // When
    const headers = corsAllowApp(event);

    // Then
    expect(headers["Access-Control-Allow-Origin"]).toBe(event.headers.origin);
  });

  it("denies bogus domains", async () => {
    // Given
    const event = eventForOrigin("http://example.com");

    // When
    const headers = corsAllowApp(event);

    // Then
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
