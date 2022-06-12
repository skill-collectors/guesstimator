---
layout: page
title: Tech Stack
permalink: /reference/tech-stack
---

These are links to documentation about our tech stack.

- [Svelte](https://svelte.dev/docs) is our frontend component framework, similar to Vue or React
- [SvelteKit](https://kit.svelte.dev/docs/introduction) sits on top of Svelte and provides things like routing and server-side rendering (SSR)
- [TypeScript](https://www.typescriptlang.org/docs/) adds static types to JavaScript
- [Windi CSS](https://windicss.org/guide/) is a "utility-first" CSS framework
- [Vite](https://vitejs.dev/guide/) is what builds the frontend
- [Vitest](https://vitest.dev/guide/) is what we use to write unit tests
- [Playwright](https://playwright.dev/docs/intro) is what we use for end-to-end (e2e) testing.
- [Localstack](https://docs.localstack.cloud/overview/) allows us to "deploy" cloud resources (like Lambda and Dynamo) locally
- [Docker](https://docs.docker.com/) is used by localstack to mock AWS services
- [Pulumi](https://www.pulumi.com/docs/) is what deploys our backend cloud resources
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html) is how we build our web API
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) is how we route web API requests
- [AWS DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) is our database
