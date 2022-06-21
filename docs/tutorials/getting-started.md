---
layout: page
title: Getting started
permalink: /tutorials/getting-started
---

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
written.

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
- [Vitest Runner](https://marketplace.visualstudio.com/items?itemName=kingwl.vscode-vitest-runner)
- [Playwright](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

Workspace settings should be configured to lint and format-on-save correctly.

## Running the code

### Backend

Follow [these instructions](https://docs.docker.com/get-docker/) to install Docker.

Follow [these instructions](https://www.pulumi.com/docs/get-started/aws/begin/) to install Pulumi, including the steps to install Node as the TypeScript language runtime.

Then run the infrastructure locally using localstack:

```
localstack start -d
pulumi stack select dev
pulumi up
```

### Frontend

To start the frontend server:

```bash
cd frontend
npm run dev
```

Browse to http://localhost:3000
