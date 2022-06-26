# Contributing to agile-poker

Welcome to the agile-poker development community! We're glad you're here. This
document is designed to help you get your bearings and then to find something
fun to work on.

Have questions, or just want to say "Hi"? [Join the chat on
gitter.im](https://gitter.im/skill-collectors/agile-poker)!

## Getting started

If you're new to this project, your first stop should be our [Getting Started tutorial](https://skill-collectors.github.io/agile-poker/tutorials/getting-started).

## Getting things done

Once you have the project up and running on your device, check out the [list of beginner tasks](https://github.com/orgs/skill-collectors/projects/1/views/6) on our project board.

When you find a task you want to work on:

1. Ensure it is in "Ready" status.
1. Open it from this repo, or if you open it from the project board click "Open in new tab".
1. Set the project status to "In progress". and click "Create a branch" in the "Development" section on the right. Check out the new branch locally and do your work on that branch.
1. When you are ready for your work to be reviewed, open a PR and complete the contributor checklist. Do not add the PR to the `agile-poker backlog` project.

## If you have a feature idea or a bug report

First search the existing issues in this repository to make sure it's not a duplicate. If it does not exist already, please [create a new issue](https://github.com/skill-collectors/agile-poker/issues/new/choose) in this repository using one of the templates and set the "project" field to `agile-poker backlog`. Be sure to fill out all the information requested in the issue template. Do not create tasks directly on the project board.

## Best practices

### Tests

Unit test coverage should be as close to 100% as is reasonable. You can check
code coverage by running `npm run coverage`.

E2E tests should cover basic scenarios mostly for sanity checking after a
deploy or validating visual appearance.

### Styles

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
