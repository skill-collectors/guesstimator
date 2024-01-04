---
layout: page
title: How to create Svelte components
permalink: /how-to/svelte-components
---

If you are new to Svelte, we recommend starting with [the official tutorial](https://svelte.dev/tutorial/basics). You can also learn a lot just reading through [the docs](https://svelte.dev/docs) and reviewing [the examples](https://svelte.dev/examples/hello-world). This application uses [SvelteKit](https://kit.svelte.dev/) which is an application framework built on top of Svelte to provide things like routing. Reading the [SvelteKit docs](https://kit.svelte.dev/docs/introduction) is also highly recommended.

## Create a new file

If you are making a whole new page, create a file at `src/routes/[page name]/+page.svelte` (example: `routes/my-page/+page.svelte` will be available at `/my-page` when the app is running). If you're not used to it, this file naming convention may seem unusual. [Read the docs](https://kit.svelte.dev/docs/routing).

If you are making a new UI element to be used in a single page, create a new file in `src/routes/[page name]` (example: `src/routes/[page name]/MyComponent.svelte`).

If you are making a new UI element to be used in multiple pages, create a new file in `src/lib/components` (example: `src/lib/components/MyComponent.svelte`).

If you are creating a complex component that is composed of other sub-components, you can create a directory to contain it, like this:

```
lib/components
`-- MyComplexComponent
    |-- MyComplexComponent.svelte
    |-- SubComponent.svelte        // Only used by MyComplexComponent
    `-- AnotherSubComponent.svelte // Only used by MyComplexComponent
```

## Styling components

**NOTE:** All components in the site should follow our [colorscheme](../context/frontend/colors.md).

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Tailwind CSS is
a [utility-first](https://utilitycss.com/) CSS framework. [This
cheatsheet](https://tailwindcomponents.com/cheatsheet/) is a very handy reference.

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

[Why would we do this?]({{ site.baseurl }}/context/why-tech-stack#tailwind-css)

Because of this you will generally not create a `<style>` section in your component.

### Base components

Tailwind applies a CSS "reset" (see [Preflight](https://tailwindcss.com/docs/preflight)) so by default elements like `<h1>` or `<a>` _do not_ have any styles applied. This gives us a blank canvas to start from and avoids problems when different browsers have different default styles.

We want the site to have a consistent look and feel, and we don't want to have to duplicate the same set of attributes on e.g. every single `<button>` tag. Instead, we have a set of "base components" (in `frontend/src/lib/components/base/`) that simply wrap basic HTML elements with consistent styling.

As a matter of course, the "base components" should be used, but if there is a specific reason for an element to look different in a specific context, it's okay to use e.g. a raw `<button>` in that case.
