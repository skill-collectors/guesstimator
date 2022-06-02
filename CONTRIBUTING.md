# Contributing to agile-poker

If you'd like to join the project, see the project board for tasks that need to
be done. If you have a new idea, please use the chat to discuss it.

See the project wiki for detailed documentation of architecture, coding style, and best
practices.

## Recommended IDE Setup

The recommended IDE is [VSCode](https://code.visualstudio.com/). Select `File
-> Open Workspace from File...` and choose `.vscode/project.code-workspace`.

VSCode will offer to install the following recommended extensions:

- [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Workspace settings should be configured to lint and format-on-save correctly.

## Getting started

Clone the project

```bash
git clone https://github.com/dave-burke/agile-poker.git
```

Go to the project directory

```bash
cd agile-poker
```

Run the bootstrap script.

```bash
./bootstrap.sh
```

### Frontend

The web interface uses the [Svelte](https://svelte.dev/) framework with
[SveltKit](https://kit.svelte.dev/). If these are new to you, we recommend you
try the [Svelte tutorial](https://svelte.dev/tutorial/basics) and review the
[SvelteKit documentation](https://kit.svelte.dev/docs/introduction).

#### Quickstart guide

Start the frontend server

```bash
npm run dev --workspace=frontend
```

Browse to http://localhost:3000

#### Tests

The frontend uses [Vitest](https://vitest.dev/) for unit testing and
[Playwright](https://playwright.dev/) for end-to-end (e2e) testing.

Unit test coverage should be as close to 100% as is reasonable. E2E tests
should cover basic scenarios mostly for sanity checking after a deploy.

#### Styles

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

Why would you do this? [Read
this](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/)
for more context. The short answer is that it works well with scoped CSS in
component frameworks like Svelte.

### Infrastructure

This project uses [Pulumi](https://www.pulumi.com/) to create the necessary AWS
resources for the project. That includes S3/Cloudfront for the frontend and
Labmda/API Gateway/DynamoDB for the backend.

#### Local development

This project uses [LocalStack](https://localstack.cloud) to mock cloud services
locally using [Docker](https://docs.docker.com/).  This enables you to "deploy"
the infrastructure and run it locally to test without needing an AWS account or
even an internet connection!

If you ran `bootstrap.sh` successfully, then you should now have `localstack`
installed. Run the following commands to bring up the project infrastructure on
your localstack:

```
localstack start -d
pulumi stack select dev
pulumi up
```

#### Deploying to AWS

To deploy to AWS you need the [Pulumi](https://www.pulumi.com/) CLI and the the
[AWS CLI](https://aws.amazon.com/cli/) installed and configured.

Then you will need to run `pulumi up` for a stack other than dev.

