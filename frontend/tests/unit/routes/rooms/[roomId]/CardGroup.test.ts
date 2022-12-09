import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import CardGroup from "src/routes/rooms/[roomId]/CardGroup.svelte";
import type { Room } from "$lib/services/rooms";

describe("CardGroup", () => {
  it("Renders a card for users with a username", () => {
    const roomData: Room = {
      roomId: "roomId",
      hostKey: undefined,
      validSizes: ["1", "2", "3"],
      isRevealed: false,
      users: [
        {
          userId: "userId",
          userKey: undefined,
          username: "username",
          hasVote: false,
          vote: "",
        },
      ],
    };
    const { getByText } = render(CardGroup, { roomData });

    expect(() => getByText(roomData.users[0].username)).not.toThrow();
  });
  it("Does not renders a card for users with no username", () => {
    const roomData: Room = {
      roomId: "roomId",
      hostKey: undefined,
      validSizes: ["1", "2", "3"],
      isRevealed: false,
      users: [
        {
          userId: "userId",
          userKey: undefined,
          username: "",
          hasVote: false,
          vote: "",
        },
      ],
    };
    const { getByText } = render(CardGroup, { roomData });

    expect(() => getByText(roomData.users[0].username)).toThrow();
  });
});
