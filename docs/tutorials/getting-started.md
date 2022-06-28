---
layout: page
title: Getting started
permalink: /tutorials/getting-started
---

## Required development software

You will need to install the following software to work on this project.

<!-- If you update this list, also update bootstrap.sh -->

1. [Node](https://nodejs.org/en/download/). We recommend the LTS version.
1. [Python3](https://www.python.org/downloads/).
1. [Docker](https://docs.docker.com/get-docker/).
1. [Pulumi](https://www.pulumi.com/docs/get-started/install/).
1. [Ruby](https://www.ruby-lang.org/en/downloads/).

## First steps

Clone the project

```bash
git clone https://github.com/dave-burke/agile-poker.git
```

Go to the project directory

```bash
cd agile-poker
```

Run the bootstrap script

```bash
./bootstrap.sh
```

This script should work on Linux and MacOS. A Windows script would need to be
written. As a workaround, you can read the script and execute the commands it
runs.

The bootstrap script is meant to be repeatable; if you run it a second time it
should not hurt anything. That means if we add something to it later, people
who already ran it before can just run it again to gain the additional setup.

## Set up your editor

The recommended IDE is [VSCode](https://code.visualstudio.com/), so you should
start by installing that. Select `File -> Open Workspace from File...` and
choose `.vscode/project.code-workspace`.

VSCode will offer to install the following recommended extensions:

- [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [WindiCSS Intellisense](https://marketplace.visualstudio.com/items?itemName=voorjaar.windicss-intellisense)
- [Vitest Runner](https://marketplace.visualstudio.com/items?itemName=kingwl.vscode-vitest-runner)
- [Playwright](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

Workspace settings should be configured to lint and format-on-save correctly. To test this:

1. Add a new line to any `.svelte` or `.ts` file like so: `const foo = 'bar'` and save the file.
2. Verify that the line was updated to `const foo = "bar";` and a warning is highlighted that `'foo' is assigned a value but never used.`

## Running the code

### Backend

Run the infrastructure locally using localstack:

```
cd infra
localstack start -d
pulumi stack select localdev
pulumi up
```

### Frontend

To start the frontend server:

```bash
cd frontend
npm run dev
```

Browse to http://localhost:3000
