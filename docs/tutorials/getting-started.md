---
title: Getting started
permalink: /tutorials/getting-started
---

## Required development software

You will need to install the following software to work on this project.

<!-- If you update this list, also update bootstrap.sh -->

1. [Node](https://nodejs.org/en/download/). This project currently uses v18 (LTS).
1. [Pulumi](https://www.pulumi.com/docs/get-started/install/).

## Required accounts

### AWS

You will need to [create a new AWS account](https://portal.aws.amazon.com/billing/signup#/start/email) if you don't have one.

- If you create an IAM user for CLI access, ensure that it has the correct deploy permissions. The following policies should be sufficient, but could be a lot narrower if you wanted to figure that out:
  - `AWSCertificateManagerFullAccess`
  - `AWSLambda_FullAccess `
  - `AmazonAPIGatewayAdministrator`
  - `AmazonDynamoDBFullAccess`
  - `AmazonEventBridgeFullAccess`
  - `AmazonRoute53FullAccess`
  - `AmazonS3FullAccess`
  - `CloudFrontFullAccess`
  - `IAMFullAccess`

### Pulumi

You will need to [create a Pulumi account](https://app.pulumi.com/signup) if you don't already have one, and then follow [these instructions](https://www.pulumi.com/docs/get-started/aws/begin/) to install it locally and set it up to allow access to your AWS account.

## Clone the project

```bash
git clone https://github.com/skill-collectors/guesstimator.git
```

## Set up your editor

The recommended IDE is [VSCode](https://code.visualstudio.com/), so you should
start by installing that. Select `File -> Open Workspace from File...` and
choose `.vscode/project.code-workspace`.

VSCode will offer to install the following recommended extensions:

- [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS Intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Vitest Runner](https://marketplace.visualstudio.com/items?itemName=kingwl.vscode-vitest-runner)
- [Playwright](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

You should install all recommended dependencies.

Workspace settings should be configured to lint and format-on-save correctly. To test this:

1. Add a new line to any `.svelte` or `.ts` file like so: `const foo = 'bar'` and save the file.
2. Verify that the line was updated to `const foo = "bar";` and a warning is highlighted that `'foo' is assigned a value but never used.`
3. `git checkout .` to undo your test change.

## Running the code

Ensure that you have all the [required software](#required-development-software) and the [required accounts](#required-accounts).

### Backend

Update the `apexDomain` in `infra/lib/DomainName.ts` to specify a domain that you already own and have set up in Route53.

- Ideally the domain should be more externalized. This is a good opportunity to improve the codebase. Consider [creating a task](https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=&template=new-task.md&title=Externalize%20domain) on the project board and giving it a try.

Run the bootstrap script:

```bash
./bootstrap.sh
```

This script should work on Linux and MacOS. A Windows script would need to be written. As a workaround, you can read the script and execute the commands it runs.

The bootstrap script is meant to be repeatable; if you run it a second time it should not hurt anything. That means if we add something to it later, people who already ran it before can just run it again to gain the additional setup.

If everything completes without any errors, you should have a working backend available to use for development.

After you've run the `bootstrap.sh` script once, then you can run `deploy-dev.sh` to re-deploy. You only need to re-run `bootstrap.sh` if that script is updated or if you need to re-initialize your environment.

### Frontend

If you don't have a running backend instance, please go back and follow the [Backend](#backend) instructions first.

To start the frontend server:

```bash
cd frontend
npm run dev
```

<!-- This has to be an <a> tag so vitepress doesn't see it as a dead link -->

Browse to <a href="http://localhost:5173">localhost:5173</a>
