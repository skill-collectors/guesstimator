import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import BottomHostControls from "$routes/rooms/[roomId]/BottomHostControls.svelte";
import userEvent from "@testing-library/user-event";

describe("BottomBottomHostControls", () => {
  it("Renders 'Delete Room' button", () => {
    // When
    const { getByText } = render(BottomHostControls);

    // Then
    expect(() => getByText("Delete Room")).not.toThrow();
  });
  it("Shows a loading spinner if delete is clicked", async () => {
    // Given
    const user = userEvent.setup();

    // When
    const { getByText, getByTitle } = render(BottomHostControls);
    await user.click(getByText("Delete Room"));

    // Then
    expect(() => getByTitle("Loading")).toBeDefined();
  });
});
