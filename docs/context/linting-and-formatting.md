---
layout: page
title: Linting and Formatting
permalink: /context/linting-and-formatting
---

The project uses [eslint](https://eslint.org/) for linting and [prettier](https://prettier.io/) for formatting, and this is enforced at build time.

If you open the project in VSCode and install the [recommended extensions]({{ site.baseurl }}/tutorials/getting-started#set-up-your-editor), then your code should be formatted and fixed automatically wheneer you save and eslint problems will be highlighted. Otherwise, you will need to run `npm run format` before you push or the build will fail.

Both the frontend and backend use the following configurations in their respective `.eslintrc` files:

- `eslint:recommended` for basic rules (See [rule list](https://eslint.org/docs/rules/))
- `plugin:@typescript-eslint/recommended` tweaks rules list for typescript (See [rule list](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts))
- `prettier` disables rules that conflict with prettier (via [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier))

Prettier uses the default settings. Each project contains an empty .prettierrc file in case users have `requireConfig` set to `true` on the [vscode extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

[editorconfig](https://editorconfig.org/) files are used to specify general defaults (which align with Prettier defaults). Using editorconfig provides some more standard hinting for editors other than VSCode, but unless your editor actually runs Prettier for you, you will need to run it manually before you push (see above).

## Debugging formatting problems in VSCode

If VSCode is not formatting code automatically, or correctly such that the build fails:

- Verify that you have all the recommended extensions intalled
- Verify that you have no global or user settings that override the workspace settings
  - One example is if you have a `defaultFormatter` configured for `[TypeScript]` which will have precedence over the workspace default formatter (prettier).
