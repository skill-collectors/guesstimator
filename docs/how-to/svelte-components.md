---
layout: page
title: How to create Svelte components
permalink: /how-to/svelte-components
---

If you are new to Svelte, we recommend starting with [the official tutorial](https://svelte.dev/tutorial/basics). You can also learn a lot just reading through [the docs](https://svelte.dev/docs) and reviewing [the examples](https://svelte.dev/examples/hello-world).

## Create a new file

If you are making a whole new page, create a file at `src/routes/[page name].svelte` (example: `routes/my-page.svelte` will be available at `/my-page` when the app is running).

If you are making a new UI element to be used within a page, create a new file in `lib/components` (example: `lib/components/MyComponent.svelte`).

If you are creating a complex component that is composed of other sub-components, you can create a directory to contain it, like this:

```
lib/components
`-- MyComplexComponent
    |-- MyComplexComponent.svelte
    |-- SubComponent.svelte        // Only used by MyComplexComponent
    `-- AnotherSubComponent.svelte // Only used by MyComplexComponent
```

## Styling components

This project uses [Windi CSS](https://windicss.org/) for styling. Windi CSS is
a [utility-first](https://utilitycss.com/) CSS framework. It is compatible with
[Tailwinds](https://tailwindcss.com/) which means you can use [this
cheatsheet](https://tailwindcomponents.com/cheatsheet/).

Basically, instead of this:

```html
<button class="myButton">Click me!</button>
<style>
  .myButton {
    background-color: #047857; /* Green */
    border: none;
    color: white;
    padding: 1rem;
    text-align: center;
  }
</style>
```

You do this:

```html
<button class="bg-green-700 border-none text-white p-4 text-center">
  Click me!
</button>
```

[Why would we do this?]({{ site.baseurl }}/context/why-tech-stack#windi-css)

Because of this you will generally not create a `<style>` section in your component.

If you find yourself needing to repeat a set of classes over and over, you can create a shortcut in `windi.config.ts` (you can look at the existing shortcuts there for examples).

**NOTE:** Windi applies a CSS "reset" (see [Preflight](https://tailwindcss.com/docs/preflight)) so by default elements like `<h1>` or `<a>` _do not_ have any styles applied. This gives us a blank canvas to start from and avoids any browser-specific default styles. When you create a component, you will need to define your own style or consider using the shortcuts that are already defined in `windi.config.ts`.
