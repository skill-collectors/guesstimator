import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import HostControls from "$routes/rooms/[roomId]/HostControls.svelte";
import userEvent from "@testing-library/user-event";
import type { Room } from "$lib/services/rooms";

function stubRoom(isRevealed = false, users = [{ username: "host" }]): Room {
  return {
    isRevealed,
    users,
  } as Room;
}
describe("HostControls", () => {
  it("Renders 'reveal' button if cards are not revealed", () => {
    const roomData = stubRoom();
    const { getByText } = render(HostControls, { roomData });

    expect(() => getByText("Reveal cards")).not.toThrow();
  });
  it("Hides button when reveal clicked", async () => {
    const user = userEvent.setup();
    const roomData = stubRoom();
    const { getByText } = render(HostControls, { roomData });

    await user.click(getByText("Reveal cards"));
    expect(() => getByText("Reveal cards")).toThrow();
  });
  it("Renders 'reset' button if cards are not revealed", () => {
    const roomData = stubRoom(true);
    const { getByText } = render(HostControls, { roomData });

    expect(() => getByText("Reset")).not.toThrow();
  });
  it("Hides button when reset clicked", async () => {
    const user = userEvent.setup();
    const roomData = stubRoom(true);
    const { getByText } = render(HostControls, { roomData });

    await user.click(getByText("Reset"));
    expect(() => getByText("Reset")).toThrow();
  });
});
