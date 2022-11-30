import { describe, it, expect, vi, afterEach } from "vitest";
import { caseInsensitiveHeaders } from "../../../../lib/lambda/rest/CaseInsensitiveHeadersPlugin";
import { stubEvent } from "../Stubs";

describe("CorsPlugin", () => {
  const stubHandler = vi.fn();
  const plugin = caseInsensitiveHeaders();
  const handler = plugin.applyTo(stubHandler);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Forces all headers to lowercase", async () => {
    // Given
    const event = stubEvent("OPTIONS", "/", "", {
      Origin: "http://localhost",
    });

    // When
    await handler(event);
    const transformedEvent = stubHandler.mock.calls[0][0];

    // Then
    expect(transformedEvent.headers.origin).toBeTruthy();
  });
});
