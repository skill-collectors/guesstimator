---
layout: page
title: How did we choose our tech stack?
permalink: /context/why-tech-stack
---

## Frontend

#### SvelteKit

[Svelte](svelte.dev/) seems to be [making a splash](https://2021.stateofjs.com/en-US/libraries/front-end-frameworks) on the front-end framework scene, so we wanted to see what all the fuss is about.

[SvelteKit](https://kit.svelte.dev/) provides an easy way to get up and running with a full application (routing, etc.).

#### Windi CSS

The idea of a "utility-first" CSS framwork [is compelling](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/). [Tailwind CSS](https://tailwindcss.com/) is a very popular utility-first framework. [Windi CSS](https://windicss.org/) is fully compatible with Tailwind (so all the tutorials and cheat sheets still apply), but is faster.

> Instead of generating all the combinations of utilities that you rarely used to purge later, Windi CSS only generates those actually presented in your codebase. This fits perfectly well with Vite’s on-demanded philosophy, and theoretically, it should be way much faster than Tailwind.

([Anthony Fu - Reimagine Atomic CSS](https://antfu.me/posts/reimagine-atomic-css))

## Backend

#### Pulumi

[Pulumi](https://www.pulumi.com/) provides "Infrastructure as Code" that is written as actual code instead of YAML or JSON. This allows the configuration to be more concise, more expressive, and more modular.

Alternatives in this space are AWS CDK and Terraform CDK. Pulumi is more cross-platform than the AWS CDK and more mature than the Terraform CDK. We also had existing projects using Pulumi, so it was easier to get up and running here.

#### AWS

It is a goal of this project to learn more about using AWS Lambda and DynamoDB, so that is what we use.
