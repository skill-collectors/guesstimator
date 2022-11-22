import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DbService from "../../../../lib/lambda/DbService";
import { initRouter } from "../../../../lib/lambda/rest/Router";
import { stubEvent } from "../Stubs";

describe("Router", () => {
  vi.mock("../../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.createRoom = vi.fn();
    DbService.prototype.getRoom = vi.fn();
    DbService.prototype.addUser = vi.fn();
    DbService.prototype.deleteRoom = vi.fn();
    return { default: DbService };
  });

  let mockDbService: DbService;

  beforeEach(() => {
    mockDbService = new DbService("TableName");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const router = initRouter("TableName");

  describe("POST /rooms", () => {
    const event = stubEvent("POST", "/rooms");

    it("creates a room", async () => {
      // When
      await router.run(event);

      // Then
      expect(mockDbService.createRoom).toHaveBeenCalled();
    });

    it("returns 200", async () => {
      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(200);
    });
  });

  describe("GET /room/:id", () => {
    const event = stubEvent("GET", "/rooms/123");

    it("returns a room", async () => {
      // Given
      const room = {
        roomId: "123",
        validSizes: "1 2 3",
        isRevealed: false,
      };
      vi.mocked(mockDbService.getRoom).mockResolvedValueOnce(room);

      // When
      const result = await router.run(event);

      // Then
      expect(result.body).toEqual(JSON.stringify(room));
    });

    it("returns a 404 if no room found", async () => {
      // Given
      vi.mocked(mockDbService.getRoom).mockResolvedValueOnce(null);

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(404);
    });
  });

  describe("POST /rooms/:id/users", () => {
    const event = stubEvent(
      "POST",
      "/rooms/123/users",
      JSON.stringify({ name: "alice" })
    );

    it("Adds the user", async () => {
      // When
      await router.run(event);

      // Then
      expect(mockDbService.addUser).toHaveBeenCalled();
    });
    it("Returns a user key", async () => {
      // Given
      vi.mocked(mockDbService.addUser).mockResolvedValueOnce({
        roomId: "123",
        userKey: "abc",
      });

      // When
      const result = await router.run(event);
      const body = JSON.parse(result.body);

      // Then
      expect(body.userKey).toBeTruthy();
    });
    it("Rejects missing name", async () => {
      // Given
      const badEvent = stubEvent(
        "POST",
        "/rooms/123/users",
        JSON.stringify({})
      );

      // When
      const result = await router.run(badEvent);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("Rejects name over 50 characters", async () => {
      // Given
      const badEvent = stubEvent(
        "POST",
        "/rooms/123/users",
        JSON.stringify({
          name: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        })
      );

      // When
      const result = await router.run(badEvent);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("Returns a 404 if the room doesn't exist", async () => {
      // Given
      vi.mocked(mockDbService.addUser).mockResolvedValueOnce(null);

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(404);
    });
  });

  describe("DELETE /room/:id", () => {
    const event = stubEvent("DELETE", "/rooms/123");

    it("deletes the room", async () => {
      // When
      await router.run(event);

      // Then
      expect(mockDbService.deleteRoom).toHaveBeenCalled();
    });
  });
});
