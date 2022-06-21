---
layout: page
title: Deploy Pipeline
permalink: /reference/build
---

This page describes our build and deploy workflow:

## Pull Requests

When you open or push commits to a pull request, the app will be checked, built and deployed to:

[agile-poker-qa.superfun.link](https://agile-poker-qa.superfun.link).

E2E tests will be run against that URL.

## Merges to main

When you merge into `main`, the app will be checked, built and deployed to:

[agile-poker.superfun.link](https://agile-poker.superfun.link).

E2E tests will **not** be run against that URL.

**NOTE: That means that when you merge, your change goes to "prod" automatically.**

## Build and deploy flowchart

If the flowchart below does not render, then GitHub pages doesn't support [Mermaid](https://mermaid-js.github.io/) syntax on GitHub pages yet. Maybe someday they will. Otherwise `.github/workflows/ci.yml` is always the canonical source for how the build and deploy works.

```mermaid
flowchart LR
  subgraph check-front [Check frontend]
  direction LR
    FC(Check TS) --> FL(Lint) --> FT(Unit Test)
  end
  subgraph check-infra [Check infrastructure]
  direction LR
    IL(Lint) --> IT(Unit Test)
  end
  subgraph deploy-infra [Deploy infrastructure]
  direction LR
    ID("Pulumi up")
  end
  subgraph deploy-front [Deploy frontend]
  direction LR
    FB("Build") --> FD("Deploy to AWS") --> FE("E2E tests")
  end

  check-infra --> deploy-infra
  check-front & deploy-infra --> deploy-front
```
