import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DbService } from "../../../../lib/lambda/DbService";
import { initRouter } from "../../../../lib/lambda/rest/Router";
import { stubEvent } from "../Stubs";

describe("Router", () => {
  const stubRoom = {
    roomId: "123",
    validSizes: ["1", "2", "3"],
    isRevealed: false,
    hostKey: "AB12",
    users: [
      {
        userKey: "ghi",
        username: "alice",
        userId: "jkl",
        hasVote: false,
        vote: "",
      },
    ],
  };

  vi.mock("../../../../lib/lambda/DbService", () => {
    const DbService = vi.fn();
    DbService.prototype.createRoom = vi.fn();
    DbService.prototype.getRoomMetadata = vi.fn();
    DbService.prototype.deleteRoom = vi.fn();
    return { DbService };
  });

  let mockDbService: DbService;

  beforeEach(() => {
    mockDbService = new DbService("TableName");
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
});
