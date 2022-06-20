---
layout: page
title: Linting and Formatting
permalink: /context/linting-and-formatting
---

The project uses [eslint](https://eslint.org/) for linting and [prettier](https://prettier.io/) for formatting. Both the frontend and backend use the following configurations in their respective `.eslintrc` files:

- `eslint:recommended` for basic rules (See [rule list](https://eslint.org/docs/rules/))
- `plugin:@typescript-eslint/recommended` tweaks rules list for typescript (See [rule list](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts))
- `prettier` disables rules that conflict with prettier (via [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

Prettier...

editorconfig...

