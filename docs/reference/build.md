---

title: Deploy Pipeline
permalink: /reference/build
---

This page describes our build and deploy workflow:

## Pull Requests

When you open or push commits to a pull request, the app will be checked, built and deployed to:

[guesstimator-qa.superfun.link](https://guesstimator-qa.superfun.link)

E2E tests will be run against that URL.

## Merges to main

When you merge into `main`, the app will be checked, built and deployed to:

[guesstimator.superfun.link](https://guesstimator.superfun.link)

E2E tests will **not** be run against that URL.

**NOTE: That means that when you merge, your change goes to "prod" automatically.**

## Exceptions

Some steps will not run on forks:

- Steps requiring secrets (mostly because dependabot can't access secrets).
- Playwright will not run on forks (which would not deploy to our domain).

## Build and deploy flowchart

Below is a summary. `.github/workflows/cd.yml` is always the canonical source for how the build and deploy works.

1. Lint and unit test front and backends
2. Deploy infrastructure
3. Build the frontend
4. Sync the frontend to S3
5. Invalidate Cloudfront
6. Install and run Playwright tests
