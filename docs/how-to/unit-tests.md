---

title: How to write unit tests
permalink: /how-to/unit-tests
---

## General unit testing

This app uses [Vitest](https://vitest.dev/) for unit testing. It has a lot in common with other testing frameworks, and is compatible with different testing styles. A typical unit test might look like this:

```ts
import { describe, it, expect } from "vitest";

describe("Arithmetic", () => {
  it("Adds numbers", () => {
    // Given
    const [a, b] = [1, 2];

    // When
    const result = a + b;

    // Then
    expect(result).toBe(3);
  });
});
```

Some things to notice:

- Although Vitest supports defining tests with `test("name", func)`, we use `it`. The name of the test should complete the sentence "It..." to describe what the code under test does.
- Although Vitest supports Chai assertions (`assert.equal(result, 3, "message"))`), we use `expect` (like Jasmine or Jest).
- Wherever practical, test cases should be divided into Given (set up preconditions), When (run the test code), and Then (make assertions) sections. While this is more verbose, it makes the tests easier to read and reason about.

### Naming test files

Test files should always be named after the component they test, except that they have a `.test.ts` extension instead. If you are testing `MyComponent.svelte` then your test will be `MyComponent.test.ts`.

### Where to put tests?

Tests should go in the tests directory in a path that otherwise matches the path of the code under test. For example:

| To test                         | Put the test in                        |
| ------------------------------- | -------------------------------------- |
| `frontend/src/lib/myService.ts` | `frontend/tests/lib/myService.test.ts` |
| `infra/lib/MyResource.ts`       | `infra/tests/lib/MyResource.test.ts`   |

### Further reading

The [Vitest docs](https://vitest.dev/guide/) are great. Pay special attention to [Mocking](https://vitest.dev/guide/mocking.html), and don't be afraid to skim [the API](https://vitest.dev/api/).

## Svelte components

Svelte components can be tested using [testing-library](https://testing-library.com/) (specifically [svelte-testing-library](https://testing-library.com/docs/svelte-testing-library/intro)). Using this framework you can render a component, query the DOM and perform user actions. A typical test would look like this:

```ts
{ describe, it, expect } from 'vitest'
import { render } from "@testing-library/svelte";
import { MyComponent } from "$lib/MyComponent";
import userEvent from "@testing-library/user-event";

describe("MyComponent", async () => {
    it("Counts button clicks", () => {
        // Given
        const { getByText, getByRole } = render(MyComponent);
        const button = getByRole("button");

        // When
        await userEvent.click(button);

        // Then
        expect(getByText("1")).not.toThrow();
    });
});
```

### Verifying events

To verify that an event was handled, you need to add a Vitest mock function as the handler:

```ts
import { vi } from "vitest";

...

const { component, getByRole } = render(NewUserForm);

const clickHandler = vi.fn();
component.$on("submit", clickHandler);

expect(clickHandler).toHaveBeenCalled();
```

You can also capture the event payload like this:

```ts
const clickHandler = vi.fn();
component.$on("submit", (e) => clickHandler(e.detail.value));

expect(clickHandler).toHaveBeenCalledWith(expectedValue);
```

### Using jest-dom extended matchers

[jest-dom](https://github.com/testing-library/jest-dom) is a companion library for Testing Library that provides DOM-specific matchers like `toBeDisabled`, `toBeVisible`, or `toHaveTextContent`. To use it in Svelte/Vitest, you can import just the matchers and then extend `expect` (because Vitest `expect` is compatible with Jest `expect`):

```ts
import matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
```

Currently we do this in every test we want to use the matchers in, but if you can figure out a way to apply those matchers globally, please submit a PR!

## Pulumi resources

Unit testing Pulumi resources can be tricky, because you have to mock the framework correctly. See [this documentation](https://www.pulumi.com/docs/guides/testing/unit/), and search the code for `pulumi.runtime.setMocks` to see examples.

Once everything is mocked correctly, then the tests are pretty straightforward:

```ts
describe("MyResource", () => {
  it("Creates a DynamoDB table", async () => {
    // When
    const myResource = new MyResource("TestName");
    const someOutput = await new Promise((resolve) => {
      myResource.someOutput.apply((out) => resolve(out));
    });

    // Then
    expect(someOutput).toBe("SomeValue");
  });
});
```
