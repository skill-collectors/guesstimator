import { describe, it, expect } from "vitest";
import { PathParser } from "../../../../lib/lambda/rest/PathParser";

describe("PathParser", () => {
  function testMatch(
    pattern: string,
    path: string,
    expectedParams: Record<string, string> | null,
  ) {
    // When
    const params = new PathParser(pattern).match(path);

    // Then
    expect(params).toEqual(expectedParams);
  }
  it("returns null on no match", () => {
    testMatch("/static", "/nomatch", null);
  });
  it("matches a static path", () => {
    testMatch("/static", "/static", {});
  });
  it("matches params", () => {
    testMatch("/foo/:foo/bar/:bar", "/foo/123/bar/abc", {
      foo: "123",
      bar: "abc",
    });
  });
  it("matches when missing final param", () => {
    testMatch("/foo/:foo", "/foo", {});
  });
});
