import { render } from "@testing-library/svelte";
import RoomHeader from "$routes/rooms/[roomId]/RoomHeader.svelte";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

describe("RoomHeader", () => {
  it("Displays the room URL", () => {
    // Given
    const url = new URL("https://example.com");

    // When
    const { getByRole } = render(RoomHeader, { url, isHost: false });

    // Then
    console.log(url.hostname);
    const el = getByRole("banner");
    expect(el).toHaveTextContent(url.toString());
  });
});
