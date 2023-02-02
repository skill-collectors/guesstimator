import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/svelte";
import NewUserForm from "$routes/rooms/[roomId]/NewUserForm.svelte";
import userEvent from "@testing-library/user-event";
import matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);

describe("NewUserForm", () => {
  function init() {
    const { component, getByRole } = render(NewUserForm);

    const clickHandler = vi.fn();
    component.$on("submit", clickHandler);

    const input = getByRole("textbox");
    const button = getByRole("button");

    return { clickHandler, input, button };
  }
  it("Does not submits if username is empty", async () => {
    // Given
    const { clickHandler, button } = init();

    // When
    await userEvent.click(button);

    // Then
    expect(clickHandler).not.toHaveBeenCalled();
  });
  it("Submits on button click", async () => {
    // Given
    const { clickHandler, button, input } = init();

    // When
    await userEvent.type(input, "My username");
    await userEvent.click(button);

    // Then
    expect(clickHandler).toHaveBeenCalled();
  });
  it("Truncates name at 30 characters", async () => {
    // Given
    const { clickHandler, button, input } = init();
    const typedName = "abcdefghijklmnopqrstuvwxyz01234567890";

    // When
    await userEvent.type(input, typedName);
    await userEvent.click(button);

    // Then
    const { username } = clickHandler.mock.calls[0][0].detail;
    expect(username).toBe(typedName.substring(0, 30));
  });
});
