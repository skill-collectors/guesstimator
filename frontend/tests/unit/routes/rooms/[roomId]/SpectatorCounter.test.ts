import type { Room, User } from "$lib/services/rooms";
import { render } from "@testing-library/svelte";
import SpectatorCounter from "$routes/rooms/[roomId]/SpectatorCounter.svelte";
import { describe, it } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

function stubRoom(users: Partial<User>[]): Room {
  return {
    users,
  } as Room;
}

describe("SpectatorCounter", () => {
  it("Only counts users without a usernames", () => {
    // Given
    const roomData = stubRoom([
      { username: "" },
      { username: "" },
      { username: "not empty" },
    ]);

    // When
    const { container } = render(SpectatorCounter, { roomData });

    expect(container).toHaveTextContent("There are 2 spectators");
  });
  it("Handles 1 as a special case", () => {
    // Given
    const roomData = stubRoom([{ username: "" }]);

    // When
    const { container } = render(SpectatorCounter, { roomData });

    expect(container).toHaveTextContent("There is 1 spectator");
  });
  it("Handles 0 as a special case", () => {
    // Given
    const roomData = stubRoom([]);

    // When
    const { container } = render(SpectatorCounter, { roomData });

    expect(container).toHaveTextContent("There are no spectators");
  });
});
