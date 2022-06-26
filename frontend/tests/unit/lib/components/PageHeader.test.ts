import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import Header from "$lib/components/PageHeader.svelte";

describe("Header", () => {
  it('Should say "Agile Planning Poker"', () => {
    const { getByText } = render(Header);

    expect(() => getByText(/Agile Planning Poker/i)).not.toThrow();
  });
});
