import { describe, expect, it, vi } from "vitest";
import { Pager } from "../../../lib/lambda/Pager";

describe("Pager", () => {
  it("Handles a single item", async () => {
    // Given
    const items = {
      Items: [{ PK: "123", SK: "abc" }],
    };
    const params = {};
    const supplier = async () => items;
    const consumer = vi.fn().mockResolvedValueOnce(true);

    // When
    await new Pager(supplier, params, consumer).run();

    // Then
    expect(consumer).toHaveBeenCalledOnce();
  });
  it("Handles multiple pages equal to batch size", async () => {
    // Given
    const batchSize = 2;
    const batch1 = {
      Items: [
        { PK: "123", SK: "a" },
        { PK: "123", SK: "b" },
      ],
      LastEvaluatedKey: { PK: "123", SK: "b" },
    };
    const batch2 = {
      Items: [{ PK: "123", SK: "c" }],
    };
    const params = {};
    const supplier = vi
      .fn()
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2);
    const consumer = vi.fn().mockResolvedValueOnce(true);

    // When
    await new Pager(supplier, params, consumer, batchSize).run();

    // Then
    expect(supplier).toHaveBeenCalledTimes(2);
    expect(consumer).toHaveBeenCalledTimes(2);
  });
  it("Handles a page larger than batch size", async () => {
    // Given
    const batchSize = 2;
    const batch1 = {
      Items: [
        { PK: "123", SK: "a" },
        { PK: "123", SK: "b" },
        { PK: "123", SK: "c" },
      ],
    };
    const params = {};
    const supplier = vi.fn().mockResolvedValueOnce(batch1);
    const consumer = vi.fn().mockResolvedValueOnce(true);

    // When
    await new Pager(supplier, params, consumer, batchSize).run();

    // Then
    expect(supplier).toHaveBeenCalledTimes(1);
    expect(consumer).toHaveBeenCalledTimes(2);
  });
  it("Handles multiple pages smaller than batch size", async () => {
    // Given
    const batchSize = 2;
    const batch1 = {
      Items: [{ PK: "123", SK: "a" }],
      LastEvaluatedKey: { PK: "123", SK: "a" },
    };
    const batch2 = {
      Items: [{ PK: "123", SK: "b" }],
      LastEvaluatedKey: { PK: "123", SK: "b" },
    };
    const batch3 = {
      Items: [{ PK: "123", SK: "c" }],
    };
    const params = {};
    const supplier = vi
      .fn()
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2)
      .mockResolvedValueOnce(batch3);
    const consumer = vi.fn().mockResolvedValueOnce(true);

    // When
    await new Pager(supplier, params, consumer, batchSize).run();

    // Then
    expect(supplier).toHaveBeenCalledTimes(3);
    expect(consumer).toHaveBeenCalledTimes(2);
  });
  it("Handles empty last page", async () => {
    // Given
    const batchSize = 2;
    const batch1 = {
      Items: [{ PK: "123", SK: "a" }],
      LastEvaluatedKey: { PK: "123", SK: "a" },
    };
    const batch2 = {
      Items: [],
    };
    const params = {};
    const supplier = vi
      .fn()
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2);
    const consumer = vi.fn().mockResolvedValueOnce(true);

    // When
    await new Pager(supplier, params, consumer, batchSize).run();

    // Then
    expect(supplier).toHaveBeenCalledTimes(2);
    expect(consumer).toHaveBeenCalledTimes(1);
  });
});
