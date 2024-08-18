---

title: How did we choose our tech stack?
permalink: /context/why-tech-stack
---

## Frontend

#### SvelteKit

[Svelte](svelte.dev/) seems to be [making a splash](https://2021.stateofjs.com/en-US/libraries/front-end-frameworks) on the front-end framework scene, so we wanted to see what all the fuss is about.

[SvelteKit](https://kit.svelte.dev/) provides an easy way to get up and running with a full application (routing, etc.).

#### Tailwind CSS

The idea of a "utility-first" CSS framwork [is compelling](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/). [Tailwind CSS](https://tailwindcss.com/) is a very popular utility-first framework. We used to use [Windi CSS](https://windicss.org/), but it has been [sunsetted](https://windicss.org/posts/sunsetting.html).

## Backend

#### Pulumi

[Pulumi](https://www.pulumi.com/) provides "Infrastructure as Code" that is written as actual code instead of YAML or JSON. This allows the configuration to be more concise, more expressive, and more modular.

Alternatives in this space are AWS CDK and Terraform CDK. Pulumi is more cross-platform than the AWS CDK and more mature than the Terraform CDK. We also had existing projects using Pulumi, so it was easier to get up and running here.

#### AWS

It is a goal of this project to learn more about using AWS Lambda and DynamoDB, so that is what we use.
