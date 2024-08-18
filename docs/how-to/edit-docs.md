---
title: How to edit this documentation
permalink: /how-to/edit-docs
---

Everything in this documentation is a draft and subject to change. If you see something that is incorrect or needs clarification, please help us by updating it!

All of the pages on this site are just markdown files inside the ['docs' directory](https://github.com/skill-collectors/guesstimator/tree/main/docs) of the guesstimator project. You can edit them on your locally cloned copy of the project, or even in the GitHub UI. Just make your changes on a new branch and open a PR.

### Viewing the documentation locally

Our docs are built by [VitePress](https://vitepress.dev/). You can view them locally with `npm run docs:dev`.

### How these docs are organized

The different sections of this site are inspired by [the documentation system](https://documentation.divio.com/) described by Divio on their site. New content should be organized as follows:

- **Tutorials** that walk someone through a learning exercise go in the `tutorials` directory.
- **How-to guides** that explain how to perform a specific task go in the `how-to` directory.
- **Reference documentation** that provide technical descriptions go in the `reference` directory.
- **Explanation** and background infromation go in the `context` directory.

All pages should be linked from the home page `index.md` which serves as a table of contents for the site.
