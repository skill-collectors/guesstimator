import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DbService from "../../../../lib/lambda/DbService";
import { initRouter } from "../../../../lib/lambda/rest/Router";
import { stubEvent } from "../Stubs";

describe("Router", () => {
  const stubRoom = {
    roomId: "123",
    validSizes: ["1", "2", "3"],
    isRevealed: false,
    hostKey: "AB12",
    users: [{ userKey: "ghi", username: "alice", userId: "jkl", vote: "" }],
  };

  vi.mock("../../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.createRoom = vi.fn();
    DbService.prototype.getRoom = vi.fn();
    DbService.prototype.getRoomMetadata = vi.fn();
    DbService.prototype.addUser = vi.fn();
    DbService.prototype.deleteRoom = vi.fn();
    DbService.prototype.setCardsRevealed = vi.fn();
    DbService.prototype.setVote = vi.fn();
    return { default: DbService };
  });

  let mockDbService: DbService;

  beforeEach(() => {
    mockDbService = new DbService("TableName");
    vi.mocked(mockDbService.getRoom).mockResolvedValue(stubRoom);
    vi.mocked(mockDbService.getRoomMetadata).mockResolvedValue({
      roomId: stubRoom.roomId,
      hostKey: stubRoom.hostKey,
      isRevealed: stubRoom.isRevealed,
      validSizes: stubRoom.validSizes.join(" "),
    });
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
      // When
      const result = await router.run(event);
      const body = JSON.parse(result.body);

      // Then
      expect(body.roomId).toEqual(stubRoom.roomId);
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
        username: "alice",
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

  describe("DELETE /rooms/:id", () => {
    it("deletes the room", async () => {
      // Given
      const event = stubEvent(
        "DELETE",
        "/rooms/123",
        JSON.stringify({ hostKey: stubRoom.hostKey })
      );

      // When
      await router.run(event);

      // Then
      expect(mockDbService.deleteRoom).toHaveBeenCalled();
    });
    it("rejects invalid hostKey", async () => {
      // Given
      const event = stubEvent(
        "DELETE",
        "/rooms/123",
        JSON.stringify({ hostKey: "WRONG" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
  });

  describe("POST /rooms/:id/vote", () => {
    it("updates the user row", async () => {
      // Given
      const event = stubEvent(
        "POST",
        "/rooms/123/votes",
        JSON.stringify({ userKey: "ghi", vote: "1" })
      );

      // When
      await router.run(event);

      // Then
      expect(mockDbService.setVote).toHaveBeenCalled();
    });
    it("rejects missing userKey", async () => {
      // Given
      const event = stubEvent(
        "POST",
        "/rooms/123/votes",
        JSON.stringify({ vote: "1" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("rejects missing vote", async () => {
      // Given
      const event = stubEvent(
        "POST",
        "/rooms/123/votes",
        JSON.stringify({ userKey: "ghi" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("rejects invalid vote", async () => {
      // Given
      const event = stubEvent(
        "POST",
        "/rooms/123/votes",
        JSON.stringify({ userKey: "ghi", vote: "foo" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
  });

  describe("PUT /rooms/:id/isRevealed", () => {
    it("updates the room", async () => {
      // Given
      const event = stubEvent(
        "PUT",
        "/rooms/123/isRevealed",
        JSON.stringify({ value: true, hostKey: stubRoom.hostKey })
      );

      // When
      await router.run(event);

      // Then
      expect(mockDbService.setCardsRevealed).toHaveBeenCalled();
    });
    it("rejects missing value", async () => {
      // Given
      const event = stubEvent(
        "PUT",
        "/rooms/123/isRevealed",
        JSON.stringify({ hostKey: stubRoom.hostKey })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("rejects invalid hostKey", async () => {
      // Given
      const event = stubEvent(
        "PUT",
        "/rooms/123/isRevealed",
        JSON.stringify({ value: true, hostKey: "WRONG" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
    it("rejects non-boolean value", async () => {
      // Given
      const event = stubEvent(
        "PUT",
        "/rooms/123/isRevealed",
        JSON.stringify({ value: "not a boolean" })
      );

      // When
      const result = await router.run(event);

      // Then
      expect(result.statusCode).toBe(400);
    });
  });
});
