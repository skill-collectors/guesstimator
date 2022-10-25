import { describe, test, expect } from "vitest";
import { capitalize } from "../../lib/utils/StringUtils";

describe("StringUtils", () => {
  describe("capitalize", () => {
    const runTest = function (input: string, expectedOutput: string) {
      // When
      const output = capitalize(input);

      // Then
      expect(output).toEqual(expectedOutput);
    };
    test("word -> Word", () => runTest("word", "Word"));
    test("Word -> Word", () => runTest("Word", "Word"));
    test("two words -> Two words", () => runTest("Word", "Word"));
    test("w -> W", () => runTest("w", "W"));
    test("'' -> ''", () => runTest("", ""));
  });
});
